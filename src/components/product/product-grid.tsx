import { ProductCard } from "./product-card";

interface ProductGridProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  isNew?: boolean;
  featured?: boolean;
  category?: { name: string; slug: string } | null;
}

interface ProductGridProps {
  products: ProductGridProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
