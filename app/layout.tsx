import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Builder Card Generator',
  description:
    'Create your official Hacker House Goa 2026 builder identity card. Build your legacy. Frame it in Goa.',
  keywords: ['hacker house goa', 'HH Goa 2026', 'builder card', 'hackathon', 'goa india'],
  icons: {
    icon: 'https://hhgoa.com/assets/036-vector-54-3934.svg',
    shortcut: 'https://hhgoa.com/assets/036-vector-54-3934.svg',
    apple: 'https://hhgoa.com/assets/036-vector-54-3934.svg',
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://hhgoa.com/assets/036-vector-54-3934.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
