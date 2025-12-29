import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { BlogPostsResponse, BlogPostResponse, CreateBlogPostDTO } from "@/types/blog";
import { validateApiKey } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const posts = dataStore.getAllPosts();
    const total = dataStore.getTotalCount();

    const response: BlogPostsResponse = {
      success: true,
      data: posts,
      total,
      message: "Posts retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/protected/posts error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to retrieve posts",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body: CreateBlogPostDTO = await request.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Missing required fields: title and description are required",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (typeof body.title !== "string" || typeof body.description !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Invalid data types: title and description must be strings",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (body.title.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Title must be at least 3 characters long",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (body.description.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Description must be at least 10 characters long",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const newPost = dataStore.createPost(body.title.trim(), body.description.trim());

    const response: BlogPostResponse = {
      success: true,
      data: newPost,
      message: "Post created successfully",
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
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

    console.error("POST /api/protected/posts error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to create post",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
