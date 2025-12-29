"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    state: { user },
  } = useAuth();
  const { data: session, status } = useSession();

  const [state, setState] = useState({
    formData: { username: "", password: "" },
    errors: {} as { username?: string; password?: string },
    submitting: false,
    apiError: null as string | null,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (session || user) {
      router.push("/");
    }
  }, [session, user, router, status]);

  function validateForm(): boolean {
    const newErrors: { username?: string; password?: string } = {};

    if (!state.formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!state.formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (state.formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, submitting: true, apiError: null }));

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: state.formData.username.trim(),
          password: state.formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          apiError: data.message || "Login failed",
          submitting: false,
        }));
        return;
      }

      login(data.data.token, data.data.user);
      router.push("/");
    } catch (err) {
      setState((prev) => ({
        ...prev,
        apiError: "Failed to connect to server",
        submitting: false,
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
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
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={state.formData.username}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, username: e.target.value },
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your username"
            />
            {state.errors.username && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.username}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={state.formData.password}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, password: e.target.value },
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your password"
            />
            {state.errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {state.submitting ? "Signing in..." : "Sign In"}
          </button>

          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className="text-blue-600 hover:underline text-sm"
            >
              Register here
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/oauth-login"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-700 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub OAuth
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
