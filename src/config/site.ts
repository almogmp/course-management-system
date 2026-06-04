import type { Metadata } from "next";

import { getAppUrl } from "@/lib/env/app-env";

export const siteConfig = {
  name: "מערכת ניהול קורסים",
  description: "מערכת לניהול קורסים, סטודנטים ומרצים — ממשק בעברית מלא עם תמיכה ב-RTL.",
  url: getAppUrl(),
} as const;

const metadataBase = (() => {
  try {
    return new URL(siteConfig.url);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};
