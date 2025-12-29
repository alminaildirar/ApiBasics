import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { checkRateLimit } from "@/lib/rate-limit-middleware";
import { cache } from "@/lib/cache";
import { generateETag, checkETag } from "@/lib/etag";
import { createCompressedResponse } from "@/lib/compression";

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;
    const limitParam = searchParams.get("limit");

    // Parse and validate limit
    let limit = 10; // Default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return NextResponse.json(
          {
            success: false,
            error: "Bad Request",
            message: "Invalid limit parameter: must be between 1 and 50",
            statusCode: 400,
          },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Check cache
    const cacheKey = `posts:infinite:${cursor || "start"}:${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const cachedBody = JSON.stringify(cachedData);
      const cachedETag = generateETag(cachedBody);

      const ifNoneMatch = request.headers.get("if-none-match");
      if (checkETag(ifNoneMatch, cachedETag)) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: `"${cachedETag}"`,
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
          ETag: `"${cachedETag}"`,
          "Cache-Control": "private, max-age=300",
        },
        acceptEncoding
      );
    }

    // Get posts with cursor
    const { posts, nextCursor, hasMore } = dataStore.getPostsWithCursor(
      cursor,
      limit
    );

    const response = {
      success: true,
      data: posts,
      nextCursor,
      hasMore,
      message: "Posts retrieved successfully",
    };

    // Cache for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000);

    const responseBody = JSON.stringify(response);
    const etag = generateETag(responseBody);

    const ifNoneMatch = request.headers.get("if-none-match");
    if (checkETag(ifNoneMatch, etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: `"${etag}"`,
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
        ETag: `"${etag}"`,
        "Cache-Control": "private, max-age=300",
      },
      acceptEncoding
    );
  } catch (error) {
    console.error("GET /api/posts/infinite error:", error);

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
