import type { Metadata, Viewport } from 'next';
import { VT323 } from 'next/font/google';
import './globals.css';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

export const viewport: Viewport = {
  themeColor: '#39ff14',
};

export const metadata: Metadata = {
  title: 'Neon CyberSnake MMO',
  description: 'A multiplayer snake game with real-time competition',
  openGraph: {
    title: 'Neon CyberSnake MMO',
    description: 'Join the neon arena and compete with players worldwide in this retro-futuristic snake game!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={vt323.variable}>{children}</body>
    </html>
  );
}
