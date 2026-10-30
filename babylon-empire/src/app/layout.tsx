import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetroRevive — Rise of the Babylonian Empire",
  description: "Build, rule and expand a living 3D Babylonian kingdom.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d0b08] text-[#e8dcc3] antialiased">{children}</body>
    </html>
  );
}
