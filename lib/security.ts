/**
 * Security utilities for API protection
 * Best practices for secure web applications
 */

import { NextRequest } from "next/server";

/**
 * Rate limiting configuration
 * Prevents abuse by limiting requests per IP
 */
export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Limit each IP to 100 requests per windowMs
};

/**
 * Input sanitization
 * Prevents XSS attacks by removing potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .trim();
}

/**
 * Validate request origin
 * Ensures requests come from allowed origins only
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[];

  if (!origin) return true; // Same-origin requests don't have Origin header

  return allowedOrigins.includes(origin);
}

/**
 * Password validation
 * Ensures strong password requirements
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
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
 * SQL Injection prevention
 * Escapes special characters in user input
 */
export function escapeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "");
}

/**
 * Generate secure random token
 * For CSRF protection, API keys, etc.
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return token;
}

/**
 * Check if request is suspicious
 * Basic heuristics for detecting potential attacks
 */
export function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  // Check for common attack patterns
  const suspiciousPatterns = [
    /sql/i,
    /union/i,
    /select/i,
    /<script/i,
    /javascript:/i,
    /onerror/i,
    /onload/i,
  ];

  const url = request.url;

  return suspiciousPatterns.some(
    (pattern) => pattern.test(url) || pattern.test(userAgent) || pattern.test(referer)
  );
}

/**
 * Log security events
 * For monitoring and incident response
 */
export function logSecurityEvent(event: {
  type: "authentication" | "authorization" | "validation" | "attack";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
}) {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
  };

  // In production, send to logging service (e.g., Sentry, LogRocket)
  console.log("[SECURITY]", JSON.stringify(logEntry, null, 2));
}
