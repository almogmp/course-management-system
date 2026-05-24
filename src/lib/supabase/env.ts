export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

function readEnv(name: string, value: string | undefined): string {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    throw new Error(
      `חסרה משתנה סביבה: ${name}. הגדר אותו בקובץ .env.local.`,
    );
  }

  return cleanValue;
}

/** קורא ומאמת את משתני הסביבה הציבוריים של Supabase */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: readEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    anonKey: readEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}