export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  reviews: string[];
  featured?: boolean;
  category?: string;
};
