// src/routes/tienda.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
// IMPORTANTE: Importamos womenProductTypes
import { womenProductTypes } from "@/data/products"; 
import { useProducts, type Product } from "@/context/ProductsContext";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";

type TiendaSearch = { tipo?: string };

export const Route = createFileRoute("/tienda")({
  component: TiendaPage,
  validateSearch: (search: Record<string, unknown>): TiendaSearch => ({
    tipo: typeof search.tipo === 'string' ? search.tipo : undefined,
  }),
});

function TiendaPage() {
  const { tipo } = Route.useSearch();
  const { products, loading } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Buscamos la categoría activa en womenProductTypes
  const activeCategory = womenProductTypes.find(c => c.id === tipo);

  // Filtro estricto: Comparamos el ID con productType o subcategory de Supabase
  const filteredProducts = activeCategory && activeCategory.id !== 'all'
    ? products.filter(p => p.productType === activeCategory.id || p.subcategory === activeCategory.id)
    : products;

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
          className="text-center mb-6"
        >
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-3">
            {activeCategory ? activeCategory.label : 'Tienda'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeCategory && activeCategory.id !== 'all' ? `Filtrando por ${activeCategory.label.toLowerCase()}` : 'Toda nuestra colección en un solo lugar'}
          </p>
        </motion.div>

        {/* Píldoras de filtro por categoría específicas */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {womenProductTypes.map((cat) => (
            <Link
              key={cat.id}
              to="/tienda"
              search={{ tipo: cat.id === 'all' ? undefined : cat.id }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                (tipo === cat.id || (!tipo && cat.id === 'all')) ? 'bg-foreground text-background shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-16 text-sm animate-pulse">Cargando colección...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No encontramos productos en esta categoría.</p>
          </div>
        ) : (
          <motion.div
            key={tipo ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product as any}
                index={i}
                onQuickView={setQuickViewProduct as any}
              />
            ))}
          </motion.div>
        )}
      </section>

      <QuickViewModal product={quickViewProduct as any} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}