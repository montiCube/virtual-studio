import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Studio - WebXR Spatial Commerce',
  description: 'Experience furniture and art in immersive 3D environments with AR support',
  keywords: ['WebXR', 'AR', 'VR', '3D', 'commerce', 'furniture', 'art', 'immersive'],
  authors: [{ name: 'Virtual Studio Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Virtual Studio',
  },
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

// Service Worker registration script
const swScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('ServiceWorker registration successful');
      },
      function(err) {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </body>
    </html>
  );
}
