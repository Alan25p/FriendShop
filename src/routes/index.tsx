import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductSection } from "@/components/ProductSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { TrendingBanner } from "@/components/TrendingBanner";
import { Newsletter } from "@/components/Newsletter";
import { QuickViewModal } from "@/components/QuickViewModal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Nuevo: Estado de carga
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const { data, error } = (await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })) as any;

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        ...p,
        originalPrice: p.original_price,
        productType: p.product_type,
        stockStatus: p.stock_status,
        createdAt: p.created_at,
        isSale: p.original_price && p.original_price > p.price,
      }));

      setProducts(mapped);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Terminó de cargar
    }
  }

  // Skeletons para las secciones de productos
  const ProductSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="w-full aspect-[3/4] bg-muted rounded-3xl"></div>
          <div className="h-4 bg-muted rounded-md w-2/3"></div>
          <div className="h-3 bg-muted rounded-md w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const newArrivals = products.slice(0, 4);
  const saleItems = products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const popularItems = products.slice(4, 8);
  const collection = products.slice(0, 8);

  return (
    <main className="overflow-x-hidden">
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="py-12">
            <div className="h-8 bg-muted w-48 mb-6 rounded-lg animate-pulse"></div>
            <ProductSkeleton />
          </div>
        ) : (
          <ProductSection
            title="Colección Actual"
            subtitle="Piezas seleccionadas para esta temporada"
            products={collection}
            onQuickView={setQuickViewProduct}
          />
        )}
      </section>

      <CategoryGrid />

      <section className="max-w-7xl mx-auto px-4">
        {loading ? (
          <ProductSkeleton />
        ) : (
          newArrivals.length > 0 && (
            <ProductSection
              title="Nuevos Productos"
              subtitle="Recién llegados"
              products={newArrivals}
              onQuickView={setQuickViewProduct}
            />
          )
        )}
      </section>

      <TrendingBanner />

      <section className="max-w-7xl mx-auto px-4">
        {!loading && saleItems.length > 0 && (
          <ProductSection
            title="Ofertas"
            subtitle="Descuentos especiales"
            products={saleItems}
            onQuickView={setQuickViewProduct}
          />
        )}

        {!loading && popularItems.length > 0 && (
          <ProductSection
            title="Populares"
            subtitle="Lo más buscado"
            products={popularItems}
            onQuickView={setQuickViewProduct}
          />
        )}
      </section>

      <Newsletter />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}