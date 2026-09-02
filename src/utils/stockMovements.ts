import type { StockMovement } from "../types/StockMovement";

const STORAGE_KEY = "stockMovements";
const STOCK_MOVEMENT_EVENT = "stockMovementsUpdated";

export function getStockMovements(): StockMovement[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as StockMovement[];
  } catch {
    return [];
  }
}

export function saveStockMovements(movements: StockMovement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));

  window.dispatchEvent(
    new CustomEvent(STOCK_MOVEMENT_EVENT)
  );
}

export function addStockMovement(
  movement: Omit<StockMovement, "id" | "date">
) {
  const movements = getStockMovements();

  const newMovement: StockMovement = {
    ...movement,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  saveStockMovements([newMovement, ...movements]);
}