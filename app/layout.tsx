import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/ui/CustomCursor';
import LenisProvider from '@/components/providers/LenisProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Zexus — Network Intelligence Platform',
  description:
    'Measure your internet speed with cinematic 3D visualization. Real-time download, upload, and latency testing powered by next-generation network intelligence.',
  keywords: ['speed test', 'internet speed', 'network', 'bandwidth', '3D', 'Zexus'],
  openGraph: {
    title: 'Zexus — Network Intelligence Platform',
    description: 'Real-time network intelligence with immersive 3D visualization.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-text-primary antialiased overflow-x-hidden">
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
