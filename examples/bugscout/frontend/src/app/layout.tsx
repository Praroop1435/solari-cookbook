import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solari Sentinel — Autonomous QA & Self-Healing Bug Discovery',
  description:
    'Enterprise-grade autonomous QA agent powered by Solari Cloud Infrastructure (Stealth Browsers, MicroVM Sandboxes, and Session Recordings).',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
