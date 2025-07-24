"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../../lib/trpc";

// Email verification page
export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // Cooldown timer
  const [canResend, setCanResend] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  
  const resendMutation = trpc.auth.resendVerificationEmail.useMutation();
  const checkStatusQuery = trpc.auth.checkVerificationStatus.useQuery(
    email, 
    { 
      enabled: !!email,
      refetchInterval: 5000, // Check every 5 seconds
    }
  );

  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  useEffect(() => {
    // Redirect if verified
    if (checkStatusQuery.data?.isVerified) {
      router.push("/login?success=email-verified");
    }
  }, [checkStatusQuery.data?.isVerified, router]);

  useEffect(() => {
    // Cooldown timer
    if (!canResend && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
      setTimeLeft(60);
    }
  }, [canResend, timeLeft]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;
    
    setIsResending(true);
    setResendMessage("");

    try {
      await resendMutation.mutateAsync(email);
      setResendMessage("Verification email sent successfully!");
      setCanResend(false);
      setTimeLeft(60);
    } catch (error: any) {
      setResendMessage(error.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            We've sent a verification link to your email address.
          </p>
        </div>

        {email && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Email sent to:</strong><br />
              {email}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-xl">1️⃣</div>
            <div>
              <h3 className="font-medium">Check your inbox</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Look for an email from CO2 Calculator
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-xl">2️⃣</div>
            <div>
              <h3 className="font-medium">Click the verification link</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                This will activate your account
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-xl">3️⃣</div>
            <div>
              <h3 className="font-medium">Start calculating emissions</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Access all features after verification
              </p>
            </div>
          </div>
        </div>

        {resendMessage && (
          <div className={`mb-4 p-3 rounded ${
            resendMessage.includes("successfully") 
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}>
            {resendMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={isResending || !canResend || !email}
              className="text-blue-600 hover:text-blue-700 disabled:text-neutral-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isResending ? "Sending..." : 
               !canResend ? `Resend in ${timeLeft}s` : 
               "Resend verification email"}
            </button>
          </div>

          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            <p>Check your spam folder if you don't see the email.</p>
            <p>The verification link expires in 24 hours.</p>
          </div>
        </div>

        <hr className="my-6" />

        <div className="text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Already verified?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in here
            </Link>
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
            Wrong email address?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 