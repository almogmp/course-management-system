export function resolveAdminDeleteFlashMessage(searchParams?: {
  success?: string;
  message?: string;
  error?: string;
}): { successMessage: string | null; errorMessage: string | null } {
  const errorMessage =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;

  if (searchParams?.success === "deleted" && typeof searchParams.message === "string") {
    return {
      successMessage: decodeURIComponent(searchParams.message),
      errorMessage,
    };
  }

  return { successMessage: null, errorMessage };
}
