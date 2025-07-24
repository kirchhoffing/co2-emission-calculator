"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../lib/trpc";
import { signIn } from "next-auth/react";

// Register page for new user sign-up
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const registerMutation = trpc.auth.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        companyName: companyName.trim() || undefined,
        gdprConsent,
      });

      if (result.requiresVerification) {
        // Show verification message instead of auto-login
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        // Fallback: try to login if verification not required
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginResult?.error) {
          setError("Registration successful, but login failed. Please try logging in manually.");
          return;
        }

        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Register</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 bg-transparent"
              disabled={isLoading}
            />
          </div>
          
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 bg-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-1">Company Name (Optional)</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 bg-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-start">
            <input
              id="gdprConsent"
              type="checkbox"
              required
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-1 mr-3"
              disabled={isLoading}
            />
            <label htmlFor="gdprConsent" className="text-sm text-neutral-600 dark:text-neutral-300">
              I agree to the processing of my personal data in accordance with the{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              {' '}and consent to receive relevant communications.
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !gdprConsent}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-300">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
          </div>
    );
} 