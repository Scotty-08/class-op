import type { Metadata } from "next";
import { AppProvider } from "@/lib/context";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Class OP · Iowa State schedule optimizer",
  description:
    "Plan a walkable Iowa State week from Friley Hall. Demo Workday seed for Computer Engineering Fall Y1.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
