import { Instagram, Icon, X, Truck } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from "@/context/ProductsContext";

const tiktokNode = [
  ["path", { d: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5", key: "tiktok" }],
] as any;

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[340px] bg-background rounded-3xl overflow-hidden shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg font-medium text-foreground">Contacto</h2>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-8 text-center space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                ¿Tienes dudas con tu pedido o buscas algo especial? Escríbenos directamente.
              </p>
              <button
                type="button"
                onClick={() => window.open('https://www.instagram.com/the_friendshop_/', '_blank')}
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl text-sm font-medium hover:bg-black/90 transition-all"
              >
                <Instagram size={16} />
                Ir a Instagram
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ShippingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[340px] bg-background rounded-3xl overflow-hidden shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg font-medium text-foreground">Envíos</h2>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-xl">
                  <Truck size={18} className="text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Realizamos envíos a todo México por <b>Correos de México</b>.
                </p>
              </div>

              {/* Contenedor gris con espacio entre párrafos */}
              <div className="bg-muted/50 p-4 rounded-2xl flex flex-col gap-3">
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  El costo varía según zona y peso. Para envíos fuera de Orizaba, llena tus datos al generar el mensaje de pedido.
                </p>
                <p className="text-[13px] font-medium text-foreground/80 leading-relaxed border-t border-foreground/5 pt-2">
                  En caso de ser de Orizaba o a sus alrededores, el envío es únicamente en persona.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  const { products } = useProducts();
  const [contactOpen, setContactOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  const hasMenProducts = useMemo(() => products.some(p => p.category === 'men'), [products]);

  return (
    <>
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-heading text-xl font-medium text-foreground mb-4">FriendShop</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                Moda estética diseñada para la mujer moderna y el estilo urbano contemporáneo.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">Tienda</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/categoria/$categoryId" params={{ categoryId: 'mujer' }} className="hover:text-foreground transition-colors">Mujeres</Link></li>
                <li>
                  <Link 
                    to="/categoria/$categoryId" 
                    params={{ categoryId: 'hombre' }} 
                    className={`transition-colors ${hasMenProducts ? 'hover:text-foreground' : 'text-muted-foreground/30 pointer-events-none'}`}
                  >
                    {hasMenProducts ? 'Hombres' : 'Hombres (Próximamente)'}
                  </Link>
                </li>
                <li><Link to="/categoria/$categoryId" params={{ categoryId: 'unisex' }} className="hover:text-foreground transition-colors">Unisex</Link></li>
                <li><Link to="/ofertas" className="hover:text-foreground transition-colors">Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">Ayuda</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button type="button" onClick={() => setShippingOpen(true)} className="hover:text-foreground">Envíos</button></li>
                <li><button type="button" onClick={() => setContactOpen(true)} className="hover:text-foreground">Contacto</button></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">Preguntas Frecuentes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">Síguenos</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open('https://www.instagram.com/the_friendshop_/', '_blank')}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                  <Instagram size={16} />
                </button>
                <a href="#" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <Icon iconNode={tiktokNode} size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground/40 text-center uppercase tracking-widest">
              © 2026 FriendShop. Aesthetic Fashion.
            </p>
          </div>
        </div>
      </footer>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <ShippingModal open={shippingOpen} onClose={() => setShippingOpen(false)} />
    </>
  );
}