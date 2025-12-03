import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function EditSpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

