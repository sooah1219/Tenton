import { MenuItem } from "./menu";

export type ProteinOption = MenuItem & {
  kind: "protein";
};

export type NoodleOption = MenuItem & {
  kind: "noodle";
};

export type ToppingOption = MenuItem & {
  kind: "topping";
  maxQty?: number;
  defaultQty?: number;
};

export type ChoiceGroup<T extends MenuItem> = {
  id: string;
  title: string;
  step: 1 | 2 | 3;
  required?: boolean;
  selection: "single" | "multi";
  options: T[];
  minSelected?: number;
  maxSelected?: number;
};

export type RamenSelection = {
  proteinId: string;
  noodleId: string;
  toppings: { id: string; qty: number; image: string }[];
  note?: string;
};

export type RamenMenuItem = MenuItem & {
  kind: "ramen";
  description?: string;
  groups: {
    protein: ChoiceGroup<ProteinOption>;
    noodle: ChoiceGroup<NoodleOption>;
    topping: ChoiceGroup<ToppingOption>;
  };
  defaults?: Partial<RamenSelection>;
};
