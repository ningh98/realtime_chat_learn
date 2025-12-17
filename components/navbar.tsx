"use client";

import { useCurrentUser } from "@/services/supabase/hooks/useCurrentUser";
import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "@/services/supabase/components/logout-button";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const isSignIn = pathname === "/auth/login";
  const isSignUp = pathname === "/auth/login/signup";

  return (
    <div className="border-b bg-background h-header">
      <nav className="container mx-auto px-4 flex justify-between items-center h-full gap-4">
        <Link href="/" className="text-xl font-bold">
          Chat
        </Link>
        {isLoading || user == null ? (
          <div className="flex gap-2">
            <Button variant={isSignIn ? "outline" : "default"}>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button variant={isSignUp ? "outline" : "default"}>
              <Link href="/auth/login/signup">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.preferred_username || user.email}
              <br />
              User ID: {user.id}
            </span>

            <LogoutButton />
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
