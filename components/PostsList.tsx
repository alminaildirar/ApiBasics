"use client";

import { BlogPost } from "@/types/blog";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load PostCard component with dynamic import
const PostCard = dynamic(() => import("./PostCard"), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  ),
  ssr: false,
});

interface PostsListProps {
  posts: BlogPost[];
  onDelete: (id: string, title: string) => void;
}

export default function PostsList({ posts, onDelete }: PostsListProps) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Suspense
          key={post.id}
          fallback={
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          }
        >
          <PostCard post={post} onDelete={onDelete} />
        </Suspense>
      ))}
    </div>
  );
}
