import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { generateToken } from "@/lib/jwt";

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Username and password are required",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const user = userStore.validateCredentials(body.username, body.password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid username or password",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.username);

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Invalid JSON in request body",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process login",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
