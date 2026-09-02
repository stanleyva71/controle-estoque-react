import type { StockMovement, MovementType } from "../types/StockMovement";

const STORAGE_KEY = "stockMovements";

export function getStockMovements(): StockMovement[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveStockMovements(movements: StockMovement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
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