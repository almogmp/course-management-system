/** הגדרות שפה וכיוון — המערכת תומכת בעברית בלבד */
export const LOCALE = {
  lang: "he",
  dir: "rtl",
} as const;

export type LocaleConfig = typeof LOCALE;
