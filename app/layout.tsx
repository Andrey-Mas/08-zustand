// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "NoteHub",
  description: "Notes app with filters & modals",
  openGraph: {
    title: "NoteHub",
    description: "Notes app with filters & modals",
    url: siteUrl,
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
      },
    ],
  },
};

const roboto = Roboto({
  weight: ["400","500","700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Providers>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          {modal}{" "}
          {/* важливо: модалки теж всередині провайдера, бо в них useQuery */}
        </Providers>
      </body>
    </html>
  );
}
