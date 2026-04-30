// src/data/products.ts
import type { Product } from '@/context/ProductsContext';

// ==========================================
// 1. DEFINICIONES DE CATEGORÍAS (TIPOS ESPECÍFICOS)
// ==========================================

// Estas son las subcategorías reales que se deben guardar en la DB
// y que la web usará para los filtros inteligentes
// src/data/products.ts

// ==========================================
// 1. DEFINICIONES DE CATEGORÍAS
// ==========================================

export const womenProductTypes = [
  { id: "all", label: "Todo" },
  { id: "vestido", label: "Vestidos" },
  { id: "blusa", label: "Blusas" },
  { id: "pantalon", label: "Pantalones" },
  { id: "falda", label: "Faldas" },
  { id: "sueter", label: "Suéteres" },
  { id: "chamarra", label: "Chamarras" },
  { id: "accesorio", label: "Accesorios" },
  { id: "zapato", label: "Zapatos" },
  { id: "maquillaje", label: "Maquillaje" }
];

export const menProductTypes = [
  { id: "all", label: "Todo" },
  { id: "camisa", label: "Camisas" },
  { id: "pantalon", label: "Pantalones" },
  { id: "sueter", label: "Suéteres" },
  { id: "chamarra", label: "Chamarras" },
  { id: "accesorio", label: "Accesorios" },
  { id: "zapato", label: "Zapatos" }
];

// --- NUEVAS SUB-CATEGORÍAS ESPECÍFICAS ---
export const makeupTypes = [
  { id: "labial", label: "Labiales" },
  { id: "sombra", label: "Sombras y Paletas" },
  { id: "base", label: "Bases y Correctores" },
  { id: "delineador", label: "Delineadores" },
  { id: "otro_maquillaje", label: "Otros" }
];

export const shoeTypes = [
  { id: "tenis", label: "Tenis" },
  { id: "zapatilla", label: "Zapatillas" },
  { id: "sandalia", label: "Sandalias" },
  { id: "bota", label: "Botas y Botines" },
  { id: "chancla", label: "Chanclas / Slides" }
];

export const accessoryTypes = [
  { id: "collar", label: "Collares" },
  { id: "anillo", label: "Anillos" },
  { id: "pulsera", label: "Pulseras" },
  { id: "lente", label: "Lentes de Sol" },
  { id: "bolso", label: "Bolsos y Carteras" },
  { id: "sombrero", label: "Gorras y Sombreros" }
];

// ... (Deja tus funciones de isNewProduct, getProductBadge, etc. exactamente igual)

// ==========================================
// 2. FUNCIONES DE UTILIDAD
// ==========================================

export const isNewProduct = (product: Product): boolean => {
  if (!product.createdAt) return false;
  const createdDate = new Date(product.createdAt);
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 30);
  return createdDate >= daysAgo;
};

export const getProductBadge = (product: Product): string | null => {
  if (product.originalPrice && product.originalPrice > product.price) {
    return 'Oferta';
  }
  if (isNewProduct(product)) {
    return 'Nuevo';
  }
  return null;
};

export const getStockLabel = (status: string): string => {
  switch (status) {
    case 'disponible': return 'Disponible';
    case 'agotado': return 'Agotado';
    case 'agotado_restock': return 'Próximamente';
    default: return 'Disponible';
  }
};