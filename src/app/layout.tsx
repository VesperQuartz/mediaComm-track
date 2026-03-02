import "../lib/orpc.server";
import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AsyncProvider } from "@/providers/async";
import { LoadingProvider } from "@/providers/loader";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medicaid Group MediaComm Track",
  description:
    "Team productivity tracker for Medicaid Group Communications Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AsyncProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingProvider>
              <NuqsAdapter
                defaultOptions={{
                  clearOnDefault: true,
                  limitUrlUpdates: {
                    method: "debounce",
                    timeMs: 50,
                  },
                  shallow: true,
                }}
              >
                {children}
              </NuqsAdapter>
            </LoadingProvider>
          </ThemeProvider>
        </AsyncProvider>
        <Toaster />
      </body>
    </html>
  );
}
