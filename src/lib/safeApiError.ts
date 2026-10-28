import { NextResponse } from "next/server";

/**
 * Standardized, safe error response handler for all DESA API endpoints.
 * Ensures internal database messages, stack traces, and backend infrastructure
 * details are logged server-side only and never leaked to client responses.
 */
export function safeApiError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again later.",
  statusCode = 500,
  context?: string
): NextResponse {
  const timestamp = new Date().toISOString();
  const contextPrefix = context ? `[${context}] ` : "";

  // Always log full diagnostic detail securely to server logs
  if (error instanceof Error) {
    console.error(`${contextPrefix}Server error (${timestamp}):`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  } else {
    console.error(`${contextPrefix}Server error (${timestamp}):`, error);
  }

  // Determine a sanitized, user-safe message
  let sanitizedMessage = fallbackMessage;

  if (error instanceof Error) {
    const msg = error.message;

    // Preserve known safe user-facing validation errors while filtering backend leaks
    if (
      msg.includes("Registration number already exists") ||
      msg.includes("already registered") ||
      msg.includes("Invalid credentials") ||
      msg.includes("Rate limit exceeded") ||
      msg.includes("Session expired") ||
      msg.includes("Unauthorized")
    ) {
      sanitizedMessage = msg;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: sanitizedMessage,
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
