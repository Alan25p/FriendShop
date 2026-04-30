import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ isOpen, onClose }: OrderSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border bg-background p-8 shadow-2xl text-center"
          >
            <button 
              onClick={onClose} 
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} strokeWidth={1} />
            </button>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <Check size={32} strokeWidth={1.5} />
            </div>

            <h2 className="mb-2 font-heading text-xl font-bold italic tracking-wide">
              ¡PEDIDO REGISTRADO!
            </h2>
            
            <p className="mb-8 text-[11px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
              Gracias por elegir <span className="text-foreground font-bold">FriendShop</span>. 
              No olvides enviar tu mensaje por IG para coordinar el pago y envío.
            </p>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-black py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-transform active:scale-95"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}