import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function ProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
