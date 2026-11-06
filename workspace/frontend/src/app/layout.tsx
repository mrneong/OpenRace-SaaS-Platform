import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenRace - Multi-tenant Running Platform',
  description: 'Online race management and automated rule validation SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-950 font-sans antialiased text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

