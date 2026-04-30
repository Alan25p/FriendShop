import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getProductBadge } from '@/data/products'; // Mantenemos tu utilidad de etiquetas
import { formatPrice } from '@/lib/format';
import { useShop } from '@/context/ShopContext';
import { useProducts, type Product } from '@/context/ProductsContext'; // NUEVO IMPORT

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onQuickView?: (product: Product) => void;
}

export function SearchOverlay({ open, onClose, onQuickView }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { addToCart } = useShop();
  const { products } = useProducts(); // TRAEMOS LOS PRODUCTOS GLOBALES

  // Enfocar el input al abrir
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // BÚSQUEDA INSTANTÁNEA EN CLIENTE
  // Al tener los productos en el Context, la búsqueda se hace en milisegundos
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length === 0) return [];

    return products
      .filter((p) => {
        const matchName = p.name?.toLowerCase().includes(term);
        const matchDesc = p.description?.toLowerCase().includes(term);
        return matchName || matchDesc;
      })
      .slice(0, 10); // Límite de 10 resultados
  }, [query, products]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background shadow-xl"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {query.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 max-h-[60vh] overflow-y-auto border-t border-border pt-4"
                >
                  {results.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No se encontraron resultados para "{query}"
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onQuickView?.(product);
                            onClose();
                          }}
                          className="flex gap-4 p-3 rounded-xl w-full text-left hover:bg-muted/50 transition-colors duration-200"
                        >
                          <img
                            src={Array.isArray(product.images) ? product.images[0] : product.images}
                            alt={product.name}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {formatPrice(product.price)}
                            </p>
                            {(() => {
                              const badge = getProductBadge(product as any);
                              if (!badge) return null;
                              return (
                                <span
                                  className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                                    badge === 'Nuevo'
                                      ? 'bg-foreground text-background'
                                      : badge === 'Oferta'
                                        ? 'bg-sale text-sale-foreground'
                                        : 'bg-primary/80 text-primary-foreground'
                                  }`}
                                >
                                  {badge}
                                </span>
                              );
                            })()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}