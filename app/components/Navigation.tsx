"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Trophy } from "lucide-react";

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
      className={`group relative block px-4 py-2 rounded text-sm font-semibold tracking-wide uppercase transition-all cursor-pointer ${
        active
          ? "text-primary"
          : "text-primary-foreground/60 hover:text-primary-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
      )}
    </Link>
  );
}

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-primary/20 bg-secondary shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        {/* Main nav bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            onClick={closeMenu}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary trophy-glow">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-wider text-primary-foreground group-hover:text-primary transition-colors">
              THE JEROME
            </span>
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
                <span className="text-xs text-primary-foreground/70 truncate max-w-[200px] uppercase tracking-wide">
                  {session.user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" className="cursor-pointer">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-primary-foreground hover:bg-primary transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-foreground/10 pb-4 pt-2 space-y-1">
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
                <div className="mt-3 border-t border-primary-foreground/10 pt-3 px-3">
                  <p className="text-xs text-primary-foreground/70 truncate mb-2 uppercase tracking-wide">
                    {session.user.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary cursor-pointer"
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
                  <Button size="sm" className="w-full cursor-pointer">
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
