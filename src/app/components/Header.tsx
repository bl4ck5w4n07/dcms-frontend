import { Button } from "./ui/button";
import { useCallback } from "react";
import { useAuth } from "./auth/auth-context";

interface HeaderProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export function Header({ onOpenSignIn, onOpenSignUp }: HeaderProps) {
  const handleSignIn = useCallback(() => onOpenSignIn(), [onOpenSignIn]);
  const handleSignUp = useCallback(() => onOpenSignUp(), [onOpenSignUp]);

  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        <a href="/" className="inline-flex items-center gap-2">
          <span className="inline-block size-6 rounded-sm bg-primary"></span>
          <span>NextCare</span>
        </a>
        <nav className="hidden items-center gap-2 sm:flex">
          {!user ? (
            <>
              <Button variant="ghost" onClick={handleSignIn}>Sign in</Button>
              <Button onClick={handleSignUp}>Sign up</Button>
            </>
          ) : (
            <a href={`/${user.role}`} className="inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-accent">Dashboard</a>
          )}
        </nav>
        <div className="sm:hidden">
          {!user ? (
            <Button variant="outline" onClick={handleSignUp}>Get started</Button>
          ) : (
            <a href={`/${user.role}`} className="inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-accent">Dashboard</a>
          )}
        </div>
      </div>
    </header>
  );
}
