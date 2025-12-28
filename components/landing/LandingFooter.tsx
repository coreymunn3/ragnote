import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Logo width={140} height={36} />

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          <Separator className="max-w-xs" />

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Wysenote. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
