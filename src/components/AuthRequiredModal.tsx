import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ open, onClose }: AuthRequiredModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:w-full bg-background rounded-2xl z-[60] overflow-hidden shadow-2xl p-6 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <X size={18} />
            </button>

            <h2 className="font-heading text-xl font-medium text-foreground mb-2 mt-2">
              Inicia sesión
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Inicia sesión para guardar tus productos
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full bg-foreground text-background py-3 rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 block"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                onClick={onClose}
                className="w-full border border-border py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-200 block"
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
