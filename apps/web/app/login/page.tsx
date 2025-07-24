"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Login page for user authentication
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | React.ReactNode>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's an unverified email issue
        try {
          const response = await fetch('/api/trpc/auth.checkVerificationStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "0": { email } }),
          });
          const data = await response.json();
          
          if (!data.result?.data?.isVerified) {
            setError(
              <>
                Please verify your email address before logging in.{' '}
                <a 
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Resend verification email
                </a>
              </>
            );
            return;
          }
        } catch (checkError) {
          // Fallback to generic error
        }
        
        setError("Invalid email or password");
        return;
      }

      // Redirect to callback URL or dashboard
      router.push(callbackUrl);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Login</h1>
        
        {/* Show URL parameter messages */}
        {errorParam && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorParam === 'missing-token' && 'Verification link is missing token.'}
            {errorParam === 'invalid-token' && 'Invalid verification token.'}
            {errorParam === 'expired-token' && 'Verification token has expired. Please request a new one.'}
            {errorParam === 'user-not-found' && 'User not found.'}
            {errorParam === 'verification-failed' && 'Email verification failed. Please try again.'}
          </div>
        )}
        
        {successParam && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successParam === 'email-verified' && 'Email verified successfully! You can now log in.'}
            {successParam === 'already-verified' && 'Email is already verified. You can log in.'}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 bg-transparent"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 bg-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-300">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
} 