import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/nuevo")({
  component: NuevoPage,
});

function NuevoPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  
  // Agregamos el estado de carga
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true); // Avisamos que empezó a cargar

    const { data, error } = (await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })) as any;

    if (error) {
      console.log(error);
      setIsLoading(false); // Quitamos la carga si hay error
      return;
    }

    const mapped = (data || []).map((p: any) => ({
      ...p,
      originalPrice: p.original_price,
      productType: p.product_type,
      stockStatus: p.stock_status,
      createdAt: p.created_at,
      isSale: p.original_price && p.original_price > p.price,
    }));

    setProducts(mapped);
    setIsLoading(false); // Avisamos que ya terminó de cargar
  }

  return (
    <>
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Inicio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-3">
            Nuevo
          </h1>

          <p className="text-sm text-muted-foreground">
            Recién llegados — estilos frescos para esta temporada
          </p>
        </motion.div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="aspect-[3/4] w-full bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md"></div>
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded-md"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No hay productos nuevos por el momento.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </motion.div>
        )}
      </section>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}