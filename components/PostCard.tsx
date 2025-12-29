"use client";

import Link from "next/link";
import { BlogPost } from "@/types/blog";

interface PostCardProps {
  post: BlogPost;
  onDelete: (id: string, title: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {post.title}
      </h2>
      <p className="text-gray-600 mb-4">{post.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          Created: {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <div className="space-x-3">
          <Link
            href={`/posts/${post.id}/edit`}
            className="text-blue-600 hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(post.id, post.title)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
