import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export default function PasswordInput({ label, error, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`
            h-12
            w-full
            rounded-xl
            border
            ${error ? "border-red-500" : "border-border"}
            bg-background/70
            px-4
            pr-12
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-2
            focus:ring-cyan-400/30
          `}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
