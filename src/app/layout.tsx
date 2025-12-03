import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlyBoard - Gestion de projets Flynesis",
  description: "Plateforme de gestion de projets, idées et roadmap pour l'écosystème Flynesis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased light-blue-bg">{children}</body>
    </html>
  );
}

