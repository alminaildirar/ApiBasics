"use client";

import { useAuth } from "@/contexts/AuthContext";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OAuthLoginPage() {
  const { data: session, status } = useSession();
  const {
    state: { user },
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session || user) {
      router.push("/");
    }
  }, [session, user, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OAuth Login</h1>
          <p className="text-gray-600">Sign in with your GitHub account</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to regular login
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
          <p className="font-medium mb-2">Setup Required:</p>
          <ol className="text-sm list-decimal list-inside space-y-1">
            <li>Create a GitHub OAuth App</li>
            <li>Add credentials to .env.local</li>
            <li>
              Set callback URL to http://localhost:3000/api/auth/callback/github
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
