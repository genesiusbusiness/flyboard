import React from 'react';

export async function generateStaticParams() {
  // Pour un export statique, on retourne un tableau vide
  // Le routing sera géré côté client avec Next.js router
  return [];
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
