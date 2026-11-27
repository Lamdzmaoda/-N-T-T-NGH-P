export type CategoryType = "EXPENSE" | "INCOME";
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  isActive: boolean;
}
export interface CategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}