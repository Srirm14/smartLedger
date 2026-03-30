/**
 * Inventory product list: newest first (higher id, then newer createdAt).
 * Used by React Query and Zustand so Product + Island flows stay consistent.
 */
export function sortInventoryByNewestFirst(list) {
  return [...list].sort((a, b) => {
    const idA = Number(a.id) || 0;
    const idB = Number(b.id) || 0;
    if (idB !== idA) return idB - idA;
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });
}

export function mapInventoryApiRow(item) {
  return {
    id: item.id,
    product: item.product,
    category: item.category,
    price: item.price,
    uom: item.uom,
    discontinued: item.discontinued,
    createdAt: item.created_at,
  };
}

/** Object map from GET /product/get → sorted UI rows */
export function normalizeInventoryResponse(response) {
  if (!response || typeof response !== "object") return [];
  const rows = Object.values(response).map(mapInventoryApiRow);
  return sortInventoryByNewestFirst(rows);
}
