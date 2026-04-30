import { Link } from '@tanstack/react-router';
import { ProductCard } from './ProductCard';
import type { Product } from '@/data/products';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onQuickView?: (product: Product) => void;
  maxItems?: number;
  viewMoreLink?: string;
}

export function ProductSection({ title, subtitle, products, onQuickView, maxItems, viewMoreLink }: ProductSectionProps) {
  const displayProducts = maxItems ? products.slice(0, maxItems) : products;
  const hasMore = maxItems ? products.length > maxItems : false;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl sm:text-4xl font-light text-foreground mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            onQuickView={onQuickView}
          />
        ))}
      </div>
      {hasMore && viewMoreLink && (
        <div className="text-center mt-10">
          <Link
            to={viewMoreLink as any}
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-200"
          >
            Ver más
          </Link>
        </div>
      )}
    </section>
  );
}
