import { FcGoogle } from "react-icons/fc";

interface Props {
  onClick?: () => void;
}

export default function GoogleButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
      flex
      h-12
      w-full
      items-center
      justify-center
      gap-3
      rounded-xl
      border
      border-border
      bg-card/60
      transition
      hover:bg-card
      "
    >
      <FcGoogle size={22} />

      <span className="font-medium">Continue with Google</span>
    </button>
  );
}
