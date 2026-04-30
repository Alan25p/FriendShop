import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';


export const Route = createFileRoute('/login')({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: 'Iniciar Sesión — FriendShop' },
      { name: 'description', content: 'Inicia sesión en tu cuenta de FriendShop.' },
    ],
  }),
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const { error } = await signIn(email, password);

  if (error) {
    setError('Correo o contraseña incorrectos');
    setLoading(false);
    return;
  }

  // obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setError('No se pudo obtener el usuario');
    setLoading(false);
    return;
  }

  // obtener profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  console.log('USER ID:', user.id);
  console.log('PROFILE:', profile);

  setLoading(false);

  // redirección según rol
  if (profile?.role === 'admin') {
    navigate({ to: '/admin' });
  } else {
    navigate({ to: '/' });
  }
};

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-heading text-3xl font-medium text-foreground text-center mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Bienvenida de vuelta a FriendShop
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-foreground text-background py-3.5 rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </motion.button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
}