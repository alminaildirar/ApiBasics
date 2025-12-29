import { dataStore } from "@/lib/data-store";

export const resolvers = {
  Query: {
    posts: (_: unknown, { page, limit }: { page?: number; limit?: number }) => {
      const posts = dataStore.getAllPosts(page, limit);
      const total = dataStore.getTotalCount();

      if (!page || !limit) {
        return {
          posts,
          pagination: null,
        };
      }

      const currentPage = page;
      const itemsPerPage = limit;
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;

      return {
        posts,
        pagination: {
          currentPage,
          itemsPerPage,
          totalPages,
          totalItems: total,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },

    post: (_: unknown, { id }: { id: string }) => {
      const post = dataStore.getPostById(id);
      if (!post) {
        throw new Error(`Post with ID '${id}' not found`);
      }
      return post;
    },
  },

  Mutation: {
    createPost: (
      _: unknown,
      { title, description }: { title: string; description: string }
    ) => {
      if (!title || !description) {
        throw new Error("Title and description are required");
      }

      if (title.trim().length < 3) {
        throw new Error("Title must be at least 3 characters long");
      }

      if (description.trim().length < 10) {
        throw new Error("Description must be at least 10 characters long");
      }

      return dataStore.createPost(title.trim(), description.trim());
    },

    updatePost: (
      _: unknown,
      {
        id,
        title,
        description,
      }: { id: string; title?: string; description?: string }
    ) => {
      if (!title && !description) {
        throw new Error(
          "At least one field (title or description) must be provided"
        );
      }

      if (title !== undefined && title.trim().length < 3) {
        throw new Error("Title must be at least 3 characters long");
      }

      if (description !== undefined && description.trim().length < 10) {
        throw new Error("Description must be at least 10 characters long");
      }

      const updatedPost = dataStore.updatePost(
        id,
        title?.trim(),
        description?.trim()
      );

      if (!updatedPost) {
        throw new Error(`Post with ID '${id}' not found`);
      }

      return updatedPost;
    },

    deletePost: (_: unknown, { id }: { id: string }) => {
      const deleted = dataStore.deletePost(id);
      if (!deleted) {
        throw new Error(`Post with ID '${id}' not found`);
      }
      return true;
    },
  },
};
