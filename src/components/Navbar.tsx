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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} strokeWidth={1} /> : <Menu size={20} strokeWidth={1} />}
            </button>

            {/* LOGO */}
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

            {/* DESKTOP NAV - ESTILO ZARA / MINIMAL */}
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
                      
                      {/* Marcador: Una línea negra de 1px muy fina que se desliza */}
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

            {/* ICONOS ESTILO BOUTIQUE (TOTAL BLACK) */}
            <div className="flex items-center gap-5">
              <button onClick={() => setSearchOpen(true)} className="hover:opacity-50 transition-opacity">
                <Search size={18} strokeWidth={1.5} />
              </button>

              {/* FAVORITOS - AHORA SOLO NEGRO */}
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
                    // CORRECCIÓN: fill-foreground text-foreground para que sea negro sólido
                    className={favorites.length > 0 ? "fill-foreground text-foreground" : ""} 
                  />
                </motion.div>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold">
                    ({favorites.length})
                  </span>
                )}
              </button>

              {/* BOLSA */}
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
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold">
                    ({cartCount})
                  </span>
                )}
              </button>

              {/* USER MENU (REFINADO) */}
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

        {/* MOBILE MENU - CORREGIDO A MONOCROMO */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-background overflow-hidden"
            >
              <nav className="flex flex-col p-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    {...('params' in link ? { params: link.params } : {})}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm uppercase tracking-wide text-foreground hover:text-foreground/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-2 space-y-3">
                  {user ? (
                    <>
                      <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="block text-sm uppercase tracking-wide">
                        Mi cuenta
                      </Link>
                      <button onClick={() => { signOut(); setMobileOpen(false); }} className="block text-left text-sm uppercase tracking-wide">
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm uppercase tracking-wide">
                      Iniciar sesión
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MODALS & DRAWERS */}
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