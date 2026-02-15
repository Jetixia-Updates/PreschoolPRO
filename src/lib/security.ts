import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting using in-memory store
 * For production, use Redis-based rate limiting
 */
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number } {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitStore.set(ip, { count: 1, lastReset: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Create security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.openai.com",
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log audit trail entry
 * In production, this should write to a separate audit log table
 */
export function logAuditTrail({
  userId,
  action,
  resource,
  resourceId,
  details,
}: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}) {
  // In production, write to database audit_log table
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      resourceId,
      details,
    })
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return "****";
  return data.substring(0, visibleChars) + "****";
}
