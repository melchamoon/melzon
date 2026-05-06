export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  reviews: string[];
  featured?: boolean;
  category?: string;
};
