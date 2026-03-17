import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import ThemeProvider from "./components/ThemeProvider";
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
  openGraph: {
    title: "THE JEROME | Tournament Prediction League",
    description: "Dominate the bracket. Own the leaderboard. College basketball tournament prediction game.",
    type: "website",
    siteName: "THE JEROME",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE JEROME | Tournament Prediction League",
    description: "Dominate the bracket. Own the leaderboard. College basketball tournament prediction game.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${bebas.variable} ${jetbrains.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            <Navigation />
            <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
