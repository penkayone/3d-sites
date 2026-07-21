import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "synkra-alive-studio.sergik15828.chatgpt.site";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const image = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: "SYNKRA — Digital experiences that move people",
    description: "A senior digital studio for ambitious AI and technology launches.",
    openGraph: {
      title: "SYNKRA — Digital experiences that move people",
      description: "A senior digital studio for ambitious AI and technology launches.",
      type: "website",
      images: [{ url: image, width: 1732, height: 909, alt: "SYNKRA — Digital experiences that move people." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SYNKRA — Digital experiences that move people",
      description: "A senior digital studio for ambitious AI and technology launches.",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
