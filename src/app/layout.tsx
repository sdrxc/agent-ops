import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { bayerSans, notoSansMono } from "@/lib/fonts";
import { EvolvingBadge } from "@/components/EvolvingBadge";

export const metadata: Metadata = {
  title: "Agentrix",
  description: "AI Agent Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bayerSans.variable} ${notoSansMono.variable}`}
    >
      <body className="font-sans antialiased">
        <EvolvingBadge />
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ffffff',
                }
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#ffffff',
                }
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
