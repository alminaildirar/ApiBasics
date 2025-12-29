import {
  BlogPost,
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
  BlogPostsResponse,
  BlogPostResponse,
  ApiErrorResponse,
} from "@/types/blog";

const API_BASE_URL = "/api";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        throw new ApiError(
          response.status,
          response.statusText,
          `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      throw new ApiError(
        errorData.statusCode,
        errorData.error,
        errorData.message
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors, CORS issues, etc.
    if (error instanceof TypeError) {
      throw new ApiError(0, "Network Error", "Failed to connect to the server");
    }

    // Handle other unexpected errors
    throw new ApiError(
      500,
      "Unknown Error",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
}

export const blogApi = {
  async getAllPosts(): Promise<BlogPost[]> {
    const response = await fetchWithErrorHandling<BlogPostsResponse>(
      `${API_BASE_URL}/posts`
    );
    return response.data;
  },

  async getPostById(id: string): Promise<BlogPost> {
    const response = await fetchWithErrorHandling<BlogPostResponse>(
      `${API_BASE_URL}/posts/${id}`
    );
    return response.data;
  },

  async createPost(data: CreateBlogPostDTO): Promise<BlogPost> {
    const response = await fetchWithErrorHandling<BlogPostResponse>(
      `${API_BASE_URL}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async updatePost(id: string, data: UpdateBlogPostDTO): Promise<BlogPost> {
    const response = await fetchWithErrorHandling<BlogPostResponse>(
      `${API_BASE_URL}/posts/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await fetchWithErrorHandling<void>(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
    });
  },
};

export async function getMultiplePostsParallel(
  ids: string[]
): Promise<BlogPost[]> {
  try {
    // Promise.all runs all promises in parallel
    const promises = ids.map((id) => blogApi.getPostById(id));
    const posts = await Promise.all(promises);
    return posts;
  } catch (error) {
    console.error("Failed to fetch posts in parallel:", error);
    throw error;
  }
}

export async function getMultiplePostsSafe(
  ids: string[]
): Promise<Array<BlogPost | null>> {
  const promises = ids.map((id) => blogApi.getPostById(id));

  // Promise.allSettled waits for all promises but doesn't fail on rejections
  const results = await Promise.allSettled(promises);

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error("Failed to fetch post:", result.reason);
      return null;
    }
  });
}
