"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { blogAxiosApi } from "@/lib/axios-service";
import { postsReducer, initialPostsState, PostsState } from "@/reducers/postsReducer";
import { BlogPost } from "@/types/blog";
import { AxiosError } from "axios";

interface PostsContextType {
  state: PostsState;
  fetchPosts: () => Promise<void>;
  createPost: (title: string, description: string) => Promise<BlogPost>;
  updatePost: (id: string, title: string, description: string) => Promise<BlogPost>;
  deletePost: (id: string) => Promise<void>;
}

const PostsAxiosContext = createContext<PostsContextType | undefined>(undefined);

export function PostsAxiosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(postsReducer, initialPostsState);

  const fetchPosts = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_POSTS_START" });
      const response = await blogAxiosApi.getAllPosts();
      dispatch({ type: "FETCH_POSTS_SUCCESS", payload: response.data });
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Failed to load posts";
      dispatch({ type: "FETCH_POSTS_ERROR", payload: errorMessage });
    }
  }, []);

  const createPost = useCallback(async (title: string, description: string) => {
    const newPost = await blogAxiosApi.createPost(title, description);
    dispatch({ type: "ADD_POST", payload: newPost });
    return newPost;
  }, []);

  const updatePost = useCallback(async (id: string, title: string, description: string) => {
    const updatedPost = await blogAxiosApi.updatePost(id, title, description);
    dispatch({ type: "UPDATE_POST", payload: updatedPost });
    return updatedPost;
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await blogAxiosApi.deletePost(id);
    dispatch({ type: "DELETE_POST", payload: id });
  }, []);

  return (
    <PostsAxiosContext.Provider
      value={{
        state,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsAxiosContext.Provider>
  );
}

export function usePostsAxios() {
  const context = useContext(PostsAxiosContext);
  if (context === undefined) {
    throw new Error("usePostsAxios must be used within a PostsAxiosProvider");
  }
  return context;
}
