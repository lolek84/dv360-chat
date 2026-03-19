import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DV360 Agent",
  description: "AI agent dla DV360 Mock API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
