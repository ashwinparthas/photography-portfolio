import type { Metadata } from "next";
import "./globals.css";
import { Bodoni_Moda, Space_Grotesk } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body"
});

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
