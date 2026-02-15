"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

function NavLink({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4">
        {/* Main nav bar */}
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight" onClick={closeMenu}>
            TheJerome
          </Link>

          {/* Desktop nav links */}
          {session && (
            <div className="hidden md:flex md:items-center md:gap-1">
              <NavLink href="/leaders" active={pathname === "/leaders"}>
                Leaderboard
              </NavLink>
              <NavLink href="/entries/new" active={pathname === "/entries/new"}>
                My Entry
              </NavLink>
              {session.user.isAdmin && (
                <NavLink href="/admin/tournaments" active={pathname.startsWith("/admin")}>
                  Admin
                </NavLink>
              )}
            </div>
          )}

          {/* Desktop auth section */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {session ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
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
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t pb-4 pt-2 space-y-1">
            {session ? (
              <>
                <NavLink href="/leaders" active={pathname === "/leaders"} onClick={closeMenu}>
                  Leaderboard
                </NavLink>
                <NavLink href="/entries/new" active={pathname === "/entries/new"} onClick={closeMenu}>
                  My Entry
                </NavLink>
                {session.user.isAdmin && (
                  <NavLink href="/admin/tournaments" active={pathname.startsWith("/admin")} onClick={closeMenu}>
                    Admin
                  </NavLink>
                )}
                <div className="mt-3 border-t pt-3 px-3">
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {session.user.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-3 pt-2">
                <Link href="/auth/signin" onClick={closeMenu}>
                  <Button size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
