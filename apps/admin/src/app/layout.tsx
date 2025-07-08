import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminAuthProvider } from "../contexts/AdminAuthContext";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "../components/layout/AdminNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BEYANA Admin Dashboard",
  description: "Administration de la plateforme BEYANA Bio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Toaster position="top-right" />
        <AdminAuthProvider>
          <div className="min-h-screen">
            <AdminNavbar />
            <main className="max-w-7xl mx-auto py-6">{children}</main>
          </div>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
