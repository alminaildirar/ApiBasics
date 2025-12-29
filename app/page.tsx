"use client";

import { useEffect, lazy, Suspense } from "react";
import { ApiError } from "@/lib/api-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import { useSession, signOut } from "next-auth/react";

const PostsList = lazy(() => import("@/components/PostsList"));

export default function HomePage() {
  const router = useRouter();
  const {
    state: { user },
    logout,
  } = useAuth();
  const { data: session, status } = useSession();
  const {
    state: { posts, loading, error },
    fetchPosts,
    deletePost,
  } = usePosts();

  useEffect(() => {
    if (status === "loading") return;

    if (!session && !user) {
      router.push("/login");
      return;
    }
    fetchPosts();
  }, [fetchPosts, session, user, router, status]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deletePost(id);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to delete: ${err.message}`);
      } else {
        alert("Failed to delete post");
      }
    }
  }

  function handleLogout() {
    if (session) {
      signOut({ callbackUrl: "/" });
    } else {
      logout();
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchPosts()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentUser =
    session?.user?.name || session?.user?.email || user?.username;
  const isAuthenticated = !!(session || user);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog Posts</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">
                  Welcome, <span className="font-medium">{currentUser}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Login
              </Link>
            )}
            <Link
              href="/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Post
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No posts yet</p>
            <Link
              href="/create"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                  >
                    <div className="h-8 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <PostsList posts={posts} onDelete={handleDelete} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
