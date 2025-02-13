import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface SocialLoginButtonProps {
  provider: "github" | "google";
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export function SocialLoginButton({ provider, onClick, isLoading }: SocialLoginButtonProps) {
  const logos = {
    github: "/github-logo.svg",
    google: "/google-logo.svg"
  };

  const text = {
    github: "Continue with GitHub",
    google: "Continue with Google"
  };

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 relative h-11 hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Image
            src={logos[provider]}
            alt={`${provider} logo`}
            width={20}
            height={20}
            className="absolute left-4"
          />
          <span className="ml-4">{text[provider]}</span>
        </>
      )}
    </Button>
  );
} 