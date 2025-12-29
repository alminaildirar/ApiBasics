"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { blogApi, ApiError } from "@/lib/api-service";
import { postsReducer, initialPostsState, PostsState } from "@/reducers/postsReducer";
import { BlogPost } from "@/types/blog";

interface PostsContextType {
  state: PostsState;
  fetchPosts: () => Promise<void>;
  createPost: (title: string, description: string) => Promise<BlogPost>;
  updatePost: (id: string, title: string, description: string) => Promise<BlogPost>;
  deletePost: (id: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(postsReducer, initialPostsState);

  const fetchPosts = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_POSTS_START" });
      const data = await blogApi.getAllPosts();
      dispatch({ type: "FETCH_POSTS_SUCCESS", payload: data });
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to load posts";
      dispatch({ type: "FETCH_POSTS_ERROR", payload: errorMessage });
    }
  }, []);

  const createPost = useCallback(async (title: string, description: string) => {
    const newPost = await blogApi.createPost({ title, description });
    dispatch({ type: "ADD_POST", payload: newPost });
    return newPost;
  }, []);

  const updatePost = useCallback(async (id: string, title: string, description: string) => {
    const updatedPost = await blogApi.updatePost(id, { title, description });
    dispatch({ type: "UPDATE_POST", payload: updatedPost });
    return updatedPost;
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await blogApi.deletePost(id);
    dispatch({ type: "DELETE_POST", payload: id });
  }, []);

  return (
    <PostsContext.Provider
      value={{
        state,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
