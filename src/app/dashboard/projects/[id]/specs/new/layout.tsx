import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function NewSpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

