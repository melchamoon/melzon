export type CartItem = {
  id: string;
  qty: number;
};

export type Cart = {
  items: CartItem[];
};
