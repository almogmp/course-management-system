import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath =
    typeof searchParams?.next === "string" && searchParams.next.startsWith("/")
      ? searchParams.next
      : "/dashboard";

  const initialError =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;

  return <LoginForm nextPath={nextPath} initialError={initialError} />;
}
