import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import GoogleButton from "@/components/auth/GoogleButton";

import { signup } from "@/services/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await signup({
        fullName,
        email,
        password,
      });

      navigate({ to: "/verify-email", search: { email } });
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start growing with HydroNova">
      <AuthCard>
        <form onSubmit={handleSignup} className="space-y-5">
          <AuthInput
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <AuthInput
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow transition hover:opacity-90"
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2" size={18} />
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

          <Link to="/login" className="block text-center text-sm text-muted-foreground">
            Already have an account?
            <span className="ml-1 text-cyan-400">Login</span>
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
