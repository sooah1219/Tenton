import { RamenSelection } from "./ramen";

export type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  qty: number;
  ramen?: RamenSelection;
};

export type Cart = {
  items: CartItem[];
};
