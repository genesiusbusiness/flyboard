import React from 'react';

export async function generateStaticParams() {
  return [];
}

export default function EditProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

