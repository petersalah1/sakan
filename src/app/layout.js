import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ApartmentProvider } from '@/hooks/useApartment';
import Navbar from '@/components/Navbar';
import InstallAppBanner from '@/components/InstallAppBanner';
import AuthGuard from '@/components/AuthGuard';

export const metadata = {
  title: 'سَكَن سبليت - تنظيم ومشاركة مصاريف السكن والشقق',
  description: 'تطبيق ويب ذكي لحساب ومشاركة مصاريف السكن وتصفية الديون بين الشركاء',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'سكن سبليت',
  },
};

export const viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="سكن سبليت" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <ApartmentProvider>
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
              <InstallAppBanner />
              <AuthGuard>{children}</AuthGuard>
            </main>
            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400">
              <p>سَكَن سبليت (Sakan Split) • إدارة مصاريف السكن المشترك بكل سهولة وشفافية</p>
            </footer>
          </ApartmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
