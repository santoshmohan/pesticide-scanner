export type HistoryItem = {
  id?: string; // Unique identifier
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
  score: number;
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad";
  scannedAt: string; // ISO 8601 timestamp
  totalIngredients?: number;
  highRiskCount?: number;
  mediumRiskCount?: number;
  notes?: string; // User-added notes
};

const STORAGE_KEY = "pesticide-scan-history";
const MAX_HISTORY_ITEMS = 100; // Limit history size

/**
 * Get all history items, newest first
 */
export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to parse history:", error);
    return [];
  }
}

/**
 * Get a single history item by barcode
 */
export function getHistoryByBarcode(barcode: string): HistoryItem | undefined {
  return getHistory().find((item) => item.barcode === barcode);
}

/**
 * Save or update an item in history
 * - Moves duplicate to top (newest first)
 * - Limits history to MAX_HISTORY_ITEMS
 */
export function saveToHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;

  try {
    const current = getHistory();

    // Generate unique ID if not present
    const itemWithId: HistoryItem = {
      ...item,
      id: item.id || generateId(),
      scannedAt: item.scannedAt || new Date().toISOString(),
    };

    // Remove duplicate barcode (if exists)
    const filtered = current.filter((x) => x.barcode !== item.barcode);

    // Add new item to front (newest first)
    const updated = [itemWithId, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
}

/**
 * Update notes for a history item
 */
export function updateHistoryNotes(barcode: string, notes: string) {
  if (typeof window === "undefined") return;

  try {
    const current = getHistory();
    const updated = current.map((item) =>
      item.barcode === barcode ? { ...item, notes } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update notes:", error);
  }
}

/**
 * Remove a single item from history
 */
export function removeFromHistory(barcode: string) {
  if (typeof window === "undefined") return;

  try {
    const current = getHistory();
    const updated = current.filter((x) => x.barcode !== barcode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove from history:", error);
  }
}

/**
 * Clear entire history
 */
export function clearHistory() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

/**
 * Get history stats
 */
export function getHistoryStats() {
  const history = getHistory();

  return {
    totalScans: history.length,
    averageScore: Math.round(
      history.reduce((sum, item) => sum + item.score, 0) / history.length || 0
    ),
    verdictCounts: {
      excellent: history.filter((x) => x.verdict === "Excellent").length,
      good: history.filter((x) => x.verdict === "Good").length,
      moderate: history.filter((x) => x.verdict === "Moderate").length,
      poor: history.filter((x) => x.verdict === "Poor").length,
      bad: history.filter((x) => x.verdict === "Bad").length,
    },
    riskStats: {
      highRiskTotal: history.reduce((sum, item) => sum + (item.highRiskCount || 0), 0),
      mediumRiskTotal: history.reduce((sum, item) => sum + (item.mediumRiskCount || 0), 0),
    },
  };
}

/**
 * Filter history by verdict
 */
export function filterByVerdict(
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad"
): HistoryItem[] {
  return getHistory().filter((item) => item.verdict === verdict);
}

/**
 * Filter history by date range
 */
export function filterByDateRange(startDate: Date, endDate: Date): HistoryItem[] {
  return getHistory().filter((item) => {
    const itemDate = new Date(item.scannedAt);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Search history by product name or brand
 */
export function searchHistory(query: string): HistoryItem[] {
  const lowerQuery = query.toLowerCase();
  return getHistory().filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand?.toLowerCase().includes(lowerQuery) ||
      item.barcode.includes(query)
  );
}

/**
 * Get recently scanned items (last N items)
 */
export function getRecentScans(limit: number = 5): HistoryItem[] {
  return getHistory().slice(0, limit);
}

/**
 * Export history as JSON
 */
export function exportHistoryAsJSON(): string {
  return JSON.stringify(getHistory(), null, 2);
}

/**
 * Export history as CSV
 */
export function exportHistoryAsCSV(): string {
  const history = getHistory();

  if (history.length === 0) {
    return "";
  }

  // CSV headers
  const headers = [
    "Barcode",
    "Product Name",
    "Brand",
    "Category",
    "Score",
    "Verdict",
    "Scanned At",
    "High Risk",
    "Medium Risk",
    "Notes",
  ];

  // CSV rows
  const rows = history.map((item) => [
    item.barcode,
    item.name,
    item.brand || "",
    item.category || "",
    item.score,
    item.verdict,
    new Date(item.scannedAt).toLocaleString(),
    item.highRiskCount || 0,
    item.mediumRiskCount || 0,
    `"${item.notes ? item.notes.replace(/"/g, '""') : ""}"`, // Escape quotes
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

/**
 * Import history from JSON
 */
export function importHistoryFromJSON(jsonString: string) {
  if (typeof window === "undefined") return;

  try {
    const imported = JSON.parse(jsonString) as HistoryItem[];

    if (!Array.isArray(imported)) {
      throw new Error("Invalid JSON format");
    }

    // Validate items
    const validItems = imported.filter(
      (item) =>
        item.barcode &&
        item.name &&
        item.score !== undefined &&
        item.verdict
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
  } catch (error) {
    console.error("Failed to import history:", error);
    throw error;
  }
}

/**
 * Generate a unique ID (UUID v4-like)
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatScanDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

/**
 * Get all unique categories from history
 */
export function getUniqueCategoriesFromHistory(): string[] {
  const categories = new Set<string>();
  getHistory().forEach((item) => {
    if (item.category) categories.add(item.category);
  });
  return Array.from(categories).sort();
}

/**
 * Get all unique brands from history
 */
export function getUniqueBrandsFromHistory(): string[] {
  const brands = new Set<string>();
  getHistory().forEach((item) => {
    if (item.brand) brands.add(item.brand);
  });
  return Array.from(brands).sort();
}