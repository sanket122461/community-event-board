import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighbourhood — Find your people, just around the corner",
  description: "Discover the little things happening in your community."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
