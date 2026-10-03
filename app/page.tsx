"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  getHistory, 
  removeFromHistory, 
  getHistoryStats,
  formatScanDate,
  clearHistory,
  type HistoryItem 
} from "@/lib/history";
import { getVerdictColor } from "@/lib/score";
import { getProductImageUrl } from "@/lib/product-image";
import BottomNav from "./components/BottomNav";

export default function HomePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getHistoryStats> | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    const historyData = getHistory();
    setHistory(historyData);
    if (historyData.length > 0) {
      setStats(getHistoryStats());
    }
  }

  function handleDelete(barcode: string) {
    removeFromHistory(barcode);
    loadHistory();
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
    setStats(null);
    setShowClearConfirm(false);
  }

  const getVerdictBgColor = (verdict: string): string => {
    switch (verdict) {
      case "Excellent":
        return "bg-green-100";
      case "Good":
        return "bg-green-50";
      case "Moderate":
        return "bg-yellow-50";
      case "Poor":
        return "bg-orange-50";
      case "Bad":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getVerdictTextColor = (verdict: string): string => {
    switch (verdict) {
      case "Excellent":
        return "text-green-700";
      case "Good":
        return "text-green-600";
      case "Moderate":
        return "text-yellow-600";
      case "Poor":
        return "text-orange-600";
      case "Bad":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-28">
      <div className="max-w-md mx-auto px-5 pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🧪 Pesticide Scanner</h1>
          <p className="text-gray-600">
            Scan or enter barcodes to check ingredient safety
          </p>
        </div>

        {/* Scan Button */}
        <Link
          href="/scan"
          className="block w-full rounded-full bg-green-600 hover:bg-green-700 text-white text-center py-4 font-semibold mb-8 transition shadow-md"
        >
          📱 Scan a Product
        </Link>

        {/* Info Links */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/scoring-method"
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-semibold text-gray-900">How We Score</p>
          </Link>
          <Link
            href="/report-issue"
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm font-semibold text-gray-900">Report Issue</p>
          </Link>
        </div>

        {/* History Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📋 Scan History</h2>
            {history.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && history.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
                <p className="text-xs text-gray-600 font-semibold">Total Scans</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                <p className="text-xs text-gray-600 font-semibold">Avg Score</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-red-600">{stats.verdictCounts.bad}</p>
                <p className="text-xs text-gray-600 font-semibold">Bad Products</p>
              </div>
            </div>
          )}

          {/* Verdict Distribution */}
          {stats && history.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Product Breakdown</p>
              <div className="space-y-2">
                {[
                  { label: "Excellent", count: stats.verdictCounts.excellent, color: "bg-green-100" },
                  { label: "Good", count: stats.verdictCounts.good, color: "bg-green-50" },
                  { label: "Moderate", count: stats.verdictCounts.moderate, color: "bg-yellow-50" },
                  { label: "Poor", count: stats.verdictCounts.poor, color: "bg-orange-50" },
                  { label: "Bad", count: stats.verdictCounts.bad, color: "bg-red-50" },
                ].map((item) => (
                  item.count > 0 && (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className={`${item.color} rounded px-2 py-1 text-xs font-semibold`}>
                          {item.count}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No Scanned Products Yet</h3>
              <p className="text-gray-600 mb-6">
                Start scanning product barcodes to build your history and compare safety scores.
              </p>
              <Link
                href="/scan"
                className="inline-block rounded-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold transition"
              >
                📱 Scan Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Link
                  key={item.barcode}
                  href={`/product/${item.barcode}`}
                  className={`block ${getVerdictBgColor(item.verdict)} rounded-2xl p-4 shadow-sm hover:shadow-md transition border-l-4 ${
                    item.verdict === "Excellent"
                      ? "border-green-500"
                      : item.verdict === "Good"
                      ? "border-green-400"
                      : item.verdict === "Moderate"
                      ? "border-yellow-400"
                      : item.verdict === "Poor"
                      ? "border-orange-400"
                      : "border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <img
                      src={getProductImageUrl(item.image_url) || "https://placehold.co/80x80?text=Product"}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-contain bg-gray-200 flex-shrink-0"
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm truncate">
                        {item.brand || "Unknown brand"}
                      </p>

                      {/* Risk Counts */}
                      {(item.highRiskCount || item.mediumRiskCount) ? (
                        <div className="flex gap-2 mt-2 text-xs">
                          {item.highRiskCount ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                              {item.highRiskCount} High
                            </span>
                          ) : null}
                          {item.mediumRiskCount ? (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                              {item.mediumRiskCount} Med
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {/* Score & Verdict */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${getVerdictTextColor(item.verdict)}`}>
                            {item.score}/100
                          </span>
                          <span className={`text-xs font-semibold ${getVerdictTextColor(item.verdict)}`}>
                            {item.verdict}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatScanDate(item.scannedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(item.barcode);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold text-xl flex-shrink-0"
                      title="Delete from history"
                    >
                      ✕
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full">
            <h3 className="text-xl font-bold mb-2">Clear History?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete all scanned products from your history? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}