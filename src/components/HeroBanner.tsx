import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function HeroBanner() {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-muted">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-lg"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4"
            >
              Colección 2026
            </motion.span>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] text-foreground mb-6">
              Elegancia
              <br />
              <span className="italic font-light">sin esfuerzo</span>
            </h2>
            <p className="text-base text-muted-foreground mb-8 max-w-sm leading-relaxed">
              Descubre nuestra colección curada de piezas atemporales diseñadas para la mujer moderna.
            </p>
            <Link
              to="/tienda"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-foreground/90 rounded-lg"
            >
              Ver Colección
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
