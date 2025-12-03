import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
