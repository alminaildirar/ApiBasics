import { BlogPost } from "@/types/blog";

export interface PostsState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
}

export type PostsAction =
  | { type: "FETCH_POSTS_START" }
  | { type: "FETCH_POSTS_SUCCESS"; payload: BlogPost[] }
  | { type: "FETCH_POSTS_ERROR"; payload: string }
  | { type: "ADD_POST"; payload: BlogPost }
  | { type: "UPDATE_POST"; payload: BlogPost }
  | { type: "DELETE_POST"; payload: string };

export const initialPostsState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export function postsReducer(state: PostsState, action: PostsAction): PostsState {
  switch (action.type) {
    case "FETCH_POSTS_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "FETCH_POSTS_SUCCESS":
      return {
        ...state,
        posts: action.payload,
        loading: false,
        error: null,
      };
    case "FETCH_POSTS_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "ADD_POST":
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };
    default:
      return state;
  }
}
