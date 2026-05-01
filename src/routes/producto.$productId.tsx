import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/context/ProductsContext";
import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/lib/format";
import { getProductBadge, getStockLabel } from "@/data/products";
import { ShoppingBag, ChevronLeft, Heart, Check, AlertCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/producto/$productId")({
  component: ProductDetailComponent,
});

function ProductDetailComponent() {
  const { productId } = Route.useParams();
  const { products } = useProducts();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // 1. Buscamos el producto
  const product = products?.find((p) => p.id === productId);

  // 2. Efecto para logging (Sin returns de JSX aquí)
  useEffect(() => {
    if (product) {
      console.log("Producto cargado correctamente:", product.name);
    }
  }, [product]);

  // 3. ESTADOS DE CARGA Y ERROR (Después de los hooks)
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="text-center">
          <h2 className="text-lg font-light uppercase tracking-widest text-zinc-400">Producto no encontrado</h2>
          <Link to="/" className="mt-4 inline-block text-[10px] underline uppercase tracking-widest text-zinc-900">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // 4. LÓGICA DE DERIVACIÓN (Ahora sí, product existe con seguridad)
  const badge = getProductBadge(product as any); 
  const stockLabel = getStockLabel(product.stockStatus as any);
  const isOutOfStock = product.stockStatus !== 'disponible';
  const isFavorited = isFavorite(product.id);
  const hasSizes = product.has_sizes && product.sizes;
  const sizeNames = ['ECH', 'CH', 'M', 'G', 'EG'];

  // 5. FUNCIÓN PARA AÑADIR Y DESCONTAR EN SUPABASE
  const handleAddToCart = async () => {
    if (hasSizes && !selectedSize) {
      toast.error("Selecciona una talla primero.");
      return;
    }

    addToCart(product, selectedSize || undefined);
    setAdded(true);

    if (hasSizes && selectedSize) {
      const currentStock = Number(product.sizes[selectedSize] || 0);
      
      if (currentStock > 0) {
        const newSizes = { 
          ...product.sizes, 
          [selectedSize]: currentStock - 1 
        };

        const { error } = await (supabase.from('products') as any)
          .update({ sizes: newSizes })
          .eq('id', product.id);

        if (error) {
          console.error("Error Supabase:", error);
        } else {
          toast.success(`Talla ${selectedSize} apartada.`);
          setTimeout(() => window.location.reload(), 800); 
        }
      }
    }
    setTimeout(() => setAdded(false), 2000);
  };

  // 6. RENDER PRINCIPAL
  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-5xl pt-8">
        
        <Link to="/" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] mb-8 font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
          <ChevronLeft size={12} /> Regresar a la colección
        </Link>

        <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* IZQUIERDA: GALERÍA */}
            <div className="lg:col-span-7 bg-zinc-50/50 p-6 lg:p-10">
              <div className="flex flex-col md:flex-row-reverse gap-4">
                <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-inner border border-zinc-100">
                  <img 
                    src={product.images[activeImage]} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4 transition-all duration-700"
                  />
                  <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-sm active:scale-90 transition-all"
                  >
                    <Heart size={18} className={isFavorited ? "fill-primary text-primary" : "text-zinc-300"} />
                  </button>
                </div>

                <div className="flex md:flex-col gap-2 overflow-x-auto md:w-20">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-primary shadow-md' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DERECHA: INFO */}
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-heading font-bold italic tracking-tighter uppercase text-zinc-900">
                      {product.name}
                    </h1>
                  </div>
                  <p className="text-xl font-light text-zinc-500 tracking-tight">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* TALLAS */}
                {hasSizes && (
                  <div className="mb-8 pt-8 border-t border-zinc-50">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Seleccionar Talla</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {sizeNames.map(size => {
                        const stockRaw = product.sizes ? product.sizes[size] : 0;
                        const stockValue = Number(stockRaw ?? 0);
                        const isAvailable = stockValue > 0;
                        
                        return (
                          <button 
                            key={size}
                            disabled={!isAvailable}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 rounded-xl border text-[10px] font-bold transition-all duration-300 relative ${
                              !isAvailable 
                                ? 'bg-zinc-50 text-zinc-200 border-zinc-100 cursor-not-allowed opacity-50' 
                                : selectedSize === size 
                                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' 
                                  : 'border-zinc-100 hover:border-zinc-300 text-zinc-600'
                            }`}
                          >
                            <span className={!isAvailable ? 'line-through' : ''}>{size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-8 pt-8 border-t border-zinc-50">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Descripción</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-light italic">
                    {product.description || "Pieza curada bajo los estándares de FriendShop."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] uppercase tracking-widest text-red-500/80 font-bold leading-relaxed">
                      No hay cambios ni devoluciones. Verifica tu talla antes de comprar.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-green-50/50 rounded-2xl border border-green-100/50">
                    <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                    <p className="text-[9px] uppercase tracking-widest text-green-600 font-bold">
                      Entregas personales en Orizaba
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
                    isOutOfStock ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' :
                    added ? "bg-green-500 text-white shadow-green-200" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200"
                  }`}
                >
                  {added ? <><Check size={18} /> ¡Añadido!</> : <><ShoppingBag size={18} /> {isOutOfStock ? 'Agotado' : 'Añadir a la bolsa'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}