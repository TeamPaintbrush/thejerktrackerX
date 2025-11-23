import React from 'react';
import MobileUserEditClient from './MobileUserEditClient';

// Generate static params for export
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function MobileUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;

  return <MobileUserEditClient userId={userId} />;
}