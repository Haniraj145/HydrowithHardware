import { useState } from "react";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

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

  const verified = search.verified;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

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

      console.log("Login Success");

      navigate({
        to: "/dashboard",
      });
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.message || err?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to HydroNova">
      <AuthCard>
        {verified === "true" && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            <CheckCircle size={20} />
            <span>Email verified successfully. You can now login.</span>
          </div>
        )}

        {verified === "false" && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <XCircle size={20} />
            <span>Verification link is invalid or has expired.</span>
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
