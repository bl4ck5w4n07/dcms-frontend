import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


import "@/globals.css";


export const metadata: Metadata = {
  title: "Go-Goyagoy DCMS",
  description: "Dental Management Clinic System",
};

import { AuthProvider } from "@components/auth/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}