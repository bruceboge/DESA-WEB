/**
 * Anti-Spam & Input Validation Library for DESA Web Application
 * Protects Google Sheets from spam bots, rate limit exhaustion, formula injection, and invalid payloads.
 */

// In-memory IP submission rate limiter (per-route bucket)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean expired rate limit records periodically
function pruneRateLimitMap() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
/**
 * Check if a submission is within allowed velocity limits.
 * Supports:
 * 1. Single-identity spam loop protection (same reg number or email).
 * 2. Shared Campus Wi-Fi NAT support (comfortably handles 100+ concurrent distinct students on the same campus IP).
 *
 * @param ip Client IP address
 * @param route Route identifier (e.g. "contact", "register", "roll-call")
 * @param maxIpRequests Maximum burst requests allowed per IP in the window (default: 150 for campus networks)
 * @param windowSeconds Window length in seconds (default: 60)
 * @param identifier Optional identity key (e.g. student regNumber or email) to stop single-identity spam
 * @param maxIdentityRequests Maximum requests allowed for the same identifier in window (default: 3)
 */
export function checkRateLimit(
  ip: string,
  route: string,
  maxIpRequests = 150,
  windowSeconds = 60,
  identifier?: string,
  maxIdentityRequests = 3
): { allowed: boolean; remaining: number; retryAfter?: number; reason?: string } {
  pruneRateLimitMap();
  const now = Date.now();

  // 1. If an individual identity is provided (e.g. reg number or email), check identity bucket
  if (identifier && typeof identifier === "string" && identifier.trim().length > 0) {
    const cleanId = identifier.trim().toUpperCase();
    const idKey = `${route}:id:${cleanId}`;
    const idEntry = rateLimitMap.get(idKey);

    if (!idEntry || now > idEntry.resetTime) {
      rateLimitMap.set(idKey, {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      });
    } else if (idEntry.count >= maxIdentityRequests) {
      const retryAfter = Math.ceil((idEntry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        reason: `Submission limit reached for ${cleanId}. Please wait ${retryAfter}s before submitting again.`,
      };
    } else {
      idEntry.count += 1;
    }
  }

  // 2. Check the IP burst bucket (allows up to 150 concurrent distinct students from the same campus Wi-Fi)
  const ipKey = `${route}:ip:${ip || "unknown"}`;
  const ipEntry = rateLimitMap.get(ipKey);

  if (!ipEntry || now > ipEntry.resetTime) {
    rateLimitMap.set(ipKey, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: maxIpRequests - 1 };
  }

  if (ipEntry.count >= maxIpRequests) {
    const retryAfter = Math.ceil((ipEntry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      reason: `Network limit reached. Please wait ${retryAfter}s before sending again.`,
    };
  }

  ipEntry.count += 1;
  return { allowed: true, remaining: maxIpRequests - ipEntry.count };
}

// In-memory deduplication cache: keeps track of recently processed IDs to prevent duplicate row writes
const recentSubmissions = new Map<string, number>();

/**
 * Check if a submission is a rapid duplicate (e.g. user double-clicked submit,
 * or browser re-transmitted the POST).
 * @param key Unique key for the submission (e.g. "C025-01-1234/2023:2026-09-28")
 * @param windowMs Time window in milliseconds (default: 15 seconds)
 */
export function isDuplicateSubmission(key: string, windowMs = 15000): boolean {
  if (!key) return false;
  const now = Date.now();
  const existingTime = recentSubmissions.get(key);

  if (existingTime && now - existingTime < windowMs) {
    return true;
  }

  recentSubmissions.set(key, now);

  // Periodically clean entries older than 30s
  if (recentSubmissions.size > 200) {
    for (const [k, timestamp] of recentSubmissions.entries()) {
      if (now - timestamp > 30000) {
        recentSubmissions.delete(k);
      }
    }
  }

  return false;
}

/**
 * Dispatch payload to Google Apps Script cleanly ONCE.
 *
 * IMPORTANT: Because Google Apps Script appends rows to a spreadsheet,
 * row insertion is NOT idempotent. Retrying a request that has already been dispatched
 * to Google Apps Script causes duplicate rows to be logged if Google's server takes longer
 * than a short timeout.
 *
 * We use a realistic 30-second timeout to allow Google Apps Script to cold-start,
 * acquire its lock, and write the row without being cut off prematurely.
 *
 * @param scriptUrl The Google Apps Script deployment URL
 * @param payload Record payload to forward
 * @param timeoutMs Request timeout in milliseconds (default: 30000)
 */
export async function sendToGoogleSheets(
  scriptUrl: string,
  payload: unknown,
  timeoutMs = 30000
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.ok) {
      return { ok: true, status: response.status };
    }

    return {
      ok: false,
      status: response.status,
      error: `Google Apps Script returned HTTP ${response.status}`,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Google Sheets request timed out" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach Google Sheets",
    };
  }
}

