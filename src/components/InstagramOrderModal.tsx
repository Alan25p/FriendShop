import { X, Copy, ExternalLink, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { formatPrice } from '@/lib/format';

interface InstagramOrderModalProps {
  open: boolean;
  onClose: () => void;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
    selectedSize?: string;
  }>;
  total: number;
  deliveryMethod?: 'local' | 'national';
  shipping?: {
    address: string;
    colony: string;
    city: string;
    state: string;
    zip: string;
    reference: string;
  } | null;
}

export function InstagramOrderModal({ open, onClose, products, total, deliveryMethod, shipping }: InstagramOrderModalProps) {
  const [copied, setCopied] = useState(false);

  const productsList = products
    .map((item) =>
      `• ${item.name}${
        item.selectedSize ? ` - Talla ${item.selectedSize}` : ""
      } x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n');

  const deliveryInfo = deliveryMethod === 'local'
    ? `\n\n📍 Método: Entrega personal (Orizaba)`
    : shipping 
      ? `\n\n🚚 DATOS DE ENVÍO NACIONAL:\nCalle/No: ${shipping.address}\nColonia: ${shipping.colony}\nCiudad: ${shipping.city}, ${shipping.state}\nC.P.: ${shipping.zip}\nRef: ${shipping.reference || 'Ninguna'}`
      : '';

  const message = `Hola, quiero pedir estos productos:\n\n${productsList}\n\nTotal en ropa: ${formatPrice(total)}${deliveryInfo}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            /* CAMBIO: Se eliminó inset-4 y flex para que el modal use su tamaño natural */
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:max-w-md bg-background rounded-3xl z-[60] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Cabecera más delgada */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg font-bold italic text-foreground">Solicitar Pedido</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido ajustado */}
            <div className="overflow-y-auto px-6 py-5">
              <p className="text-[13px] text-muted-foreground mb-3 leading-tight">
                Copia el mensaje y envíalo por Instagram para realizar tu pedido:
              </p>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-sm text-foreground whitespace-pre-line leading-relaxed font-body">
                {message}
              </div>
            </div>

            {/* Footer más compacto */}
            <div className="border-t border-border px-6 py-5 space-y-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-2xl text-sm font-bold hover:bg-foreground/90 transition-colors duration-200 shadow-lg"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Mensaje copiado' : 'Copiar mensaje'}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => window.open('https://www.instagram.com/the_friendshop_/', '_blank', 'noopener,noreferrer')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 border border-border py-3.5 rounded-2xl text-sm font-bold text-foreground hover:bg-muted/50 transition-colors duration-200"
              >
                <ExternalLink size={16} />
                Ir a Instagram
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}