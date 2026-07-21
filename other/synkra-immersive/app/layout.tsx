import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNKRA — We make digital feel alive",
  description: "Immersive AI-powered web experiences, from first concept to launch in 21 days.",
  openGraph: {
    title: "SYNKRA — We make digital feel alive",
    description: "Immersive AI-powered web experiences built to turn attention into action.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SYNKRA — We make digital feel alive",
    description: "Immersive AI-powered web experiences built to turn attention into action.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
