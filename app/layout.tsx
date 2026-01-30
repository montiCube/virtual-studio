import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Studio - WebXR Spatial Commerce',
  description:
    'Experience furniture and art in immersive 3D environments with Augmented Reality placement.',
  keywords: [
    'WebXR',
    'AR',
    'VR',
    'spatial commerce',
    'furniture',
    'art',
    '3D shopping',
  ],
  authors: [{ name: 'Virtual Studio' }],
  openGraph: {
    title: 'Virtual Studio - WebXR Spatial Commerce',
    description:
      'Experience furniture and art in immersive 3D environments with Augmented Reality placement.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
