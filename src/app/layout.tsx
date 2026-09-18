import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

// docs/14-PROGRESS.md "Known issues": static weights font-match the 650 section-title weight
// (docs/03 section 4) to 700 - the variable axis (no `weight` list) renders 650 literally, since
// Manrope ships a variable font on Google Fonts.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "180 Fitness Studio",
  description: "Studio management and class booking demo",
  icons: {
    // Client-supplied favicon source (public/brand/icon.png) - public/favicon.svg is left
    // on disk untouched.
    icon: "/brand/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="bg-background text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
