import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Vino — Dongjin의 와인 듀오링고',
  description: 'Dongjin이 만든 듀오링고 스타일 와인 학습 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vino',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B1A4A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full bg-[#FBF5EE] text-[#1A0A10]">
        <div className="max-w-lg mx-auto min-h-screen relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
