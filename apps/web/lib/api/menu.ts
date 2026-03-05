import type { Category, MenuItem } from "@/types/menu";
import { apiFetch } from "./client";

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/menu/categories", { method: "GET" });
}

export type GetMenuItemsParams = {
  categoryId?: string;
  q?: string;
  includeInactive?: boolean;
};

export async function getMenuItems(
  params: GetMenuItemsParams = {}
): Promise<MenuItem[]> {
  const sp = new URLSearchParams();
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.q) sp.set("q", params.q);
  if (params.includeInactive) sp.set("includeInactive", "true");

  const qs = sp.toString();
  const url = qs ? `/api/menu/items?${qs}` : "/api/menu/items";

  return apiFetch<MenuItem[]>(url, { method: "GET" });
}
