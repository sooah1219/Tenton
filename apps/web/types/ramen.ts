import type { Activatable, Currency, ID, Sortable, Timestamped } from "./menu";

export type OptionGroupKind = "protein" | "noodle" | "topping";
export type OptionSelection = "single" | "multi";

export type OptionGroup = Timestamped &
  Sortable &
  Activatable & {
    id: ID;

    kind: OptionGroupKind; // protein/noodle/topping
    title: string;
    step: 1 | 2 | 3;

    selection: OptionSelection; // single/multi
    required: boolean;

    minSelected: number; // 0 or 1
    maxSelected: number; // 1 or N
  };

export type Option = Timestamped &
  Sortable &
  Activatable & {
    id: ID;
    groupId: ID;

    name: string;
    description?: string | null;

    priceDeltaCents: number;
    currency: Currency;
    imageUrl?: string | null;

    maxQty?: number | null;
    defaultQty?: number | null;
  };

export type MenuItemOptionGroup = Timestamped &
  Sortable & {
    id: ID;
    menuItemId: ID;
    groupId: ID;

    requiredOverride?: boolean | null;
    minSelectedOverride?: number | null;
    maxSelectedOverride?: number | null;
  };

export type MenuItemAllowedOption = Timestamped & {
  id: ID;
  menuItemId: ID;
  optionId: ID;
};

export type RamenSelection = {
  proteinOptionId: ID;
  noodleOptionId: ID;
  toppings: { optionId: ID; qty: number }[];
  note?: string;
};

export type RamenConfigDTO = {
  menuItemId: ID;
  groups: {
    protein: { group: OptionGroup; options: Option[] };
    noodle: { group: OptionGroup; options: Option[] };
    topping: { group: OptionGroup; options: Option[] };
  };
  defaults?: Partial<RamenSelection>;
};
