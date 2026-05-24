import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <Container as="main" className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col justify-center gap-6 py-8 sm:gap-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl space-y-4 text-start">
          <p className="text-sm font-medium text-primary sm:text-base">
            מערכת ייצור לניהול קורסים
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <ButtonLink href="/login" className="w-full sm:w-auto">
            התחברות
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
