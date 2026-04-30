import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export function Newsletter() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-8 shadow-sm sm:p-12"
      >
        <h2 className="font-heading text-3xl font-light text-foreground mb-3">
          Mantente al Día
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Mantente al día con nuevos productos y ofertas
        </p>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.open('https://www.instagram.com/the_friendshop_/', '_blank', 'noopener,noreferrer')}
          className="mx-auto flex w-full max-w-full items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90 sm:w-auto"
        >
          <Instagram size={14} />
          Seguir en Instagram
        </motion.button>
      </motion.div>
    </section>
  );
}
