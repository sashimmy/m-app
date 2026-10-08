import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { RoleProvider } from "@/lib/role-context";
import { DataProvider } from "@/lib/data-context";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "M-app · M-PACK",
  description:
    "A warm, bright way to notice how a child is doing and act early with support.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="min-h-screen">
        <RoleProvider>
          <DataProvider>
            <AppShell>{children}</AppShell>
          </DataProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
