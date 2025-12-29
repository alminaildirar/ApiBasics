import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import {
  BlogPostsResponse,
  BlogPostResponse,
  CreateBlogPostDTO,
} from "@/types/blog";
import { checkRateLimit } from "@/lib/rate-limit-middleware";
import { cache } from "@/lib/cache";
import { generateETag, checkETag } from "@/lib/etag";
import { createCompressedResponse } from "@/lib/compression";

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const cacheKey = `posts:${pageParam || "all"}:${limitParam || "all"}`;

    const cachedData = cache.get<BlogPostsResponse>(cacheKey);
    if (cachedData) {
      // Generate ETag for cached data
      const cachedBody = JSON.stringify(cachedData);
      const cachedETag = generateETag(cachedBody);

      // Check if client has the same version
      const ifNoneMatch = request.headers.get("if-none-match");
      if (checkETag(ifNoneMatch, cachedETag)) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            "ETag": `"${cachedETag}"`,
            "Cache-Control": "private, max-age=300",
          },
        });
      }

      const acceptEncoding = request.headers.get("accept-encoding");
      return createCompressedResponse(
        cachedData,
        200,
        {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "ETag": `"${cachedETag}"`,
          "Cache-Control": "private, max-age=300",
        },
        acceptEncoding
      );
    }

    // Parse and validate pagination parameters
    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Validate pagination parameters
    if (page !== undefined && (isNaN(page) || page < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Invalid page parameter: must be a positive integer",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Invalid limit parameter: must be between 1 and 100",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const posts = dataStore.getAllPosts(page, limit);
    const total = dataStore.getTotalCount();

    // Calculate pagination metadata
    const currentPage = page || 1;
    const itemsPerPage = limit || total;
    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const hasNextPage = page && limit ? currentPage < totalPages : false;
    const hasPreviousPage = page ? currentPage > 1 : false;

    const response: BlogPostsResponse = {
      success: true,
      data: posts,
      total: total,
      message: "Posts retrieved successfully",
      pagination: {
        currentPage,
        itemsPerPage,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPreviousPage,
      },
    };

    // Store in cache (5 minutes TTL)
    cache.set(cacheKey, response, 5 * 60 * 1000);

    // Generate ETag for cache validation
    const responseBody = JSON.stringify(response);
    const etag = generateETag(responseBody);

    // Check if client has the same version (If-None-Match header)
    const ifNoneMatch = request.headers.get("if-none-match");
    if (checkETag(ifNoneMatch, etag)) {
      // Content hasn't changed, return 304 Not Modified
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": `"${etag}"`,
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    const acceptEncoding = request.headers.get("accept-encoding");
    return createCompressedResponse(
      response,
      200,
      {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
        "ETag": `"${etag}"`,
        "Cache-Control": "private, max-age=300",
      },
      acceptEncoding
    );
  } catch (error) {
    console.error("GET /api/posts error:", error);

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
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const body: CreateBlogPostDTO = await request.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message:
            "Missing required fields: title and description are required",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (
      typeof body.title !== "string" ||
      typeof body.description !== "string"
    ) {
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

    const newPost = dataStore.createPost(
      body.title.trim(),
      body.description.trim()
    );

    // Invalidate all posts cache
    cache.invalidatePattern("^posts:");

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

    console.error("POST /api/posts error:", error);

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
