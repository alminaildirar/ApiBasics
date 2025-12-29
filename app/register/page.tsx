"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: { user } } = useAuth();
  const { data: session, status } = useSession();

  const [state, setState] = useState({
    formData: { username: "", password: "", email: "" },
    errors: {} as { username?: string; password?: string; email?: string },
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
    const newErrors: { username?: string; password?: string; email?: string } = {};

    if (!state.formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (state.formData.username.length < 3 || state.formData.username.length > 20) {
      newErrors.username = "Username must be between 3 and 20 characters";
    }

    if (!state.formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!state.formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (state.formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, submitting: true, apiError: null }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          submitting: false,
          apiError: data.message || "Registration failed"
        }));
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      setState(prev => ({
        ...prev,
        submitting: false,
        apiError: "An error occurred during registration"
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        {state.apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {state.apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={state.formData.username}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, username: e.target.value }
              }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your username"
            />
            {state.errors.username && <p className="text-red-600 text-sm mt-1">{state.errors.username}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={state.formData.email}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, email: e.target.value }
              }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your email"
            />
            {state.errors.email && <p className="text-red-600 text-sm mt-1">{state.errors.email}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={state.formData.password}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, password: e.target.value }
              }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-500 ${
                state.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your password"
            />
            {state.errors.password && <p className="text-red-600 text-sm mt-1">{state.errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {state.submitting ? "Creating account..." : "Sign Up"}
          </button>

          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
