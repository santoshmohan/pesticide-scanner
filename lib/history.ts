export type HistoryItem = {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
  score: number;
  verdict: string;
  scannedAt: string;
};

const STORAGE_KEY = "pesticide-scan-history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveToHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;

  const current = getHistory();

  const filtered = current.filter((x) => x.barcode !== item.barcode);

  const updated = [item, ...filtered];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeFromHistory(barcode: string) {
  if (typeof window === "undefined") return;
  const current = getHistory();
  const updated = current.filter((x) => x.barcode !== barcode);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}