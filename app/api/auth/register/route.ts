import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { checkRateLimit } from "@/lib/rate-limit-middleware";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { username, password, email } = body;

    // Validation
    if (!username || !password || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Username, password, and email are required",
        },
        { status: 400 }
      );
    }

    // Username validation
    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Username must be between 3 and 20 characters",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    if (userStore.findByUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          message: "Username already exists",
        },
        { status: 409 }
      );
    }

    // Check if email already exists
    if (userStore.findByEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // Create user
    const newUser = userStore.createUser(username, password, email);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to register user",
      },
      { status: 500 }
    );
  }
}
