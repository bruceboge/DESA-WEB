interface SyncEvent {
  id: number;
  record_id: string;
  record_type: string;
  operation: "upsert" | "delete";
  payload: Record<string, unknown>;
}

interface AppsScriptResponse {
  status?: string;
  error?: string;
}

const responseHeaders = { "Content-Type": "application/json" };

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required Edge Function secret: ${name}`);
  return value;
}

function matchesSecret(provided: string, expected: string): boolean {
  let difference = provided.length ^ expected.length;
  const length = Math.max(provided.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (provided.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

async function callRpc<T>(
  name: string,
  body: Record<string, unknown>
): Promise<T | undefined> {
  const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Supabase RPC ${name} failed with HTTP ${response.status}.`);
  }
  const responseBody = await response.text();
  return responseBody ? (JSON.parse(responseBody) as T) : undefined;
}

async function deliverToAppsScript(event: SyncEvent): Promise<void> {
  const scriptUrl = new URL(requiredEnv("APPS_SCRIPT_URL"));
  if (
    scriptUrl.protocol !== "https:" ||
    scriptUrl.hostname !== "script.google.com" ||
    !/^\/macros\/s\/[^/]+\/exec\/?$/.test(scriptUrl.pathname)
  ) {
    throw new Error("APPS_SCRIPT_URL must be an HTTPS Google Apps Script deployment URL.");
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "syncRecord",
      secret: requiredEnv("APPS_SCRIPT_SECRET"),
      recordId: event.record_id,
      recordType: event.record_type,
      operation: event.operation,
      record: event.payload,
    }),
    signal: AbortSignal.timeout(30000),
  });

  const result = (await response.json().catch(() => null)) as AppsScriptResponse | null;
  if (!response.ok || result?.status !== "success") {
    throw new Error(
      result?.error || `Apps Script returned HTTP ${response.status} or an invalid response.`
    );
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const expectedSecret = requiredEnv("SHEETS_SYNC_FUNCTION_SECRET");
    const providedSecret = request.headers.get("x-sync-secret") || "";
    if (!matchesSecret(providedSecret, expectedSecret)) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    requiredEnv("APPS_SCRIPT_URL");
    requiredEnv("APPS_SCRIPT_SECRET");
    const claimedEvents = await callRpc<SyncEvent[]>("claim_sheet_sync_events", { p_limit: 10 });
    if (claimedEvents !== undefined && !Array.isArray(claimedEvents)) {
      throw new Error("Supabase returned an invalid Sheets outbox response.");
    }
    const events = claimedEvents || [];
    let delivered = 0;
    let failed = 0;

    for (const event of events) {
      let success = false;
      let errorMessage: string | null = null;

      try {
        await deliverToAppsScript(event);
        success = true;
        delivered += 1;
      } catch (error) {
        failed += 1;
        errorMessage =
          error instanceof Error ? error.message.slice(0, 500) : "Unknown Apps Script error.";
        console.error(`Sheets delivery failed for outbox event ${event.id}: ${errorMessage}`);
      }

      await callRpc("finish_sheet_sync_event", {
        p_event_id: event.id,
        p_success: success,
        p_error: errorMessage,
      });
    }

    return jsonResponse({ processed: events.length, delivered, failed });
  } catch (error) {
    console.error("Sheets sync function failed:", error);
    return jsonResponse({ error: "Sheets sync could not be completed." }, 500);
  }
});
