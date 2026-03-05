export type ID = string;
export type ISODateTimeString = string;
export type Currency = "CAD";

export type Timestamped = {
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type Sortable = { sortOrder: number };
export type Activatable = { isActive: boolean };

export type MenuItemKind = "ramen" | "food" | "drink";

export type Category = Timestamped &
  Sortable &
  Activatable & {
    id: ID;
    name: string;
    icon?: string | null;
  };

export type MenuItem = Timestamped &
  Sortable &
  Activatable & {
    id: ID;
    categoryId: ID;
    kind: MenuItemKind;
    name: string;
    description?: string | null;
    priceCents: number;
    currency: Currency;
    imageUrl?: string | null;
  };
