import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null; // parent passes error
}

export default function AuthInput({ label, error, ...props }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <input
        {...props}
        className={`
          h-12
          w-full
          rounded-xl
          border
          ${error ? "border-red-500" : "border-border"}
          bg-background/70
          px-4
          outline-none
          transition
          focus:border-cyan-400
          focus:ring-2
          focus:ring-cyan-400/30
        `}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
