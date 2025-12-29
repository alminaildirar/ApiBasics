import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./rate-limiter";

export function checkRateLimit(request: NextRequest): NextResponse | null {
  // Get client identifier (IP address)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const result = rateLimiter.check(ip);

  // Add rate limit headers
  const headers = {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  };

  // Rate limit exceeded
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  // Return null if allowed (no response to send)
  return null;
}
