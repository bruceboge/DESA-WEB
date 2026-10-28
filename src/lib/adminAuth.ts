import "server-only";
import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const ADMIN_SESSION_COOKIE = "desa_admin_access_token";

const ADMIN_IDLE_TIMEOUT_SECONDS = 15 * 60;
const ADMIN_ABSOLUTE_TIMEOUT_SECONDS = 8 * 60 * 60;

function getAuthConfig(): { url: string; anonKey: string } {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase Auth requires SUPABASE_URL and SUPABASE_ANON_KEY.");
  }
  return { url, anonKey };
}

function getAllowedAdminEmails(): Set<string> {
  const emails = process.env.ADMIN_EMAILS;
  if (!emails) {
    throw new Error("ADMIN_EMAILS must contain the allowed admin email addresses.");
  }
  const allowedEmails = new Set(
    emails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
  if (allowedEmails.size === 0) {
    throw new Error("ADMIN_EMAILS must contain at least one valid email address.");
  }
  return allowedEmails;
}

function createSupabaseAuthClient(): SupabaseClient {
  const { url, anonKey } = getAuthConfig();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function getCookie(request: Request, name: string): string | null {
  const cookie = (request.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(name.length + 1)) || null;
  } catch {
    return null;
  }
}

function getAccessToken(request: Request): string | null {
  return getCookie(request, ADMIN_SESSION_COOKIE);
}

function getAccessTokenHash(accessToken: string): string {
  return createHash("sha256").update(accessToken).digest("hex");
}

function isAllowedAdmin(email: string | undefined): email is string {
  return Boolean(
    email &&
      getAllowedAdminEmails().has(email.trim().toLowerCase())
  );
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<{ accessToken: string; maxAge: number } | null> {
  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.status === 400 || error.status === 401) return null;
    console.error("[adminAuth] Supabase Auth sign-in failed:", error.message);
    throw new Error("Admin sign-in service error. Please try again later.");
  }

  if (
    !data.session ||
    !data.user.email_confirmed_at ||
    !isAllowedAdmin(data.user.email)
  ) {
    return null;
  }

  const maxAge = Math.max(
    1,
    Math.min(data.session.expires_in, ADMIN_ABSOLUTE_TIMEOUT_SECONDS)
  );
  await createAdminSession(
    data.session.access_token,
    data.user.id,
    data.user.email!,
    maxAge
  );
  return { accessToken: data.session.access_token, maxAge };
}

export async function isAdminSessionValid(request: Request): Promise<boolean> {
  const accessToken = getAccessToken(request);
  if (!accessToken || accessToken.length > 4096) return false;

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) {
    if (error.status === 401 || error.status === 403) return false;
    console.error("[adminAuth] Supabase Auth session verification failed:", error.message);
    throw new Error("Admin session verification failed.");
  }

  const user = data.user;
  if (!user?.email_confirmed_at || !isAllowedAdmin(user.email)) return false;

  const now = new Date();
  const { data: activeSession, error: sessionError } = await getSupabaseAdmin()
    .from("portal_admin_sessions")
    .update({ last_activity_at: now.toISOString() })
    .eq("access_token_hash", getAccessTokenHash(accessToken))
    .is("revoked_at", null)
    .gt("expires_at", now.toISOString())
    .gt(
      "last_activity_at",
      new Date(now.getTime() - ADMIN_IDLE_TIMEOUT_SECONDS * 1000).toISOString()
    )
    .gt(
      "created_at",
      new Date(now.getTime() - ADMIN_ABSOLUTE_TIMEOUT_SECONDS * 1000).toISOString()
    )
    .select("access_token_hash")
    .maybeSingle();

  if (sessionError) {
    console.error("[adminAuth] Admin session DB verification failed:", sessionError.message);
    throw new Error("Admin session database verification failed.");
  }
  return Boolean(activeSession);
}

export async function revokeAdminSession(request: Request): Promise<void> {
  const accessToken = getAccessToken(request);
  if (!accessToken || accessToken.length > 4096) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("portal_admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("access_token_hash", getAccessTokenHash(accessToken))
    .is("revoked_at", null);
  if (error) {
    console.error("[adminAuth] Admin session DB revocation failed:", error.message);
    throw new Error("Admin session revocation failed.");
  }

  const { error: authError } = await supabase.auth.admin.signOut(accessToken, "local");
  if (authError && authError.status !== 401 && authError.status !== 403) {
    console.error("[adminAuth] Supabase Auth signOut failed:", authError.message);
    throw new Error("Admin sign-out failed.");
  }
}

export async function recordAdminAction(
  request: Request,
  action: string,
  resourceType?: string,
  resourceId?: string
): Promise<void> {
  const accessToken = getAccessToken(request);
  if (!accessToken || accessToken.length > 4096) {
    throw new Error("Could not record admin action: the session token is missing.");
  }

  const supabase = getSupabaseAdmin();
  const { data: session, error: sessionError } = await supabase
    .from("portal_admin_sessions")
    .select("auth_user_id,email")
    .eq("access_token_hash", getAccessTokenHash(accessToken))
    .is("revoked_at", null)
    .maybeSingle();
  if (sessionError) {
    console.error("[adminAuth] Could not identify admin action actor:", sessionError.message);
    throw new Error("Could not identify admin action actor.");
  }
  if (!session) {
    throw new Error("Could not record admin action: session not found.");
  }

  const { error } = await supabase.from("portal_admin_audit_events").insert({
    actor_user_id: session.auth_user_id,
    actor_email: session.email,
    action,
    resource_type: resourceType || null,
    resource_id: resourceId || null,
  });
  if (error) {
    console.error("[adminAuth] Could not record admin action:", error.message);
    throw new Error("Could not record admin audit action.");
  }
}

export async function checkAdminLoginRateLimit(
  ip: string,
  email: string
): Promise<boolean> {
  const buckets = [`ip:${ip || "unknown"}`];
  if (email) buckets.push(`email:${email.trim().toLowerCase()}`);

  for (const bucket of buckets) {
    const bucketKey = createHash("sha256").update(bucket).digest("hex");
    const { data, error } = await getSupabaseAdmin().rpc("check_admin_auth_rate_limit", {
      p_bucket_key: bucketKey,
      p_limit: 8,
      p_window_seconds: 60,
    });
    if (error) {
      console.error("[adminAuth] Could not check admin sign-in rate limit:", error.message);
      throw new Error("Rate limit check failed.");
    }
    if (data !== true) return false;
  }
  return true;
}

async function createAdminSession(
  accessToken: string,
  userId: string,
  email: string,
  maxAge: number
): Promise<void> {
  const now = new Date();
  const { error } = await getSupabaseAdmin().from("portal_admin_sessions").insert({
    access_token_hash: getAccessTokenHash(accessToken),
    auth_user_id: userId,
    email: email.trim().toLowerCase(),
    created_at: now.toISOString(),
    last_activity_at: now.toISOString(),
    expires_at: new Date(now.getTime() + maxAge * 1000).toISOString(),
  });
  if (error) {
    console.error("[adminAuth] Could not create admin application session:", error.message);
    throw new Error("Could not initialize admin session.");
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
