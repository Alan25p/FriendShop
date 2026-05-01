import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/data/products';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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

  // Cargar datos persistidos
  useEffect(() => {
    const rawCart = localStorage.getItem(cartKey);
    const rawFavs = localStorage.getItem(favKey);
    
    if (rawCart) {
      try {
        const parsed = JSON.parse(rawCart);
        const normalized = parsed.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || (item.product.image ? [item.product.image] : []),
          },
        }));
        setCart(normalized);
      } catch (e) {
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setFavorites(rawFavs ? JSON.parse(rawFavs) : []);
  }, [user, cartKey, favKey]);

  // Persistencia en LocalStorage
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  useEffect(() => {
    localStorage.setItem(favKey, JSON.stringify(favorites));
  }, [favorites, favKey]);

  const addToCart = useCallback((product: Product, selectedSize?: string) => {
    // CANDADO 1: Validar si hay usuario
    if (!user) {
      toast.info("Inicia sesión para añadir a la bolsa.");
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
  }, [user]); // <- Agregamos 'user' a las dependencias

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // --- REMOVE FROM CART: CON CORRECCIÓN DE TYPESCRIPT ---
  const removeFromCart = useCallback(async (productId: string, selectedSize?: string) => {
    // 1. Identificamos el item antes de sacarlo
    const itemToRemove = cart.find(
      item => item.product.id === productId && item.selectedSize === selectedSize
    );

    if (itemToRemove) {
      // 2. Actualizamos el carrito local
      setCart(prev => prev.filter(
        item => !(item.product.id === productId && item.selectedSize === selectedSize)
      ));

      // 3. Devolvemos el stock a Supabase si aplica
      if (selectedSize) {
        try {
          // Consultamos el stock actual (usamos 'as any' para evitar el error de never)
          const { data: productDB } = await (supabase.from('products') as any)
            .select('sizes')
            .eq('id', productId)
            .single();

          if (productDB && productDB.sizes) {
            const currentStock = Number(productDB.sizes[selectedSize] || 0);
            const newSizes = {
              ...productDB.sizes,
              [selectedSize]: currentStock + 1
            };

            await (supabase.from('products') as any)
              .update({ sizes: newSizes })
              .eq('id', productId);
            
            toast.info(`Stock de talla ${selectedSize} restaurado.`);
            
            // Recarga pequeña para ver el botón habilitado de nuevo
            setTimeout(() => window.location.reload(), 500);
          }
        } catch (err) {
          console.error("Error restaurando inventario:", err);
        }
      }
    }
  }, [cart]);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    if (quantity > MAX_QTY_PER_PRODUCT) {
      toast.error("Máximo 10 piezas");
      return;
    }

    setCart((prev) => prev.map((item) =>
      item.product.id === productId && item.selectedSize === selectedSize
        ? { ...item, quantity }
        : item
    ));
  }, [removeFromCart]);

  const toggleFavorite = useCallback((productId: string) => {
    // CANDADO 2: Validar si hay usuario
    if (!user) {
      toast.info("Inicia sesión para guardar en favoritos.");
      return;
    }

    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, [user]); // <- Agregamos 'user' a las dependencias

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      cart, favorites, addToCart, clearCart, removeFromCart, updateQuantity,
      toggleFavorite, isFavorite, cartCount, cartTotal, isCartOpen,
      setIsCartOpen, cartBounce,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
}