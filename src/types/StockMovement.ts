export type MovementType =
  | 'entrada'
  | 'saida'
  | 'criacao'
  | 'atualizacao'
  | 'remocao';

export interface StockMovement {
  id: string;
  productId: number;
  productName: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
}