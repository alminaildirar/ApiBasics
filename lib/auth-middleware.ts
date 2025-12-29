import { NextRequest, NextResponse } from "next/server";

const VALID_API_KEYS = new Set([
  "demo-api-key-12345",
  "test-api-key-67890",
]);

export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "API key is required. Please provide 'x-api-key' header.",
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  if (!VALID_API_KEYS.has(apiKey)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message: "Invalid API key provided.",
        statusCode: 403,
      },
      { status: 403 }
    );
  }

  return null;
}
