import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function EditProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

