import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import axios from "axios"; // ✅ Import axios

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending request...");

      const res = await axios.post("http://localhost:5000/api/v1/auth/forgot-password", {
        email,
      });

      console.log("SUCCESS", res.data);

      setSuccess(true); // ✅ Correct setter
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false); // ✅ Reset loading
    }
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Reset your HydroNova account password">
      <AuthCard>
        {success ? (
          <div className="space-y-5 text-center">
            <Mail className="mx-auto text-cyan-400" size={60} />

            <h2 className="text-2xl font-bold">Check your Email</h2>

            <p className="text-muted-foreground">
              If an account exists with this email, we've sent a password reset link.
            </p>

            <Link to="/login" className="text-cyan-400 hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              label="Email Address"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              disabled={loading}
              className="
                h-12
                w-full
                rounded-xl
                bg-gradient-brand
                text-white
                font-semibold
                shadow-glow
                hover:opacity-90
              "
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-cyan-400 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
