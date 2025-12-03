import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

