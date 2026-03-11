import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koenig Editor",
  description: "A feature-complete rich content editor inspired by Ghost CMS Koenig Editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
