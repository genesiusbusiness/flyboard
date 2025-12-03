import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function NewProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

