import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/data/products';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { AuthRequiredModal } from '@/components/AuthRequiredModal';

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
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartBounce: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const cartKey = user ? `fs_cart_${user.id}` : 'fs_cart_guest';
  const favKey = user ? `fs_favorites_${user.id}` : 'fs_favorites_guest';

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- EFECTO ÚNICO Y DEFINITIVO ---
  useEffect(() => {
    // A. Cargamos lo que ya existe en el LocalStorage
    const rawCart = localStorage.getItem(cartKey);
    const rawFavs = localStorage.getItem(favKey);
    
    let currentCart: CartItem[] = [];
    let currentFavs: string[] = rawFavs ? JSON.parse(rawFavs) : [];

    if (rawCart) {
      try {
        currentCart = JSON.parse(rawCart).map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || (item.product.image ? [item.product.image] : []),
          },
        }));
      } catch (e) { currentCart = []; }
    }

    // B. Si el usuario acaba de iniciar sesión, revisamos si dejó algo pendiente
    if (user) {
      const pending = localStorage.getItem('fs_pending_intent');
      if (pending) {
        const { type, product, size } = JSON.parse(pending);
        
        if (type === 'cart') {
          const exists = currentCart.find(i => i.product.id === product.id && i.selectedSize === size);
          if (exists) {
            exists.quantity += 1;
          } else {
            currentCart.push({ product, quantity: 1, selectedSize: size });
          }
          // Pequeño delay para que el toast no choque con la carga de la página
          setTimeout(() => toast.success(`¡"${product.name}" añadido a tu bolsa!`), 800);
        } 
        else if (type === 'fav') {
          if (!currentFavs.includes(product.id)) {
            currentFavs.push(product.id);
            setTimeout(() => toast.success("Añadido a tus favoritos."), 800);
          }
        }
        // IMPORTANTE: Limpiamos la intención SOLO después de haberla procesado
        localStorage.removeItem('fs_pending_intent');
      }
    }

    // C. Guardamos todo en el estado de una sola vez
    setCart(currentCart);
    setFavorites(currentFavs);
  }, [user, cartKey, favKey]);

  // (El resto de tus funciones addToCart, toggleFavorite, etc., se quedan igual)

  // --- EFECTOS DE GUARDADO CONTINUO ---
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  useEffect(() => {
    localStorage.setItem(favKey, JSON.stringify(favorites));
  }, [favorites, favKey]);

  const addToCart = useCallback((product: Product, selectedSize?: string) => {
    if (!user) {
      localStorage.setItem('fs_pending_intent', JSON.stringify({ type: 'cart', product, size: selectedSize }));
      setShowAuthModal(true);
      return;
    }

    if (product.stockStatus !== "disponible") {
      toast.error("Este producto no está disponible");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existing) {
        if (existing.quantity >= MAX_QTY_PER_PRODUCT) {
          toast.error("Máximo 10 piezas por producto");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize }];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
  }, [user]);

  const clearCart = useCallback(() => { setCart([]); }, []);

  const removeFromCart = useCallback(async (productId: string, selectedSize?: string) => {
    const itemToRemove = cart.find(
      item => item.product.id === productId && item.selectedSize === selectedSize
    );
    if (itemToRemove) {
      setCart(prev => prev.filter(
        item => !(item.product.id === productId && item.selectedSize === selectedSize)
      ));
      if (selectedSize) {
        try {
          const { data: productDB } = await (supabase.from('products') as any)
            .select('sizes').eq('id', productId).single();
          if (productDB && productDB.sizes) {
            const newSizes = { ...productDB.sizes, [selectedSize]: Number(productDB.sizes[selectedSize] || 0) + 1 };
            await (supabase.from('products') as any).update({ sizes: newSizes }).eq('id', productId);
            toast.info(`Stock de talla ${selectedSize} restaurado.`);
            setTimeout(() => window.location.reload(), 500);
          }
        } catch (err) { console.error(err); }
      }
    }
  }, [cart]);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) { removeFromCart(productId, selectedSize); return; }
    if (quantity > MAX_QTY_PER_PRODUCT) { toast.error("Máximo 10 piezas"); return; }
    setCart((prev) => prev.map((item) =>
      item.product.id === productId && item.selectedSize === selectedSize ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const toggleFavorite = useCallback((productId: string) => {
    if (!user) {
      localStorage.setItem('fs_pending_intent', JSON.stringify({ type: 'fav', product: { id: productId } }));
      setShowAuthModal(true);
      return;
    }
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, [user]);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      cart, favorites, addToCart, clearCart, removeFromCart, updateQuantity,
      toggleFavorite, isFavorite, cartCount, cartTotal, isCartOpen,
      setIsCartOpen, cartBounce, setShowAuthModal
    }}>
      {children}
      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
}