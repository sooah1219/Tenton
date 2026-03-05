import type { Currency, ID, Timestamped } from "./menu";
import type { RamenSelection } from "./ramen";

export type CartItem = {
  id: ID;
  menuItemId: ID;
  nameSnapshot: string;
  unitBasePriceCentsSnapshot: number;
  currency: Currency;
  qty: number;
  ramen?: RamenSelection;
};

export type Cart = {
  items: CartItem[];
};

export type OrderStatus = "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID";
export type PayMethod = "store" | "card";

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note?: string | null;
};

export type Order = Timestamped & {
  id: ID;
  status: OrderStatus;

  paymentStatus: PaymentStatus;
  payMethod: PayMethod;
  customer: CustomerInfo;
  currency: Currency;
  pickupAt: string; // ISO string
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

export type OrderLineItem = Timestamped & {
  id: ID;
  orderId: ID;
  menuItemId: ID;
  itemNameSnapshot: string;
  itemImageUrlSnapshot?: string | null;
  unitBasePriceCentsSnapshot: number;
  currency: Currency;
  qty: number;
  note?: string | null;
  lineSubtotalCentsSnapshot: number;
};

export type OrderLineOption = Timestamped & {
  id: ID;
  orderLineItemId: ID;
  groupId: ID;
  groupTitleSnapshot: string;
  optionId: ID;
  optionNameSnapshot: string;
  unitPriceDeltaCentsSnapshot: number;
  qty: number;
};

export type OrderDTO = Order & {
  lineItems: Array<
    OrderLineItem & {
      options: OrderLineOption[];
    }
  >;
};

export type CreateOrderRequestDTO = {
  payMethod: PayMethod;
  pickupAt: string; // ISO string
  customer: CustomerInfo;
  items: Array<{
    menuItemId: ID;
    qty: number;
    note?: string;
    ramen?: RamenSelection;
  }>;
};

export type CreateOrderResponseDTO = { orderId: ID };
