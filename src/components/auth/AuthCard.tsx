interface Props {
  children: React.ReactNode;
}

export default function AuthCard({ children }: Props) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-border/60
      bg-card/60
      backdrop-blur-xl
      p-8
      shadow-leaf
      "
    >
      {children}
    </div>
  );
}
