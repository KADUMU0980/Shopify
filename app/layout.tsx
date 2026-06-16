import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'ShopVerse — Your Premium E-Commerce Store', template: '%s | ShopVerse' },
  description: 'Discover the best deals on Electronics, Fashion, Home & Living, Books, Sports, and Beauty products. Fast delivery, easy returns.',
  keywords: ['ecommerce', 'shopping', 'electronics', 'fashion', 'deals'],
  authors: [{ name: 'ShopVerse' }],
  creator: 'ShopVerse',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'ShopVerse — Your Premium E-Commerce Store',
    description: 'Shop the best products at unbeatable prices.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0F172A',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
