import { Link } from '@tanstack/react-router';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { FavoritesDrawer } from '@/components/FavoritesDrawer';
import { SearchOverlay } from '@/components/SearchOverlay';
import { QuickViewModal } from '@/components/QuickViewModal';
import { AuthRequiredModal } from '@/components/AuthRequiredModal';

import type { Product } from '@/data/products';

const navLinks = [
  {
    to: '/categoria/$categoryId' as const,
    params: { categoryId: 'mujer' },
    label: 'Mujer',
  },
  {
    to: '/categoria/$categoryId' as const,
    params: { categoryId: 'hombre' },
    label: 'Hombre',
  },
  {
    to: '/categoria/$categoryId' as const,
    params: { categoryId: 'unisex' },
    label: 'Unisex',
  },
  { to: '/nuevo' as const, label: 'Nuevo' },
  { to: '/ofertas' as const, label: 'Ofertas' },
];

export function Navbar() {

  const { cartCount, setIsCartOpen, favorites, cartBounce } = useShop();
  const { user, signOut } = useAuth();

  // NUEVO: Esto evita el error rojo de la consola
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // ... resto de tus estados ...
  // ------------------------------------

  const [mobileOpen, setMobileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < 50) {
        setShowNavbar(true);
      } else if (current > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const protectedAction = (action: () => void) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto max-width-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} strokeWidth={1} /> : <Menu size={20} strokeWidth={1} />}
            </button>

            <Link to="/">
              <div className="leading-none">
                <h1 className="font-heading text-2xl font-bold italic tracking-[0.15em]">
                  FriendShop
                </h1>
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  Moda Estética
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  {...('params' in link ? { params: link.params } : {})}
                  className="relative py-2 text-[11px] uppercase tracking-[0.25em] font-medium transition-colors"
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? "text-foreground" : "text-foreground/40 hover:text-foreground"}>
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button onClick={() => setSearchOpen(true)} className="hover:opacity-50 transition-opacity">
                <Search size={18} strokeWidth={1.5} />
              </button>

              <button
                className="relative p-1"
                onClick={() => protectedAction(() => setFavoritesOpen(true))}
              >
                <motion.div
                  key={favorites.length}
                  whileTap={{ scale: 0.9 }}
                  animate={favorites.length > 0 ? { y: [0, -3, 0] } : {}}
                >
                  <Heart 
                    size={18} 
                    strokeWidth={1.5} 
                    className={favorites.length > 0 ? "fill-foreground text-foreground" : ""} 
                  />
                </motion.div>
                {/* Cambia la línea del span de favoritos por esta: */}
                  {isMounted && favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-bold">
                      ({favorites.length})
                    </span>
                  )}
              </button>

              <button
                className="relative p-1"
                onClick={() => protectedAction(() => setIsCartOpen(true))}
              >
                <motion.div
                  key={cartCount}
                  whileTap={{ scale: 0.9 }}
                  animate={cartBounce ? { y: [0, -3, 0] } : {}}
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                </motion.div>
                {/* Cambia la línea del span del carrito por esta: */}
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold">
                    ({cartCount})
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 hover:opacity-50 transition-opacity"
                  >
                    <User size={18} strokeWidth={1.5} />
                    <ChevronDown size={10} strokeWidth={1} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-background border rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <Link to="/cuenta" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                          Mi cuenta
                        </Link>
                        <button
                          onClick={signOut}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex gap-2 items-center transition-colors"
                        >
                          <LogOut size={14} />
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block hover:opacity-50 transition-opacity">
                  <User size={18} strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
  {mobileOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="lg:hidden border-t bg-background overflow-hidden"
    >
      <nav className="flex flex-col p-6 space-y-6">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            {...('params' in link ? { params: link.params } : {})}
            onClick={() => setMobileOpen(false)}
            className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {/* --- NUEVA SECCIÓN DE USUARIO EN MÓVIL --- */}
        <div className="pt-6 border-t border-border space-y-6">
          {user ? (
            <>
              <Link 
                to="/cuenta" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-zinc-500"
              >
                <User size={16} strokeWidth={1.5} /> Mi Cuenta
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-red-400"
              >
                <LogOut size={16} strokeWidth={1.5} /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-4 bg-zinc-900 text-white rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>
    </motion.div>
  )}
</AnimatePresence>
      </header>

      <FavoritesDrawer
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        onQuickView={(product) => {
          setFavoritesOpen(false);
          setQuickViewProduct(product);
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <AuthRequiredModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}