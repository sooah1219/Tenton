import { NOODLES, PROTEINS, TOPPINGS, type ItemConfig } from "./MenuItemModal";

export function moneyFromCents(cents: number) {
  const n = cents / 100;
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

export function moneyFromDollars(dollars: number) {
  return dollars.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}

export function configKey(itemId: string, cfg: ItemConfig) {
  return `${itemId}|${JSON.stringify(cfg)}`;
}

function optionNameById(id: string, list: { id: string; name: string }[]) {
  return list.find((x) => x.id === id)?.name ?? "";
}

function toppingsSummary(ids: string[]) {
  const nameMap = new Map(TOPPINGS.map((t) => [t.id, t.name]));
  return ids.map((id) => nameMap.get(id) ?? "").filter(Boolean);
}

export function lineExtraPriceCents(cfg: ItemConfig) {
  const priceMap = new Map(TOPPINGS.map((t) => [t.id, t.priceDeltaCents]));
  const list = cfg.toppings ?? [];
  return list.reduce(
    (sum, t) => sum + (priceMap.get(t.optionId) ?? 0) * (t.qty ?? 1),
    0
  );
}

export function lineSummary(cfg: ItemConfig) {
  const protein = cfg.proteinOptionId
    ? optionNameById(cfg.proteinOptionId, PROTEINS)
    : "";
  const noodle = cfg.noodleOptionId
    ? optionNameById(cfg.noodleOptionId, NOODLES)
    : "";

  const toppingIds = (cfg.toppings ?? []).map((t) => t.optionId);
  const tops = toppingsSummary(toppingIds).map((t) => `+${t}`);

  return [protein, noodle, ...tops].filter(Boolean).join(" , ");
}
