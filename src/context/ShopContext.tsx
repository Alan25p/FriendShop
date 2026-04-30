import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/data/products';
import { toast } from 'sonner';

const MAX_QTY_PER_PRODUCT = 10;

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

interface ShopContextType {
  cart: CartItem[];
  favorites: string[];
  addToCart: (product: Product, selectedSize?: string) => void;
  clearCart: () => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (
  productId: string,
  quantity: number,
  selectedSize?: string
) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartBounce: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    // 🔥 FIX: normalizar productos viejos
    if (key === 'fs_cart') {
      return parsed.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images || (item.product.image ? [item.product.image] : []),
        },
      }));
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('fs_cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('fs_favorites', []));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  // Persist cart
  useEffect(() => {
    try { localStorage.setItem('fs_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  // Persist favorites
  useEffect(() => {
    try { localStorage.setItem('fs_favorites', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  const addToCart = useCallback((product: Product) => {
  if (product.stockStatus !== "disponible") {
    toast.error("Este producto no está disponible");
    return;
  }

  setCart((prev) => {
    const existing = prev.find(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === product.selectedSize
    );

    if (existing) {
      if (existing.quantity >= MAX_QTY_PER_PRODUCT) {
        toast.error("Máximo 10 piezas por producto");
        return prev;
      }

      return prev.map((item) =>
        item.product.id === product.id &&
        item.selectedSize === product.selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prev, { product, quantity: 1, selectedSize: product.selectedSize }];
  });

  setCartBounce(true);
  setTimeout(() => setCartBounce(false), 400);
}, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart(prev =>
  prev.filter(
    item =>
      !(
        item.product.id === productId &&
        item.selectedSize === selectedSize
      )
  )
);
  }, []);

  const updateQuantity = useCallback(
  (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.selectedSize === selectedSize
            )
        )
      );
      return;
    }

    if (quantity > MAX_QTY_PER_PRODUCT) {
      toast.error("Máximo 10 piezas por producto");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  },
  []
);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        clearCart,
        removeFromCart,
        updateQuantity,
        toggleFavorite,
        isFavorite,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        cartBounce,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
}
