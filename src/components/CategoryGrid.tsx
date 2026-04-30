// src/components/CategoryGrid.tsx
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useProducts } from '@/context/ProductsContext';

const categoryCards = [
  {
    id: "vestido",
    name: "Vestidos",
    // Foto de la chica del vestido rojo (estilo slip)
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
  },
  {
    id: "blusa",
    name: "Blusas y Tops",
    // Foto del perchero/chica sentada
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80" 
  },
  {
    id: "pantalon",
    name: "Pantalones",
    // Foto de la chica en la pared verde
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"
  },
  {
    id: "falda",
    name: "Faldas",
    // NUEVA FOTO ESTABLE: Minifalda de mezclilla, muy juvenil y "de chava"
    image: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=80"
  }
];

export function CategoryGrid() {
  const { products } = useProducts();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl sm:text-4xl text-foreground mb-3 tracking-tight">
          Comprar por Categoría
        </h2>
        <p className="text-sm text-muted-foreground italic">Encuentra exactamente lo que buscas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryCards.map((cat, i) => {
          // Conteo dinámico desde Supabase
          const itemCount = products.filter(
            p => p.category === 'women' && (p.productType === cat.id || p.subcategory === cat.id)
          ).length;

          return (
            <Link
              key={cat.id}
              to="/tienda"
              search={{ tipo: cat.id }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl cursor-pointer shadow-sm"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay oscuro para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                
                <div className="absolute inset-x-5 bottom-6 flex items-end justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-heading text-xl font-medium text-white tracking-wide">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase">
                      {itemCount} artículos
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight size={18} strokeWidth={2} />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}