import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Eval Starter Kit",
  description: "Generate an evaluation starter kit from a plain-English AI workflow."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
