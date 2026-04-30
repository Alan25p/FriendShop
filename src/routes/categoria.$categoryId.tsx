import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { 
  womenProductTypes, 
  menProductTypes,
  makeupTypes,
  shoeTypes,
  accessoryTypes
} from "@/data/products"; 
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { useProducts } from "@/context/ProductsContext";

const categoryMap: Record<string, { key: string; title: string; description: string }> = {
  mujer: { key: "women", title: "Mujer", description: "Descubre nuestra colección completa para mujer" },
  hombre: { key: "men", title: "Hombre", description: "Explora nuestra colección para hombre" },
  unisex: { key: "unisex", title: "Unisex", description: "Piezas versátiles para todos los estilos" },
};

export const Route = createFileRoute("/categoria/$categoryId")({
  component: CategoryPage,
});

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const { products, loading } = useProducts(); 
  
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [activeSecondaryType, setActiveSecondaryType] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  const category = categoryMap[categoryId || ""];

  useEffect(() => {
    setActiveSubcategory("all");
    setActiveSecondaryType("all");
  }, [categoryId]);

  useEffect(() => {
    setActiveSecondaryType("all");
  }, [activeSubcategory]);

  // Si la categoría no existe en el mapa, detenemos la renderización aquí mismo para evitar errores 500
  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-foreground mb-2">Categoría no encontrada</h1>
          <Link to="/" className="text-sm text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const currentSubcategories = useMemo(() => {
    if (categoryId === "mujer") return womenProductTypes;
    if (categoryId === "hombre") return menProductTypes;
    if (categoryId === "unisex") {
      return [
        { id: "all", label: "Todo" },
        { id: "ropa", label: "Ropa" },
        { id: "accesorio", label: "Accesorios" }
      ];
    }
    return [];
  }, [categoryId]);

  // --- FILTRADO SEGURO DE SUBMENÚS ---
  const getSecondaryOptions = (mainId: string) => {
    let list: any[] = [];
    if (mainId === "maquillaje") list = [...makeupTypes];
    if (mainId === "zapato") list = [...shoeTypes];
    if (mainId === "accesorio") list = [...accessoryTypes];

    if (list.length === 0) return null;

    // Validación segura de la categoría
    const isMen = category?.key === "men";
    const isUnisex = category?.key === "unisex";

    if (isMen || isUnisex) {
      const forbiddenKeywords = [
        "zapatilla", "tacon", "bolso", "cartera", "maquillaje", 
        "labial", "falda", "vestido", "pendientes", "gala"
      ];

      list = list.filter(item => {
        // Aseguramos que item.id y item.label existan antes de convertirlos a minúsculas
        const itemId = item?.id?.toLowerCase() || "";
        const itemLabel = item?.label?.toLowerCase() || "";
        return !forbiddenKeywords.some(key => 
          itemId.includes(key) || itemLabel.includes(key)
        );
      });
    }

    const labelMap: Record<string, string> = { 
      maquillaje: "Todo Maquillaje", 
      zapato: "Todos los Zapatos", 
      accesorio: "Todos los Accesorios" 
    };

    return [{ id: "all", label: labelMap[mainId] || "Todo" }, ...list];
  };

  const secondaryOptions = getSecondaryOptions(activeSubcategory);

  // --- LÓGICA DE PRODUCTOS ---
  // Nos aseguramos de que products exista (fallback a array vacío)
  const safeProducts = products || [];
  const categoryProducts = safeProducts.filter((p) => p.category === category.key);
  let filteredProducts = [...categoryProducts];

  if (activeSubcategory !== "all") {
    if (secondaryOptions) {
      if (activeSecondaryType !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.productType === activeSecondaryType);
      } else {
        const subcatMapping: Record<string, string> = { 
          zapato: "zapatos", 
          accesorio: "accesorios", 
          maquillaje: "maquillaje" 
        };
        const mappedSubcat = subcatMapping[activeSubcategory];
        filteredProducts = filteredProducts.filter((p) => 
          p.subcategory === mappedSubcat || p.productType === activeSubcategory
        );
      }
    } else {
      filteredProducts = filteredProducts.filter((p) => 
        p.productType === activeSubcategory || p.subcategory === activeSubcategory
      );
    }
  }

  // Lógica del aviso de construcción segura
  const showComingSoon = category.key === "men" && categoryProducts.length === 0;
  const showSubcategories = !showComingSoon && currentSubcategories.length > 0;

  return (
    <>
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> Inicio
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-3">{category.title}</h1>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </motion.div>

        {showSubcategories && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full ${secondaryOptions ? 'mb-4' : 'mb-10'}`}>
            <nav className="flex md:justify-center overflow-x-auto gap-2 pb-2 px-1 snap-x scrollbar-hide">
              {currentSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeSubcategory === sub.id ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}

        {showSubcategories && secondaryOptions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mb-10">
            <nav className="flex md:justify-center overflow-x-auto gap-2 pb-2 px-1 snap-x scrollbar-hide">
              {secondaryOptions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSecondaryType(sub.id)}
                  className={`snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activeSecondaryType === sub.id ? "border-foreground bg-foreground text-background shadow-sm" : "border-muted text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
             {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="aspect-[3/4] bg-muted rounded-3xl" />
             ))}
           </div>
        ) : showComingSoon ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <div className="opacity-30 grayscale-[0.5] mb-4">
               <p className="text-7xl">🚧</p>
            </div>
            <h2 className="font-heading text-2xl text-foreground/80 mb-2">Próximamente</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Estamos preparando una colección increíble para hombre. ¡Vuelve pronto!</p>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No hay productos en esta selección.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product as any} index={i} onQuickView={setQuickViewProduct} />
            ))}
          </motion.div>
        )}
      </section>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}