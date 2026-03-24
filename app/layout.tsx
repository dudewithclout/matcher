import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Matcher",
  description: "Voice-first AI college matching with real-time interview flow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
