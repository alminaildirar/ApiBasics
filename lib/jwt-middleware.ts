import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function validateJWT(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Authorization header is required",
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Invalid authorization header format. Use 'Bearer <token>'",
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  const token = parts[1];
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Invalid or expired token",
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  return null;
}
