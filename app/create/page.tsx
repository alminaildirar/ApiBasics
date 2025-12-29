"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-service";
import Link from "next/link";
import { usePosts } from "@/contexts/PostsContext";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";

export default function CreatePostPage() {
  const router = useRouter();
  const { createPost } = usePosts();
  const { data: session, status } = useSession();
  const { state: { user } } = useAuth();

  const [state, setState] = useState({
    formData: { title: "", description: "" },
    errors: {} as { title?: string; description?: string },
    submitting: false,
    apiError: null as string | null,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session && !user) {
      router.push("/login");
    }
  }, [session, user, router, status]);

  function validateForm(): boolean {
    const newErrors: { title?: string; description?: string } = {};

    if (!state.formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (state.formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!state.formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (state.formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true, apiError: null }));

      await createPost(state.formData.title.trim(), state.formData.description.trim());

      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to create post";
      setState(prev => ({ ...prev, apiError: errorMessage, submitting: false }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to posts
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">
            Create New Post
          </h1>
        </div>

        {state.apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {state.apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-8"
        >
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={state.formData.title}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, title: e.target.value }
              }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter post title"
            />
            {state.errors.title && (
              <p className="text-red-600 text-sm mt-1">{state.errors.title}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={state.formData.description}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, description: e.target.value }
              }))}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter post description"
            />
            {state.errors.description && (
              <p className="text-red-600 text-sm mt-1">{state.errors.description}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={state.submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {state.submitting ? "Creating..." : "Create Post"}
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
