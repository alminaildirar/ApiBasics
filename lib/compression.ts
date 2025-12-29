import { NextResponse } from "next/server";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

export async function compressResponse(
  data: string,
  acceptEncoding: string | null
): Promise<{ compressed: boolean; data: string | Buffer; encoding?: string }> {
  // Check if client accepts gzip
  const supportsGzip = acceptEncoding?.includes("gzip") ?? false;

  // Only compress if:
  // 1. Client supports gzip
  // 2. Data is larger than 1KB (compression overhead not worth it for small responses)
  const shouldCompress = supportsGzip && data.length > 1024;

  if (!shouldCompress) {
    return { compressed: false, data };
  }

  try {
    const compressed = await gzipAsync(Buffer.from(data, "utf-8"));
    return {
      compressed: true,
      data: compressed,
      encoding: "gzip",
    };
  } catch (error) {
    console.error("Compression error:", error);
    // Fallback to uncompressed on error
    return { compressed: false, data };
  }
}

/**
 * Create a NextResponse with optional compression
 */
export async function createCompressedResponse(
  data: unknown,
  status: number,
  headers: Record<string, string>,
  acceptEncoding: string | null
): Promise<NextResponse> {
  const jsonString = JSON.stringify(data);
  const result = await compressResponse(jsonString, acceptEncoding);

  const responseHeaders = new Headers(headers);

  if (result.compressed && result.encoding) {
    responseHeaders.set("Content-Encoding", result.encoding);
    responseHeaders.set("Vary", "Accept-Encoding");
    responseHeaders.set("Content-Type", "application/json");

    // Return compressed binary response (convert Buffer to Uint8Array)
    const buffer = result.data as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
      status,
      headers: responseHeaders,
    });
  }

  // Return regular JSON response
  return NextResponse.json(data, {
    status,
    headers: responseHeaders,
  });
}
