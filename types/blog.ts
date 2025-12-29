// Blog Post TypeScript Types and Interfaces

/**
 * Represents a single blog post
 * @interface BlogPost
 */
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new blog post
 * (without id and timestamps)
 */
export interface CreateBlogPostDTO {
  title: string;
  description: string;
}

/**
 * Data that can be updated in an existing blog post
 */
export interface UpdateBlogPostDTO {
  title?: string;
  description?: string;
}

/**
 * API Response wrapper for single blog post
 */
export interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API Response wrapper for multiple blog posts
 */
export interface BlogPostsResponse {
  success: boolean;
  data: BlogPost[];
  total: number;
  message?: string;
  pagination?: PaginationMeta;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}
