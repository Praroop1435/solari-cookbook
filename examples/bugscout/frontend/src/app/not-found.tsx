import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-mono">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-neutral-400 mb-4">The requested page does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
