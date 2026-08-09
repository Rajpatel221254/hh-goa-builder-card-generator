import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Builder Card Generator',
  description:
    'Create your official Hacker House Goa 2026 builder identity card. Build your legacy. Frame it in Goa.',
  keywords: ['hacker house goa', 'HH Goa 2026', 'builder card', 'hackathon', 'goa india'],
  openGraph: {
    title: 'HH Goa 2026 — Builder Card Generator',
    description: 'Create your official builder identity card for Hacker House Goa 2026.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH Goa 2026 — Builder Card Generator',
    description: 'Create your official builder identity card for Hacker House Goa 2026.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e3d1f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
