import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from '@tanstack/react-router'; // <-- Importamos useLocation

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ open, onClose }: AuthRequiredModalProps) {
  const location = useLocation(); // Obtenemos la URL actual (ej: /producto/playera-pro)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-background rounded-[2rem] z-[60] overflow-hidden shadow-2xl p-8 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-zinc-50 rounded-full transition-colors duration-200"
            >
              <X size={18} />
            </button>

            <h2 className="font-heading text-2xl font-bold italic text-foreground mb-2 mt-4">
              Inicia sesión
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Inicia sesión para guardar tus productos.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                // FIX: Pasamos la ruta actual como parámetro 'redirect'
                search={{ redirect: location.pathname }}
                onClick={onClose}
                className="w-full bg-foreground text-background py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[0.98] transition-all block"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                // FIX: Lo mismo para el registro
                search={{ redirect: location.pathname }}
                onClick={onClose}
                className="w-full border-2 border-border py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-zinc-50 transition-all block"
              >
                Crear Cuenta
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}