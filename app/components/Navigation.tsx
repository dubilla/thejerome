"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            TheJerome
          </Link>
          {session && (
            <>
              <Link
                href="/leaders"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Leaderboard
              </Link>
              <Link
                href="/entries/new"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My Entry
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin/tournaments"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
