"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { blogApi, ApiError } from "@/lib/api-service";
import Link from "next/link";
import { usePosts } from "@/contexts/PostsContext";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { updatePost } = usePosts();
  const { data: session, status } = useSession();
  const { state: { user } } = useAuth();

  const [state, setState] = useState({
    id: "",
    formData: { title: "", description: "" },
    errors: {} as { title?: string; description?: string },
    loading: true,
    submitting: false,
    apiError: null as string | null,
  });

  const fetchPost = useCallback(async (postId: string) => {
    try {
      const post = await blogApi.getPostById(postId);
      setState(prev => ({
        ...prev,
        formData: { title: post.title, description: post.description },
        loading: false
      }));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load post";
      setState(prev => ({ ...prev, apiError: errorMessage, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session && !user) {
      router.push("/login");
      return;
    }
    params.then((p) => {
      setState(prev => ({ ...prev, id: p.id }));
      fetchPost(p.id);
    });
  }, [params, session, user, router, status, fetchPost]);

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

      await updatePost(state.id, state.formData.title.trim(), state.formData.description.trim());

      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to update post";
      setState(prev => ({ ...prev, apiError: errorMessage, submitting: false }));
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (state.apiError && !state.formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{state.apiError}</p>
          <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Back to posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to posts
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Edit Post</h1>
        </div>

        {state.apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {state.apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
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
            {state.errors.title && <p className="text-red-600 text-sm mt-1">{state.errors.title}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
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
              {state.submitting ? "Updating..." : "Update Post"}
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
