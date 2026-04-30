import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
  head: () => ({
    meta: [
      { title: "Preguntas Frecuentes — FriendShop" },
      { name: "description", content: "Respuestas a las preguntas más comunes sobre FriendShop." },
    ],
  }),
});

const faqs = [
  {
    question: "¿Cómo hago un pedido?",
    answer:
      "Agrega los productos que te gusten al carrito, haz clic en 'Solicitar pedido' y envíanos el mensaje generado por Instagram.",
  },
  {
    question: "¿Cuáles son los métodos de pago?",
    answer:
      "Aceptamos transferencias bancarias y pagos en efectivo. Los detalles se coordinan por Instagram al momento de confirmar tu pedido.",
  },
  {
    question: "¿Realizan envíos?",
    answer:
      "Sí, se realizan envíos a través de Correos de México. El costo depende de la zona, el peso del paquete y la distancia que deba recorrer.",
  },
  {
    question: "¿Cuándo se realizan las entregas?",
    answer:
      "Las entregas se realizan únicamente los días sábado.",
  },
  {
    question: "¿Aceptan devoluciones?",
    answer:
      "No se aceptan devoluciones. Por favor verifica bien tu producto antes de comprar.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "El tiempo de entrega depende de la zona y paquetería.",
  },
  {
    question: "¿Cómo puedo contactarlos?",
    answer:
      "Puedes contactarnos directamente por Instagram en @the_friendshop_. ¡Estamos para ayudarte!",
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-3">
          Preguntas Frecuentes
        </h1>
        <p className="text-sm text-muted-foreground">
          Todo lo que necesitas saber sobre FriendShop
        </p>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200"
            >
              {faq.question}
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
              />
            </button>
            <motion.div
              initial={false}
              animate={{ height: openIndex === i ? "auto" : 0, opacity: openIndex === i ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
