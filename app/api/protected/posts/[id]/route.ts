import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { BlogPostResponse, UpdateBlogPostDTO } from "@/types/blog";
import { validateApiKey } from "@/lib/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const post = dataStore.getPostById(id);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Post with ID '${id}' not found`,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    const response: BlogPostResponse = {
      success: true,
      data: post,
      message: "Post retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/protected/posts/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to retrieve post",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body: UpdateBlogPostDTO = await request.json();

    if (!body.title && !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "At least one field (title or description) must be provided",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (body.title !== undefined && typeof body.title !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Title must be a string",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (body.description !== undefined && typeof body.description !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Description must be a string",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (body.title !== undefined && body.title.trim().length < 3) {
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

    if (body.description !== undefined && body.description.trim().length < 10) {
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

    const updatedPost = dataStore.updatePost(id, body.title?.trim(), body.description?.trim());

    if (!updatedPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Post with ID '${id}' not found`,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    const response: BlogPostResponse = {
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
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

    console.error("PUT /api/protected/posts/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to update post",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = dataStore.deletePost(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Post with ID '${id}' not found`,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/protected/posts/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to delete post",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
