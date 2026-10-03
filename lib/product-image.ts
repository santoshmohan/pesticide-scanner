export function getProductImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl) return undefined;

  return imageUrl.startsWith("/products/")
    ? imageUrl.replace(/^\/products\//, "/")
    : imageUrl;
}