"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navItems: { href: string; label: string }[] = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Recursos" },
  { href: "#how-it-works", label: "Como Funciona" }
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center font-semibold text-lg">
            <span className="text-[hsl(var(--primary))]">Florapp</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector(item.href);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link
                href="#signup"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector("#signup");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >Criar conta</Link>
            </Button>
          </div>
        </div>
      </Container>
      {open && (
        <div className="md:hidden border-b bg-background">
          <Container className="flex flex-col py-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector(item.href);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  setOpen(false);
                }}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/signup">Criar conta</Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
