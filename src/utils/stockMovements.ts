import type { StockMovement } from "../types/StockMovement";

const STORAGE_KEY = "stockMovements";

export function getStockMovements(): StockMovement[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

export function addStockMovement(
  movement: Omit<StockMovement, "id" | "date">
): void {
  const movements = getStockMovements();

  const newMovement: StockMovement = {
    ...movement,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  movements.unshift(newMovement);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(movements)
  );
}