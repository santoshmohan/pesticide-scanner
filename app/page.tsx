"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, removeFromHistory, HistoryItem } from "@/lib/history";

export default function HomePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleDelete(barcode: string) {
    removeFromHistory(barcode);
    setHistory(getHistory());
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-28">
      <div className="max-w-md mx-auto px-5 pt-10">
        <h1 className="text-4xl font-bold mb-2">Pesticide Scanner</h1>
        <p className="text-gray-500 mb-6">
          Scan or enter the barcode manually
        </p>

        <Link
          href="/scan"
          className="block w-full rounded-full bg-green-500 text-white text-center py-4 font-semibold mb-8"
        >
          Scan a product
        </Link>

        <h2 className="text-2xl font-bold mb-4">History</h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">🧪</div>
            <h3 className="text-xl font-semibold mb-2">No scanned products</h3>
            <p className="text-gray-500 mb-6">
              Scan a product barcode to begin.
            </p>
            <Link
              href="/scan"
              className="inline-block rounded-full bg-green-500 text-white px-6 py-3 font-medium"
            >
              Scan now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.barcode}
                className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4"
              >
                <img
                  src={item.image_url || "https://placehold.co/80x80?text=Product"}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-gray-100"
                />

                <Link
                  href={`/product/${item.barcode}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                  <p className="text-gray-500">{item.brand || "Unknown brand"}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        item.score >= 70
                          ? "bg-green-500"
                          : item.score >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-700">
                      {item.verdict} • {item.score}/100
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.scannedAt).toLocaleString()}
                  </p>
                </Link>

                <button
                  onClick={() => handleDelete(item.barcode)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white rounded-full shadow-lg px-6 py-4 flex justify-around">
        <Link href="/" className="text-green-600 font-semibold">
          History
        </Link>
        <Link href="/scan" className="text-gray-700 font-semibold">
          Scan
        </Link>
      </nav>
    </main>
  );
}