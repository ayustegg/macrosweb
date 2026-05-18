import "server-only";

import {
  mapOffProductToFood,
  type OffProduct,
  type OffSearchResponse,
  type OffProductResponse,
} from "./mapper";
import type { Food } from "@/types/food";

const OFF_BASE_URL = "https://world.openfoodfacts.org";

const USER_AGENT =
  process.env.OPENFOODFACTS_USER_AGENT ||
  "MacrosWeb/1.0 (https://macrosweb.app)";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class LruCache<T> {
  private maxSize: number;
  private ttlMs: number;
  private map = new Map<string, CacheEntry<T>>();

  constructor(maxSize: number, ttlMs: number) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    if (this.map.size >= this.maxSize) {
      const first = this.map.keys().next().value;
      if (first !== undefined) this.map.delete(first);
    }
    this.map.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }
}

const searchCache = new LruCache<Food[]>(200, 5 * 60 * 1000);

async function offFetch<T>(
  url: string,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal,
    });

    if (!response.ok) {
      console.warn(`OFF API responded ${response.status} for ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("OFF API request timed out");
      return null;
    }
    console.warn("OFF API request failed:", error);
    return null;
  }
}

export async function searchByName(
  query: string,
  locale = "es"
): Promise<{ foods: Food[]; ok: boolean }> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { foods: [], ok: true };

  const cacheKey = `search:${locale}:${normalized}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return { foods: cached, ok: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const url = `${OFF_BASE_URL}/api/v2/search?query=${encodeURIComponent(normalized)}&lc=${locale}&fields=code,product_name,brands,image_url,nutriments,serving_size`;
  const data = await offFetch<OffSearchResponse>(url, controller.signal);

  clearTimeout(timeout);

  if (data === null) return { foods: [], ok: false };

  if (!data?.products?.length) return { foods: [], ok: true };

  const foods = data.products
    .filter((p: OffProduct) => p.product_name)
    .slice(0, 25)
    .map(mapOffProductToFood);

  searchCache.set(cacheKey, foods);
  return { foods, ok: true };
}

export async function getByBarcode(barcode: string): Promise<Food | null> {
  const normalized = barcode.trim();
  if (!normalized) return null;

  const cacheKey = `barcode:${normalized}`;
  const cached = searchCache.get(cacheKey);
  if (cached?.[0]) return cached[0];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const url = `${OFF_BASE_URL}/api/v2/product/${encodeURIComponent(normalized)}.json?fields=code,product_name,brands,image_url,nutriments,serving_size`;
  const data = await offFetch<OffProductResponse>(url, controller.signal);

  clearTimeout(timeout);

  if (!data?.product || data.status !== 1) return null;

  const food = mapOffProductToFood(data.product);
  searchCache.set(cacheKey, [food]);
  return food;
}
