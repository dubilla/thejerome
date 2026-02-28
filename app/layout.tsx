import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import Navigation from "./components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE JEROME | Tournament Prediction League",
  description: "Dominate the bracket. Own the leaderboard. College basketball tournament prediction game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebas.variable} ${jetbrains.variable} antialiased`}
      >
        <SessionProvider>
          <Navigation />
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
