import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BugScout AI — Autonomous Self-Healing QA & Bug Discovery (Solari)',
  description:
    'Autonomous QA & Visual Regression Agent powered by Solari Cloud Browsers and MicroVM Sandboxes. Synthesizes and executes reproducible Playwright test suites.',
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
