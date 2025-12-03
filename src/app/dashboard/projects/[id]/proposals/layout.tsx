import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

