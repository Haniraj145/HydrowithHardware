import logo from "@/assets/hydronova-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="HydroNova logo" className="h-9 w-9 object-contain" />
      <span className="font-display text-xl font-bold tracking-tight">
        <span className="text-primary">Hydro</span>
        <span className="text-accent">Nova</span>
      </span>
    </div>
  );
}
