import { Container } from "@/components/ui/container";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-900">
      <Container className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Florapp Labs. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
        </div>
      </Container>
    </footer>
  );
}
