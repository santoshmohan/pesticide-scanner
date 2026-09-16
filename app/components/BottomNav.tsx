import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white rounded-full shadow-lg px-6 py-4 flex justify-around z-50">
      <Link href="/" className="text-gray-700 font-semibold">
        History
      </Link>
      <Link href="/scan" className="text-green-600 font-semibold">
        Scan
      </Link>
    </nav>
  );
}