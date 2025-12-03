import React from 'react';

export const dynamicParams = false;

export async function generateStaticParams() {
  // Pour un export statique, on retourne un tableau vide
  // Le routing sera géré côté client
  return [];
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
