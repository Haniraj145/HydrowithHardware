import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Grid */}
      <div className="absolute inset-0 ring-grid opacity-30" />

      {/* Glow 1 */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Glow 2 */}
      <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-green-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}

          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand shadow-glow">
              <Droplets className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}

          <h1 className="text-center text-4xl font-bold">{title}</h1>

          {subtitle && <p className="mt-3 text-center text-muted-foreground">{subtitle}</p>}

          <div className="mt-10">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
