import { Heebo } from "next/font/google";

import { LOCALE } from "@/config/locale";
import { defaultMetadata } from "@/config/site";

import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE.lang} dir={LOCALE.dir} suppressHydrationWarning>
      <body className={`${heebo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
