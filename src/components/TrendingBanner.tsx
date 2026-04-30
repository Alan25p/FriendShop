import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function TrendingBanner() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4"
      >
        <Link to="/nuevo">
          <div className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop"
              alt="Tendencias"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-background" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-background/80">En Tendencia</span>
              </div>
              <h3 className="font-heading text-2xl font-medium text-background">Tendencias</h3>
              <p className="text-xs text-background/70 mt-1">Los estilos más populares del momento</p>
            </div>
          </div>
        </Link>

        <Link to="/ofertas">
          <div className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop"
              alt="Edición Limitada"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-background" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-background/80">Exclusivo</span>
              </div>
              <h3 className="font-heading text-2xl font-medium text-background mt-1">Edición Limitada</h3>
              <p className="text-xs text-background/70 mt-1">Descubre piezas elaboradas en cantidades limitadas</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
