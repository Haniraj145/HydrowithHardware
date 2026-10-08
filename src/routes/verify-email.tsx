import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Mail, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";
import { resendVerification } from "@/services/auth";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email } = useSearch({ from: "/verify-email" });

  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [resendMessage, setResendMessage] = useState("");

  async function handleResend() {
    if (resendStatus === "loading" || resendStatus === "sent") return;

    if (!email) {
      setResendStatus("error");
      setResendMessage(
        "Email address not found. Please sign up again or use the form below."
      );
      return;
    }

    try {
      setResendStatus("loading");
      const res = await resendVerification(email);
      setResendStatus("sent");
      setResendMessage(
        res.data?.message || "A new verification email has been sent."
      );
    } catch (err: any) {
      setResendStatus("error");
      setResendMessage(
        err?.response?.data?.message || "Failed to resend. Please try again."
      );
    }
  }

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="One more step to get started"
    >
      <AuthCard>
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 ring-2 ring-cyan-500/20">
            <Mail className="h-10 w-10 text-cyan-400" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            We sent a verification link to:
          </p>
          {email ? (
            <p className="break-all font-semibold text-foreground">
              {email}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              (your registered email address)
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Click the link in the email to verify your account. The link
            expires in&nbsp;<span className="text-foreground font-medium">24 hours</span>.
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-wider">
              Didn&apos;t receive it?
            </span>
          </div>
        </div>

        {/* Resend button */}
        {resendStatus === "sent" ? (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle size={18} />
            <span>{resendMessage}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {resendStatus === "error" && (
              <p className="text-center text-sm text-red-400">{resendMessage}</p>
            )}
            <button
              onClick={handleResend}
              disabled={resendStatus === "loading"}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
            >
              {resendStatus === "loading" ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        )}

        {/* Tips */}
        <ul className="mt-5 space-y-1 text-xs text-muted-foreground">
          <li>• Check your spam or junk folder</li>
          <li>• The sender is <span className="text-foreground">HydroNova &lt;{import.meta.env.VITE_SMTP_USER || "hydronovasupport@gmail.com"}&gt;</span></li>
        </ul>

        {/* Back to login */}
        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Back to Login
          <ArrowRight size={14} />
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
