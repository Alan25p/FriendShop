import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/context/ProductsContext";
// FIX: Agregamos las llaves { } porque tu componente usa Named Export
import { ProductCard } from "@/components/ProductCard"; 

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { products } = useProducts();
  
  const isFetching = !products;

  // Filtramos por disponibles y cortamos a 8 para que el Home no sea infinito
  const featuredProducts = products 
    ? products.filter(p => p.stockStatus === 'disponible').slice(0, 8) 
    : [];

  return (
    <div className="flex flex-col gap-16 pb-20 animate-fade-in bg-white">
      {/* SECCIÓN HERO - FriendShop */}
      <section className="relative h-[80vh] flex items-center justify-center bg-zinc-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070')] bg-cover bg-center" />
        <div className="container px-4 text-center z-10">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-heading font-bold italic tracking-tighter text-foreground mb-6 px-4">
            FriendShop
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light italic">
            "Moda curada para la estética moderna."
          </p>
          <Link 
            to="/nuevo" 
            className="inline-block bg-foreground text-background px-12 py-4 rounded-full text-[10px] uppercase tracking-widest hover:scale-105 transition-transform font-bold"
          >
            Explorar Colección
          </Link>
        </div>
      </section>

      {/* SECCIÓN CATEGORÍAS */}
      <section className="container mx-auto px-4">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 mb-10 text-center font-bold">
          Nuestras Categorías
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/categoria/$categoryId" params={{ categoryId: 'mujer' }} className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-zinc-100">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20 text-white uppercase tracking-[0.4em] text-sm font-bold">Mujer</div>
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt="Mujer" />
          </Link>
          <Link to="/categoria/$categoryId" params={{ categoryId: 'hombre' }} className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-zinc-100">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20 text-white uppercase tracking-[0.4em] text-sm font-bold">Hombre</div>
            <img src="https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=1070" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt="Hombre" />
          </Link>
          <Link to="/categoria/$categoryId" params={{ categoryId: 'unisex' }} className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-zinc-100">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20 text-white uppercase tracking-[0.4em] text-sm font-bold">Unisex</div>
            <img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1170" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt="Unisex" />
          </Link>
        </div>
      </section>

      {/* SECCIÓN NOVEDADES */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold italic uppercase tracking-tighter">Novedades</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-bold">Recién llegados a Orizaba.</p>
          </div>
          <Link to="/nuevo" className="text-[10px] uppercase tracking-widest border-b border-foreground pb-1 font-bold">Ver todo</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isFetching ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[3/4] bg-zinc-100 animate-pulse rounded-[2rem]" />
                <div className="h-3 bg-zinc-100 animate-pulse w-3/4 rounded-full" />
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}