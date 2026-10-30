import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "RetroRevive — Classic Games Reborn",
  description: "Play reimagined classics: the 3D Babylonian Empire, 23 Matches, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d0b08] text-[#e8dcc3] antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}