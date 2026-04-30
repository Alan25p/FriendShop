import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  category: "women" | "men" | "unisex";
  subcategory?: string;
  productType?: string;
  stockStatus: "disponible" | "agotado" | "agotado_restock";
  description: string;
  has_sizes?: boolean;
  sizes?: any;
  createdAt?: string;
  favoritesCount?: number;
  cartCount?: number;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export function ProductsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((p: any) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.original_price,
  images: Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : ["/placeholder.svg"],

  category: p.category,
  subcategory: p.subcategory,
  productType: p.product_type,

  stockStatus: p.stock_status,
  description: p.description,

  has_sizes: p.has_sizes,
  sizes: p.sizes,

  createdAt: p.created_at,

  favoritesCount: 0,
  cartCount: 0,
}));

      setProducts(normalized);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      "useProducts debe usarse dentro de ProductsProvider"
    );
  }

  return context;
}