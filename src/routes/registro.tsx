import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/registro')({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: 'Crear Cuenta — FriendShop' },
      { name: 'description', content: 'Crea tu cuenta en FriendShop.' },
    ],
  }),
});

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('unspecified'); // <-- Nuevo estado para el género
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    
    // IMPORTANTE: Ahora pasamos 'gender' como cuarto parámetro a tu función signUp
    const { error } = await signUp(email, password, name, gender);
    
    setLoading(false);
    if (error) {
      setError('No se pudo crear la cuenta. Intenta con otro correo.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <h1 className="font-heading text-3xl font-medium text-foreground mb-3">
            ¡Casi listo!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Si es la primera vez que usas este correo, te hemos enviado un enlace de confirmación. Si no recibes nada en 2 minutos, es posible que ya tengas una cuenta o el correo sea incorrecto.
          </p>
          <Link
            to="/login"
            className="inline-block bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            Ir a Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <mmotion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-heading text-3xl font-medium text-foreground text-center mb-2">
          Crear Cuenta
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Únete a FriendShop
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
              placeholder="Tu nombre"
            />
          </div>

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

          {/* Selector de Género Integrado */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Identidad de género
            </label>
            <div className="flex gap-2">
              {['mujer', 'hombre', 'unspecified'].map((g) => (
                <button
                  key={g}
                  type="button" // Ojo: muy importante para que no envíe el formulario al hacer clic
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                    gender === g
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-foreground border-border hover:border-foreground/50'
                  }`}
                >
                  {g === 'mujer' ? 'Mujer' : g === 'hombre' ? 'Hombre' : 'Prefiero no decirlo'}
                </button>
              ))}
            </div>
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
                minLength={6}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="Mínimo 6 caracteres"
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
            className="w-full bg-foreground text-background py-3.5 rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </motion.button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Inicia Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}