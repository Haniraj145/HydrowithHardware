import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/farms", label: "Farms" },
  { to: "/ai", label: "AI Vision" },
  { to: "/how-it-works", label: "How it works" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl px-6">
            <Link to="/login">Login</Link>
          </Button>

          <Button asChild className="rounded-xl bg-gradient-brand px-8 text-white shadow-glow">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
        <Logo />

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HydroNova — Smart Hydroponics System
        </p>

        <p className="text-sm text-muted-foreground">Grow Fresh. Eat Healthy. Live Better.</p>
      </div>
    </footer>
  );
}
