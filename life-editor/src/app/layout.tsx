import type { Metadata } from "next";
import "./globals.css";
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
        <script src="/suppress-errors.js" defer></script>
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