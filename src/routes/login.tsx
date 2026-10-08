import { useState } from "react";
import { ArrowRight, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import GoogleButton from "@/components/auth/GoogleButton";

import { login } from "@/services/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const verified = (search as Record<string, any>).verified;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Track whether the login error was "email not verified" so we can show resend link
  const [showResendHint, setShowResendHint] = useState(false);
  const [loginEmail, setLoginEmailForResend] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setShowResendHint(false);

    try {
      setLoading(true);

      const res = await login({
        email,
        password,
      });

      const token = res?.data?.data?.accessToken;

      if (!token) {
        throw new Error("No access token received");
      }

      localStorage.setItem("accessToken", token);

      navigate({
        to: "/dashboard",
      });
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message || err?.message || "Login Failed";

      // If the error is specifically "email not verified", offer resend
      if (
        message.toLowerCase().includes("verify your email") ||
        message.toLowerCase().includes("not verified")
      ) {
        setShowResendHint(true);
        setLoginEmailForResend(email);
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to HydroNova">
      <AuthCard>
        {/* Success: email verified */}
        {verified === "true" && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            <CheckCircle size={20} />
            <span>Email verified successfully. You can now log in.</span>
          </div>
        )}

        {/* Error: invalid or missing token */}
        {verified === "false" && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <XCircle size={20} />
            <span>Verification link is invalid or has already been used.</span>
          </div>
        )}

        {/* Error: expired token */}
        {verified === "expired" && (
          <div className="mb-5 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-400">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>Your verification link has expired.</span>
            </div>
            <Link
              to="/verify-email"
              search={{ email: loginEmail }}
              className="flex items-center gap-1 text-sm font-medium underline underline-offset-2 hover:text-amber-300"
            >
              <RefreshCw size={14} />
              Resend a new verification email
            </Link>
          </div>
        )}

        {/* Resend hint after failed login due to unverified email */}
        {showResendHint && (
          <div className="mb-5 flex flex-col gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-400">
            <span className="text-sm">
              Your email address hasn&apos;t been verified yet.
            </span>
            <Link
              to="/verify-email"
              search={{ email: loginEmail }}
              className="flex items-center gap-1 text-sm font-medium underline underline-offset-2 hover:text-cyan-300"
            >
              <RefreshCw size={14} />
              Resend verification email
            </Link>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-cyan-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-brand font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                Login
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>

            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-sm text-muted-foreground">OR</span>
            </div>
          </div>

          <GoogleButton />

          <Link to="/signup" className="block text-center text-sm text-muted-foreground">
            Don't have an account?
            <span className="ml-1 text-cyan-400">Sign Up</span>
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
