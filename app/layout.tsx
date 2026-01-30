import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Studio - WebXR Spatial Commerce',
  description: 'Experience furniture and art in immersive 3D environments with AR support',
  keywords: ['WebXR', 'AR', 'VR', '3D', 'commerce', 'furniture', 'art', 'immersive'],
  authors: [{ name: 'Virtual Studio Team' }],
  openGraph: {
    title: 'Virtual Studio - WebXR Spatial Commerce',
    description: 'Experience furniture and art in immersive 3D environments with AR support',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
