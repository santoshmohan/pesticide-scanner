"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { saveToHistory } from "../../lib/history";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";

type Ingredient = {
  id: number;
  name: string;
  risk_level: string;
  score_penalty: number;
  concerns: string;
};

type ScanResult = {
  found: boolean;
  message?: string;
  product?: {
    barcode?: string;
    name: string;
    brand?: string;
    category?: string;
  };
  ingredients?: Ingredient[];
  result?: {
    score: number;
    verdict: string;
    warnings: {
      ingredient: string;
      concerns: string;
    }[];
  };
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const router = useRouter();

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
      const data = await res.json();
      setBarcode(code);
      setScanResult(data);
      if (data.found && data.product && data.result) {
        saveToHistory({
          barcode: code,
          name: data.product.name,
          brand: data.product.brand,
          category: data.product.category,
          image_url: data.product.image_url,
          score: data.result.score,
          verdict: data.result.verdict,
          scannedAt: new Date().toISOString(),
        });

        router.push(`/product/${data.product.barcode || code}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch product");
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
        setError("No camera found");
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
      console.error(err);
      setError("Camera access failed. Please allow camera permission or enter barcode manually.");
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

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const score = scanResult?.result?.score ?? 0;

  const scoreColor =
    score >= 70
      ? "bg-green-500"
      : score >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Scan Product</h1>
        <p className="text-sm text-gray-600 text-center">
          Scan a barcode with your camera or enter it manually.
        </p>

        {/* Camera Section */}
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="w-full rounded-xl border bg-black min-h-[220px]"
          />

          {!scannerStarted ? (
            <button
              onClick={startScanner}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium"
            >
              Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium"
            >
              Stop Scanner
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Manual Input */}
        <div className="space-y-3">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode manually"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={() => lookupBarcode(manualBarcode)}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Search Barcode"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {/* Barcode */}
        {barcode && (
          <div className="border rounded-xl p-3 bg-gray-50">
            <p className="text-sm text-gray-500">Barcode</p>
            <p className="font-mono">{barcode}</p>
          </div>
        )}

        {/* Found Result */}
        {scanResult?.found && scanResult.product && scanResult.result && (
          <div className="space-y-4">
            <div className={`text-white ${scoreColor} rounded-2xl p-6 text-center`}>
              <p className="text-sm uppercase">Score</p>
              <p className="text-4xl font-bold">{scanResult.result.score}/100</p>
              <p className="text-lg">{scanResult.result.verdict}</p>
            </div>

            <div className="border rounded-xl p-4">
              <h2 className="font-bold text-lg">{scanResult.product.name}</h2>
              <p className="text-gray-600">
                {scanResult.product.brand || "Unknown brand"}
                {" • "}
                {scanResult.product.category || "Unknown category"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <ul className="space-y-2">
                {scanResult.ingredients?.map((ingredient) => (
                  <li key={ingredient.id} className="border rounded-lg p-3">
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-gray-600">
                      Risk: {ingredient.risk_level} | Penalty: -{ingredient.score_penalty}
                    </p>
                    <p className="text-sm">{ingredient.concerns}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-gray-500 border-t pt-3">
              This score is for educational/demo purposes only and does not replace
              official label instructions or regulatory guidance.
            </div>
          </div>
        )}

        {/* Not Found */}
        {scanResult && !scanResult.found && (
          <div className="border rounded-xl p-4 text-center">
            <p className="text-gray-700">
              {scanResult.message || "Product not found"}
            </p>
          </div>
        )}

        {/* Reset */}
        <button
          onClick={resetAll}
          className="w-full bg-black text-white py-3 rounded-xl font-medium"
        >
          Reset
        </button>
      </div>
      <BottomNav />
    </main>

  );
}