import type { Product, Category } from "@beyana/types";

export type CartItem = Product & { quantity: number };
export type CategoryWithProducts = Category & { products: Product[] };
