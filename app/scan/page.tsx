"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { 
  saveToHistory, 
  getRecentScans, 
  formatScanDate 
} from "@/lib/history";
import { 
  getVerdictColor, 
  getRiskLevelColor,
  getSafetyPercentage 
} from "@/lib/score";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import type { HistoryItem, ScoreResult } from "@/lib/history";

type Product = {
  id: number;
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
};

type Ingredient = {
  id: number;
  name: string;
  risk_level: "low" | "medium" | "high";
  score_penalty: number;
  concerns: string;
};

type ApiResponse = {
  found: boolean;
  message?: string;
  product?: Product;
  ingredients?: Ingredient[];
  result?: ScoreResult;
  stats?: {
    totalIngredients: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    totalPenalty: number;
    safetyPercentage: number;
  };
  ui?: {
    verdictColor: string;
    riskLevelColors: {
      high: string;
      medium: string;
      low: string;
    };
  };
};

type SampleBarcode = {
  barcode: string;
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const [sampleBarcode, setSampleBarcode] = useState<SampleBarcode | null>(null);
  const [sampleLoading, setSampleLoading] = useState(true);
  const [sampleCopied, setSampleCopied] = useState(false);
  const [recentScans, setRecentScans] = useState<HistoryItem[]>([]);
  const router = useRouter();

  // Load sample barcode and recent scans on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/products/sample", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as SampleBarcode;
          setSampleBarcode(data);
        }
      } catch (err) {
        console.error("Failed to load sample barcode:", err);
      } finally {
        setSampleLoading(false);
      }

      // Load recent scans from localStorage
      const recent = getRecentScans(5);
      setRecentScans(recent);
    }

    loadInitialData();
  }, []);

  async function lookupBarcode(code: string) {
    if (!code.trim()) {
      setError("Please enter or scan a barcode");
      return;
    }

    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      const res = await fetch(`/api/products/${code}`);
      const data = (await res.json()) as ApiResponse;
      
      setBarcode(code);
      setScanResult(data);

      if (data.found && data.product && data.result && data.stats) {
        // Save to history with complete data
        const historyItem: HistoryItem = {
          barcode: code,
          name: data.product.name,
          brand: data.product.brand,
          category: data.product.category,
          image_url: data.product.image_url,
          score: data.result.score,
          verdict: data.result.verdict,
          scannedAt: new Date().toISOString(),
          totalIngredients: data.stats.totalIngredients,
          highRiskCount: data.stats.highRiskCount,
          mediumRiskCount: data.stats.mediumRiskCount,
        };

        saveToHistory(historyItem);

        // Update recent scans
        setRecentScans(getRecentScans(5));

        // Redirect after a brief delay
        setTimeout(() => {
          router.push(`/product/${data.product?.barcode || code}`);
        }, 500);
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Failed to fetch product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startScanner() {
    setError("");
    setScanResult(null);

    try {
      const codeReader = new BrowserMultiFormatReader();
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (!devices.length) {
        setError("No camera found. Please use manual entry or check permissions.");
        return;
      }

      const selectedDeviceId = devices[0].deviceId;

      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            const scannedCode = result.getText();
            controls.stop();
            controlsRef.current = null;
            setScannerStarted(false);
            await lookupBarcode(scannedCode);
          }
        }
      );

      controlsRef.current = controls;
      setScannerStarted(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError(
        "Camera access failed. Please allow camera permissions or enter barcode manually."
      );
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScannerStarted(false);
  }

  function resetAll() {
    stopScanner();
    setBarcode("");
    setManualBarcode("");
    setScanResult(null);
    setError("");
    setLoading(false);
  }

  async function copySampleBarcode() {
    if (!sampleBarcode) return;

    try {
      await navigator.clipboard.writeText(sampleBarcode.barcode);
      setManualBarcode(sampleBarcode.barcode);
      setSampleCopied(true);
      setTimeout(() => setSampleCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Could not copy barcode. Please select it and copy manually.");
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const score = scanResult?.result?.score ?? 0;
  const stats = scanResult?.stats;
  const resultUI = scanResult?.ui;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">📱 Scan Product</h1>
          <p className="text-sm text-gray-600 mt-2">
            Scan a barcode or enter it manually to check ingredient safety
          </p>
        </div>

        {/* Camera Scanner Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden space-y-3 p-4">
          <div className="space-y-3">
            <video
              ref={videoRef}
              className="w-full rounded-xl border-2 border-gray-200 bg-black min-h-[240px]"
            />

            {!scannerStarted ? (
              <button
                onClick={startScanner}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
              >
                📷 Start Camera Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition"
              >
                ⏹️ Stop Scanner
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400 font-semibold">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  lookupBarcode(manualBarcode);
                }
              }}
              placeholder="Enter barcode manually"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <button
              onClick={() => lookupBarcode(manualBarcode)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "🔍 Looking up..." : "🔍 Search Barcode"}
            </button>
          </div>
        </div>

        {/* Sample Barcode Card */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Try a Sample Barcode</p>
              <p className="text-sm text-gray-600 mt-1">
                Copy the example below to test the app
              </p>

              {sampleLoading ? (
                <div className="mt-3 text-sm text-gray-500">Loading sample...</div>
              ) : sampleBarcode ? (
                <div className="mt-3 flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                  <code className="flex-1 text-sm font-mono text-gray-700 break-all">
                    {sampleBarcode.barcode}
                  </code>
                  <button
                    onClick={copySampleBarcode}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap ml-2"
                  >
                    {sampleCopied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Scanned Barcode Display */}
        {barcode && (
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 font-semibold uppercase">Scanned Barcode</p>
            <p className="font-mono text-lg mt-1">{barcode}</p>
          </div>
        )}

        {/* Scan Result - Found */}
        {scanResult?.found && scanResult.product && scanResult.result && stats && resultUI && (
          <div className="space-y-4 animate-in fade-in">
            {/* Score Card */}
            <div
              className={`text-white rounded-2xl p-6 text-center border-4 ${resultUI.verdictColor}`}
            >
              <p className="text-xs uppercase font-semibold opacity-90">Safety Score</p>
              <p className="text-5xl font-bold mt-2">{scanResult.result.score}</p>
              <p className="text-lg font-semibold mt-1">{scanResult.result.verdict}</p>
              <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-1 inline-block text-sm">
                {stats.safetyPercentage}% safe
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {scanResult.product.image_url && (
                <img
                  src={scanResult.product.image_url}
                  alt={scanResult.product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="font-bold text-xl">{scanResult.product.name}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {scanResult.product.brand || "Unknown brand"}
                {scanResult.product.category && ` • ${scanResult.product.category}`}
              </p>
            </div>

            {/* Risk Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stats.highRiskCount}
                </p>
                <p className="text-xs text-red-600 font-semibold">High Risk</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.mediumRiskCount}
                </p>
                <p className="text-xs text-yellow-600 font-semibold">Medium Risk</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.lowRiskCount}
                </p>
                <p className="text-xs text-green-600 font-semibold">Low Risk</p>
              </div>
            </div>

            {/* Summary */}
            {scanResult.result.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">{scanResult.result.summary}</p>
              </div>
            )}

            {/* Ingredients List */}
            {scanResult.ingredients && scanResult.ingredients.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold">
                    Ingredients ({scanResult.ingredients.length})
                  </h3>
                </div>
                <div className="divide-y">
                  {scanResult.ingredients.map((ingredient) => {
                    const color = getRiskLevelColor(ingredient.risk_level);
                    return (
                      <div
                        key={ingredient.id}
                        className={`p-4 ${color}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-semibold">{ingredient.name}</p>
                            <p className="text-xs opacity-75 mt-1 uppercase font-semibold">
                              {ingredient.risk_level} Risk
                            </p>
                            <p className="text-sm mt-2">{ingredient.concerns}</p>
                          </div>
                          <span className="text-lg font-bold opacity-50 whitespace-nowrap">
                            -{ingredient.score_penalty}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600">
                ⚠️ <strong>Disclaimer:</strong> This score is for educational purposes only and 
                does not replace official label instructions or regulatory guidance.
              </p>
            </div>
          </div>
        )}

        {/* Scan Result - Not Found */}
        {scanResult && !scanResult.found && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
            <p className="text-orange-900 font-medium text-lg">🔍 Product Not Found</p>
            <p className="text-orange-700 text-sm mt-2">
              {scanResult.message ||
                "We couldn't find this product in our database. Try another barcode."}
            </p>
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && !scanResult && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">📋 Recent Scans</h3>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {recentScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setManualBarcode(scan.barcode);
                    lookupBarcode(scan.barcode);
                  }}
                  className="w-full text-left p-4 hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-900">{scan.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {scan.brand} • {formatScanDate(scan.scannedAt)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold">{scan.score}/100</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {scan.verdict}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {scanResult && (
          <button
            onClick={resetAll}
            className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition"
          >
            🔄 Reset & Scan Again
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  );
}