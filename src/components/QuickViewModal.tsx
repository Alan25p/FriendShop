import { X, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/data/products';
import { getProductBadge, getStockLabel } from '@/data/products';
import { formatPrice } from '@/lib/format';
import { AuthRequiredModal } from '@/components/AuthRequiredModal';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps) {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const { user } = useAuth();

  const [authModal, setAuthModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  useEffect(() => {
    if (!product) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);

    return () => window.removeEventListener('keydown', handleEsc);
  }, [product, onClose]);

  useEffect(() => {
  setCurrentImage(0);
  setSelectedSize("");
  setSizeError("");
}, [product]);

  const guardedAction = (action: () => void) => {
    if (!user) {
      setAuthModal(true);
      return;
    }

    action();
  };

  if (!product) return null;

  const badge = getProductBadge(product);
  const stockLabel = getStockLabel(product);
  const isOutOfStock =
    product.stockStatus !== 'disponible';

  const availableSizes =
  product.has_sizes && product.sizes
    ? Object.entries(product.sizes).filter(
        ([_, qty]) => Number(qty) > 0
      )
    : [];

  const nextImage = () => {
    if (!product.images?.length) return;

    setCurrentImage((prev) =>
      (prev + 1) % product.images.length
    );
  };

  const prevImage = () => {
    if (!product.images?.length) return;

    setCurrentImage((prev) =>
      prev === 0
        ? product.images.length - 1
        : prev - 1
    );
  };

  const handleAddToCart = () => {
  if (isOutOfStock) return;

  if (
    product.has_sizes &&
    availableSizes.length > 0 &&
    !selectedSize
  ) {
    setSizeError("Selecciona una talla.");
    return;
  }

  guardedAction(() => {
    addToCart({
      ...product,
      selectedSize,
    });

    window.dispatchEvent(
      new CustomEvent("open-cart")
    );

    onClose();
  });
};

  return (
    <>
      <AnimatePresence>
        {product && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-background rounded-2xl z-50 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Imágenes */}
                <div className="relative sm:w-1/2 aspect-[3/4]">
                  <img
                    src={
                      product.images?.[
                        currentImage
                      ]
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="sm:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                  {badge && (
                    <span className="inline-block w-fit px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full mb-3 bg-primary/80 text-primary-foreground">
                      {badge}
                    </span>
                  )}

                  <h2 className="font-heading text-2xl font-medium text-foreground mb-2">
                    {product.name}
                  </h2>

                  {stockLabel && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {stockLabel}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-semibold text-foreground">
                      {formatPrice(
                        product.price
                      )}
                    </span>

                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(
                          product.originalPrice
                        )}
                      </span>
                    )}
                  </div>

                    {availableSizes.length > 0 && (
  <div className="mb-4">
    <p className="text-sm font-medium mb-2">
      Selecciona talla
    </p>

    <div className="flex flex-wrap gap-2">
      {availableSizes.map(([size]) => (
        <button
          key={size}
          type="button"
          onClick={() => {
            setSelectedSize(size);
            setSizeError("");
          }}
          className={`px-4 py-2 rounded-xl border text-sm ${
            selectedSize === size
              ? "bg-black text-white border-black"
              : "border-border"
          }`}
        >
          {size}
        </button>
      ))}
    </div>

    {sizeError && (
      <p className="text-red-500 text-xs mt-2">
        {sizeError}
      </p>
    )}
  </div>
)}

                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {product.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground/80 mb-5 leading-relaxed">
                    No se aceptan devoluciones.
                    Por favor verifica bien tu
                    producto antes de comprar.
                  </p>

                  {/* Botones */}
                  <div className="flex gap-3">
                    {/* Agregar carrito */}
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
                        isOutOfStock
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-black text-white hover:bg-black/90'
                      }`}
                    >
                      <ShoppingBag size={16} />
                      {isOutOfStock
                        ? 'Agotado'
                        : 'Agregar al carrito'}
                    </motion.button>

                    {/* Favorito */}
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={() =>
                        guardedAction(() =>
                          toggleFavorite(
                            product.id
                          )
                        )
                      }
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition ${
                        isFavorite(product.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      <Heart
                        size={18}
                        className={
                          isFavorite(
                            product.id
                          )
                            ? 'fill-primary'
                            : ''
                        }
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthRequiredModal
        open={authModal}
        onClose={() =>
          setAuthModal(false)
        }
      />
    </>
  );
}