// Backward-compatible alias
export const sendToGoogleSheetsWithRetry = sendToGoogleSheets;

/**
 * Get client IP from standard Next.js request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check if the honeypot field was filled by an automated bot.
 */
export function isHoneypotTriggered(honeypotValue?: unknown): boolean {
  if (typeof honeypotValue === "string" && honeypotValue.trim().length > 0) {
    return true;
  }
  return false;
}

/**
 * Neutralize CSV / Google Sheets Formula Injection attacks.
 * If a cell string starts with '=', '+', '-', or '@', prepend a single quote (')
 * so Google Sheets safely treats it as literal text rather than an executable formula.
 */
export function sanitizeForSheets(str: string): string {
  if (!str) return "";
  const trimmed = str.trim();
  if (/^[=+\-@]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Validate a student or sender full name.
 * Disallows URLs, HTML tags, control characters, and pure numbers.
 */
export function isValidName(name: string): { valid: boolean; reason?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, reason: "Full name is required." };
  }

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, reason: "Name must be at least 2 characters." };
  }
  if (trimmed.length > 70) {
    return { valid: false, reason: "Name must not exceed 70 characters." };
  }

  // Reject URLs inside names
  if (/(https?:\/\/|www\.|\.com|\.org|\.ru|\.xyz)/i.test(trimmed)) {
    return { valid: false, reason: "Name cannot contain links or URLs." };
  }

  // Reject HTML or script tags
  if (/[<>{}]/.test(trimmed)) {
    return { valid: false, reason: "Name cannot contain special HTML characters." };
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, reason: "Name must contain letters." };
  }

  // Allow letters, spaces, apostrophes, hyphens, and dots
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { valid: false, reason: "Name contains invalid characters." };
  }

  return { valid: true };
}

/**
 * Validate standard email addresses.
 */
export function isValidEmail(email: string): { valid: boolean; reason?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email address is required." };
  }

  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 100) {
    return { valid: false, reason: "Email length must be between 5 and 100 characters." };
  }

  // Standard email structure check with at least 2 character top-level domain
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: "Please provide a valid email address." };
  }

  // Reject spaces or invalid characters
  if (/\s/.test(trimmed)) {
    return { valid: false, reason: "Email cannot contain whitespace." };
  }

  return { valid: true };
}

/**
 * Validate DeKUT Student Registration Number.
 * Standard format: C025-01-1234/2023 or general academic code format.
 */
