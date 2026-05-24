import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <Container
      as="main"
      className="flex flex-1 flex-col items-center justify-center py-16 text-center"
    >
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">הדף המבוקש לא נמצא.</p>
      <ButtonLink href="/" className="mt-8">
        חזרה לדף הבית
      </ButtonLink>
    </Container>
  );
}
