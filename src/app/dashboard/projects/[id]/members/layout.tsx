import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