export function isValidRegNumber(regNo: string): { valid: boolean; reason?: string } {
  if (!regNo || typeof regNo !== "string") {
    return { valid: false, reason: "Registration number is required." };
  }

  const trimmed = regNo.trim().toUpperCase();
  if (trimmed.length < 6 || trimmed.length > 30) {
    return { valid: false, reason: "Registration number must be between 6 and 30 characters." };
  }

  // Reject common spam test entries
  const blocklist = ["ASDF", "TEST", "1234", "NONE", "NULL", "UNDEFINED", "FAKE", "STUDENT", "ABCDEF"];
  if (blocklist.includes(trimmed)) {
    return { valid: false, reason: "Please enter your genuine university registration number." };
  }

  // Reject URLs or HTML
  if (/[<>/{}]/i.test(trimmed.replace("/", ""))) {
    return { valid: false, reason: "Invalid registration number format." };
  }

  // Standard DeKUT format pattern (e.g. C025-01-1234/2022) or general university code format
  // Allows department codes (C025, C026, E020, E021, E022, etc.) followed by cohort, admission, and year
  const deKutPattern = /^[A-Z0-9]{3,6}-[0-9]{2}-[0-9]{3,5}\/[0-9]{4}$/;
  // Fallback pattern for diploma/postgrad/staff/guest formats
  const generalPattern = /^[A-Z0-9/_-]{6,30}$/;

  if (!deKutPattern.test(trimmed) && !generalPattern.test(trimmed)) {
    return { valid: false, reason: "Registration number format should resemble C025-01-1234/2023." };
  }

  return { valid: true };
}

/**
 * Validate phone number (optional or required).
 */
export function isValidPhone(phone?: string): { valid: boolean; reason?: string } {
  if (!phone || phone.trim() === "" || phone === "Not provided") {
    return { valid: true };
  }

  const trimmed = phone.trim();
  if (trimmed.length < 9 || trimmed.length > 20) {
    return { valid: false, reason: "Phone number must be between 9 and 20 digits." };
  }

  // Check for letters or URLs
  if (/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, reason: "Phone number cannot contain letters." };
  }

  // Clean allowed chars (+, -, spaces, parentheses, numbers)
  if (!/^[+0-9\s\-()]+$/.test(trimmed)) {
    return { valid: false, reason: "Phone number contains invalid characters." };
  }

  // Count actual digits
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 9 || digitCount > 15) {
    return { valid: false, reason: "Phone number must contain between 9 and 15 numbers." };
  }

  return { valid: true };
}

/**
 * Detect spam content in contact messages or subjects.
 */
export function isSpamContent(text: string, isSubject = false): { isSpam: boolean; reason?: string } {
  if (!text || typeof text !== "string") {
    return { isSpam: false };
  }

  const trimmed = text.trim();

  // Excessive URLs check
  const urlMatches = trimmed.match(/https?:\/\/|www\./gi) || [];
  if (isSubject && urlMatches.length > 0) {
    return { isSpam: true, reason: "Subjects cannot contain website links." };
  }
  if (!isSubject && urlMatches.length > 2) {
    return { isSpam: true, reason: "Message contains too many links." };
  }

  // HTML or script injection check
  if (/<script|<iframe>|<object|<embed|<form|javascript:|data:/i.test(trimmed)) {
    return { isSpam: true, reason: "Message cannot contain script or HTML tags." };
  }

  // Known spam keywords / scams
  const spamKeywords = [
    "casino",
    "viagra",
    "cialis",
    "crypto giveaway",
    "bitcoin profit",
    "whatsapp group link",
    "free money",
    "sugar mummy",
    "sugar daddy",
    "porn",
    "loans approved without credit",
    "seo ranking service",
    "buy backlinks",
    "click here to win",
  ];

  const lower = trimmed.toLowerCase();
  for (const keyword of spamKeywords) {
    if (lower.includes(keyword)) {
      return { isSpam: true, reason: "Message triggered spam content filter." };
    }
  }

  // Repetitive character spam (e.g. aaaaaaaaaaaaa)
  if (/(.)\1{14,}/.test(trimmed)) {
    return { isSpam: true, reason: "Message contains repetitive spam characters." };
  }

  return { isSpam: false };
}

/**
 * Return the current date formatted in Kenya/Nairobi time (Africa/Nairobi - UTC+3)
 * @returns "YYYY-MM-DD" e.g. "2026-09-28"
 */
export function getNairobiDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Return the current time formatted in Kenya/Nairobi time (Africa/Nairobi - UTC+3)
 * @returns "hh:mm AM/PM" e.g. "07:25 PM"
 */
export function getNairobiTime(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Return human-readable date in Nairobi time (e.g. "28 Sep 2026")
 */
export function getNairobiHumanDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
