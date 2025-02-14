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
      className="w-full flex items-center justify-center gap-3 h-11 px-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out transform hover:scale-[1.02] relative"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <div className="flex-shrink-0">
            <Image
              src={logos[provider]}
              alt={`${provider} logo`}
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </div>
          <span className="flex-1 text-center">{text[provider]}</span>
        </>
      )}
    </Button>
  );
} 