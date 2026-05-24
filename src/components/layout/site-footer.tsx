import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border bg-surface", className)}>
      <Container className="py-6 text-center text-sm text-muted-foreground sm:py-8">
        <p>
          © {year} {siteConfig.name}. כל הזכויות שמורות.
        </p>
      </Container>
    </footer>
  );
}
