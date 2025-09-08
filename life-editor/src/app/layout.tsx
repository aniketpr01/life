import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientErrorHandler from "@/components/ClientErrorHandler";

export const metadata: Metadata = {
  title: "Life - Personal Knowledge Repository",
  description: "A beautiful markdown editor and blog viewer for your personal knowledge repository",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script id="suppress-ext-errors" src="/suppress-errors.js" strategy="beforeInteractive" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased h-full">
        <ClientErrorHandler />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
