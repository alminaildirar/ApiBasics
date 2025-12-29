import { BlogPost } from "@/types/blog";

/**
 * In-Memory Data Store for Blog Posts
 * Since we don't use a database, this stores data in memory
 * Note: Data will be reset when the server restarts
 */

class DataStore {
  private posts: BlogPost[] = [];
  private nextId: number = 1;

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  /**
   * Initialize the store with some mock blog posts
   */
  private initializeMockData(): void {
    const now = new Date().toISOString();

    this.posts = [
      {
        id: "1",
        title: "Introduction to RESTful APIs",
        description:
          "Learn the basics of REST architecture and how to design clean APIs. This post covers HTTP methods, status codes, and best practices.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "2",
        title: "Understanding HTTP Protocol",
        description:
          "Deep dive into HTTP protocol, headers, request/response cycle, and common status codes used in web development.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "3",
        title: "Async Programming with JavaScript",
        description:
          "Master async/await, Promises, and error handling in modern JavaScript. Learn how to handle asynchronous operations effectively.",
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.nextId = 4;
  }

  /**
   * Get all blog posts with optional pagination
   * @param page - Page number (1-based index)
   * @param limit - Number of items per page
   */
  getAllPosts(page?: number, limit?: number): BlogPost[] {
    // If no pagination parameters, return all posts
    if (!page || !limit) {
      return [...this.posts];
    }

    // Calculate offset from page number
    const offset = (page - 1) * limit;

    // Return paginated slice
    return [...this.posts].slice(offset, offset + limit);
  }

  /**
   * Get a single blog post by ID
   */
  getPostById(id: string): BlogPost | undefined {
    return this.posts.find((post) => post.id === id);
  }

  /**
   * Create a new blog post
   */
  createPost(title: string, description: string): BlogPost {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: String(this.nextId++),
      title,
      description,
      createdAt: now,
      updatedAt: now,
    };

    this.posts.push(newPost);
    return newPost;
  }

  /**
   * Update an existing blog post
   */
  updatePost(
    id: string,
    title?: string,
    description?: string
  ): BlogPost | undefined {
    const post = this.posts.find((p) => p.id === id);

    if (!post) {
      return undefined;
    }

    if (title !== undefined) {
      post.title = title;
    }

    if (description !== undefined) {
      post.description = description;
    }

    post.updatedAt = new Date().toISOString();

    return post;
  }

  /**
   * Delete a blog post
   */
  deletePost(id: string): boolean {
    const index = this.posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return false;
    }

    this.posts.splice(index, 1);
    return true;
  }

  /**
   * Get total count of posts
   */
  getTotalCount(): number {
    return this.posts.length;
  }

  getPostsWithCursor(
    cursor?: string,
    limit: number = 10
  ): {
    posts: BlogPost[];
    nextCursor: string | null;
    hasMore: boolean;
  } {
    let startIndex = 0;

    if (cursor) {
      // Find the position of the cursor
      const cursorIndex = this.posts.findIndex((p) => p.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const posts = [...this.posts].slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.posts.length;
    const nextCursor =
      hasMore && posts.length > 0 ? posts[posts.length - 1].id : null;

    return {
      posts,
      nextCursor,
      hasMore,
    };
  }
}

// Export a singleton instance
export const dataStore = new DataStore();
