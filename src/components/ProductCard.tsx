import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/data/products';
import { getProductBadge, getStockLabel } from '@/data/products';
import { formatPrice } from '@/lib/format';
import { AuthRequiredModal } from '@/components/AuthRequiredModal';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite, setShowAuthModal } = useShop(); // FIX: Usamos el modal global del ShopContext
  const { user } = useAuth();
  const navigate = useNavigate(); // FIX: Necesario para redirigir
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const favorited = isFavorite(product.id);

  // --- LÓGICA DE AÑADIR A LA BOLSA (CANDADO DE TALLAS APLICADO) ---
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. CANDADO DE TALLAS (La prioridad)
    if (product.has_sizes) {
      toast.info("Este producto requiere seleccionar una talla.");
      // Redirigimos a la vista individual del producto
      navigate({ to: `/producto/${product.id}` });
      return;
    }

    // 2. CANDADO DE USUARIO
    if (!user) {
      // Guardamos la intención por si acaso
      localStorage.setItem('fs_pending_intent', JSON.stringify({ type: 'cart', product, size: undefined }));
      setShowAuthModal(true); // Usamos el modal centralizado
      return;
    }

    // 3. Añadir directo si no tiene tallas
    addToCart(product);
  };

  // --- LÓGICA DE FAVORITOS ---
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      localStorage.setItem('fs_pending_intent', JSON.stringify({ type: 'fav', product: { id: product.id } }));
      setShowAuthModal(true); // Usamos el modal centralizado
      return;
    }
    toggleFavorite(product.id);
  };

  const badge = getProductBadge(product as any); 
  const stockLabel = getStockLabel(product.stockStatus as any);
  const isOutOfStock = product.stockStatus !== 'disponible';

  const badgeClass = badge === 'Nuevo'
    ? 'bg-foreground text-background'
    : badge === 'Oferta'
      ? 'bg-sale text-sale-foreground'
      : 'bg-primary/80 text-primary-foreground';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-3 ${isOutOfStock ? 'opacity-70' : ''}`}>
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          
          <Link to={"/producto/$productId" as any} params={{ productId: product.id } as any}>
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </Link>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && stockLabel && (
              <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rounded-full bg-muted text-muted-foreground leading-tight">
                {stockLabel}
              </span>
            )}
            {!isOutOfStock && badge && (
              <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rounded-full leading-tight ${badgeClass}`}>
                {badge}
              </span>
            )}
          </div>

          <div
            className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-200 z-30 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            } max-lg:!opacity-100 max-lg:!translate-y-0`}
          >
            <button
              // FIX: Reemplazado por la nueva función handleAddToCartClick
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 bg-background/95 backdrop-blur-sm text-foreground py-2.5 rounded-lg text-xs font-medium shadow-sm transition-colors duration-200 ${
                isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background active:scale-95'
              }`}
            >
              <ShoppingBag size={14} />
              {isOutOfStock ? 'Agotado' : 'Agregar'}
            </button>

            <Link
              to={"/producto/$productId" as any}
              params={{ productId: product.id } as any}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center bg-background/95 backdrop-blur-sm text-foreground w-10 rounded-lg hover:bg-background transition-colors duration-200 shadow-sm active:scale-95"
              title="Ver producto"
            >
              <Eye size={14} />
            </Link>
          </div>

          <button
            // FIX: Reemplazado por la nueva función handleFavoriteClick
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background shadow-sm z-30"
          >
            <Heart
              size={16}
              className={`transition-colors duration-200 ${
                favorited ? 'fill-primary text-primary' : 'text-foreground/60'
              }`}
            />
          </button>
        </div>

        <div className="space-y-1">
          <Link to={"/producto/$productId" as any} params={{ productId: product.id } as any}>
            <h3 className="text-sm font-medium text-foreground tracking-wide hover:underline">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
      {/* Ya no renderizamos AuthRequiredModal aquí porque ya lo tenemos global en ShopContext */}
    </>
  );
}