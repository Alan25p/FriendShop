import { X, Trash2, Eye, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useMemo } from 'react';
import { useShop } from '@/context/ShopContext';
import { useProducts } from '@/context/ProductsContext'; // NUEVO IMPORT
import { formatPrice } from '@/lib/format';
import { toast } from "sonner";

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
  onQuickView?: (product: any) => void;
}

export function FavoritesDrawer({ open, onClose, onQuickView }: FavoritesDrawerProps) {
  const { favorites, toggleFavorite, addToCart } = useShop();
  const { products, loading } = useProducts(); // TRAEMOS LOS PRODUCTOS GLOBALES

  // Filtramos los productos que coinciden con los IDs guardados en favoritos
  const favoriteProducts = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    return products.filter((p) => favorites.includes(p.id));
  }, [products, favorites]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  const handleClearAll = () => {
    favoriteProducts.forEach((product) => toggleFavorite(product.id));
    toast.success("Favoritos eliminados");
  };

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach((product) => addToCart(product as any));
    toast.success("Movidos a la bolsa");
    onClose(); 
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <>
          <motion.div
            key="fav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
          />

          <motion.div
            key="fav-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[61] flex w-full max-w-full flex-col bg-background shadow-2xl sm:max-w-md"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <div className="flex items-center gap-3">
                <Heart size={16} className="fill-foreground text-foreground" />
                <h2 className="font-heading text-xs font-bold uppercase tracking-[0.3em]">
                  Favoritos ({favoriteProducts.length})
                </h2>
              </div>
              <button onClick={handleClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] animate-pulse">Cargando...</span>
                </div>
              ) : favoriteProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <Heart size={40} strokeWidth={1} />
                  <p className="text-[10px] uppercase tracking-[0.25em]">No hay artículos guardados</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="flex gap-6 group">
                      <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                        <img
                          src={product.images[0]} 
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between py-1 min-w-0">
                        <div className="space-y-1">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest truncate leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs font-medium text-foreground/50">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => onQuickView?.(product)}
                            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest border-b border-foreground/10 pb-0.5 hover:border-foreground"
                          >
                            <Eye size={12} strokeWidth={1.5} />
                            Detalles
                          </button>
                          
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favoriteProducts.length > 0 && (
              <div className="border-t p-8 space-y-4 bg-background">
                <button
                  onClick={handleAddAllToCart}
                  className="flex w-full items-center justify-center gap-3 bg-black py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all hover:bg-neutral-900 active:scale-[0.98] shadow-lg"
                >
                  <ShoppingBag size={14} />
                  Mover todo a la bolsa
                </button>
                
                <button
                  onClick={handleClearAll}
                  className="flex w-full items-center justify-center gap-3 border border-border bg-transparent py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                >
                  <Trash2 size={14} />
                  Vaciar favoritos
                </button>

                <p className="text-center text-[8px] uppercase tracking-[0.4em] text-muted-foreground/60 italic pt-2">
                  FriendShop — Editorial Collection
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}