import { X, Plus, Minus, Trash2, Send, MapPin, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/format";
import { InstagramOrderModal } from "@/components/InstagramOrderModal";
import { OrderSuccessModal } from "@/components/OrderSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SubmittedOrder = {
  products: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
  }>;
  total: number;
  deliveryMethod: 'local' | 'national';
  shipping?: {
    address: string;
    colony: string;
    city: string;
    state: string;
    zip: string;
    reference: string;
  } | null;
};

const unlockPage = () => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
};

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useShop();

  const { user } = useAuth();

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'local' | 'national'>('local');
  
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    colony: '',
    city: '',
    state: '',
    zip: '',
    reference: ''
  });

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    unlockPage();
  }, [setIsCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      unlockPage();
    }
    return () => unlockPage();
  }, [isCartOpen]);

  // Puente para mostrar el agradecimiento al cerrar el modal de IG
  const closeOrderModal = useCallback(() => {
    setOrderModalOpen(false);
    setSubmittedOrder(null);
    setShowFinalSuccess(true);
    unlockPage();
  }, []);

  const handleOrderSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }

    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    if (deliveryMethod === 'national') {
      const { address, colony, city, state, zip } = shippingDetails;
      if (!address || !colony || !city || !state || !zip) {
        toast.error("Por favor llena todos los datos obligatorios para el envío");
        return;
      }
    }

    const orderProducts = cart.map((item) => ({
      name: item.product.name,
      selectedSize: item.selectedSize,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || "",
      size: item.selectedSize || "",
    }));

    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        products: orderProducts,
        total: cartTotal,
        status: "pendiente",
        shipping_details: deliveryMethod === 'national' 
          ? { method: 'national', ...shippingDetails } 
          : { method: 'local' }
      } as any);

      if (error) throw error;

      setSubmittedOrder({
        products: orderProducts,
        total: cartTotal,
        deliveryMethod,
        shipping: deliveryMethod === 'national' ? shippingDetails : null,
      });

      clearCart();
      closeCart();
      setOrderModalOpen(true);
      
      setDeliveryMethod('local');
      setShippingDetails({ address: '', colony: '', city: '', state: '', zip: '', reference: '' });

      toast.success("Pedido preparado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar el pedido");
    }
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {isCartOpen && (
          <>
            <motion.div
              key="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm"
            />

            <motion.div
              key="cart-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 z-[61] flex w-full max-w-full flex-col bg-background shadow-2xl sm:max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                {/* Restaurado font-heading */}
                <h2 className="font-heading text-xl font-medium text-foreground">
                  Tu Bolsa
                </h2>
                <button
                  onClick={closeCart}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground text-sm">
                      Tu bolsa está vacía
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}`}
                        className="flex gap-4 p-3 rounded-xl bg-card border border-border"
                      >
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          {/* El h3 usará font-heading por herencia del CSS */}
                          <h3 className="text-sm font-medium">
                            {item.product.name}
                          </h3>
                          {item.selectedSize && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Talla: {item.selectedSize}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                              className="w-7 h-7 rounded-full border flex items-center justify-center"
                            >
                              <Minus size={12} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                              className="w-7 h-7 rounded-full border flex items-center justify-center"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t px-6 py-5 space-y-4 bg-background">
                  <div className="flex flex-col gap-3 pb-2 border-b border-border">
                    <p className="text-sm font-medium">Método de entrega:</p>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'local'}
                          onChange={() => setDeliveryMethod('local')}
                          className="w-4 h-4 text-primary"
                        />
                        <MapPin size={16} className="text-muted-foreground" />
                        Entrega personal (Orizaba)
                      </label>

                      <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'national'}
                          onChange={() => setDeliveryMethod('national')}
                          className="w-4 h-4 text-primary"
                        />
                        <Truck size={16} className="text-muted-foreground" />
                        Envío Nacional (Resto de México)
                      </label>
                    </div>

                    <AnimatePresence>
                      {deliveryMethod === 'national' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden pt-2"
                        >
                          <input
                            type="text"
                            placeholder="Calle y Número"
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                            value={shippingDetails.address}
                            onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                          />
                          <input
                            type="text"
                            placeholder="Colonia"
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                            value={shippingDetails.colony}
                            onChange={(e) => setShippingDetails({...shippingDetails, colony: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Ciudad"
                              className="w-1/2 border rounded-lg px-3 py-2 text-sm bg-background"
                              value={shippingDetails.city}
                              onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="Estado"
                              className="w-1/2 border rounded-lg px-3 py-2 text-sm bg-background"
                              value={shippingDetails.state}
                              onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="C.P."
                              className="w-1/3 border rounded-lg px-3 py-2 text-sm bg-background"
                              value={shippingDetails.zip}
                              onChange={(e) => setShippingDetails({...shippingDetails, zip: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="Referencia"
                              className="w-2/3 border rounded-lg px-3 py-2 text-sm bg-background"
                              value={shippingDetails.reference}
                              onChange={(e) => setShippingDetails({...shippingDetails, reference: e.target.value})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Total</span>
                    <span className="font-semibold">{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No se aceptan devoluciones. Verifica bien tu pedido antes de solicitarlo.
                  </p>
                  <button
                    onClick={handleOrderSubmit}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl hover:bg-black/90 transition"
                  >
                    <Send size={16} />
                    Generar mensaje
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InstagramOrderModal
        open={orderModalOpen}
        onClose={closeOrderModal}
        products={submittedOrder?.products ?? []}
        total={submittedOrder?.total ?? 0}
        deliveryMethod={submittedOrder?.deliveryMethod}
        shipping={submittedOrder?.shipping} 
      />

      <OrderSuccessModal 
        isOpen={showFinalSuccess} 
        onClose={() => setShowFinalSuccess(false)} 
      />
    </>
  );
}