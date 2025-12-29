import crypto from "crypto";

/**
 * Generate ETag from content
 * ETag is a hash of the response content used for cache validation
 */
export function generateETag(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

/**
 * Check if ETag matches the If-None-Match header
 * Returns true if content hasn't changed (304 should be returned)
 */
export function checkETag(
  ifNoneMatch: string | null,
  currentETag: string
): boolean {
  if (!ifNoneMatch) return false;

  // Handle multiple ETags in If-None-Match header
  const etags = ifNoneMatch.split(",").map((tag) => tag.trim());

  // Check if any of the ETags match
  return etags.includes(currentETag) || etags.includes(`"${currentETag}"`);
}
