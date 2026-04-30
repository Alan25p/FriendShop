import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ShopProvider } from "@/context/ShopContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProductsProvider } from "@/context/ProductsContext";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-7xl font-light text-foreground">404</h1>
        <h2 className="mt-4 text-lg font-medium text-foreground">
          Página no encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FriendShop — Moda Estética Moderna" },
      { name: "description", content: "Descubre colecciones curadas de moda femenina atemporal en FriendShop." },
      { name: "author", content: "FriendShop" },
      { property: "og:title", content: "FriendShop — Moda Estética Moderna" },
      { property: "og:description", content: "Descubre colecciones curadas de moda femenina atemporal en FriendShop." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <ShopProvider>
          <Navbar />

          <main className="min-h-screen pt-16">
            <Outlet />
          </main>

          <Footer />
          <CartDrawer />
        </ShopProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
