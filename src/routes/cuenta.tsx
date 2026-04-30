import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Package, User, Calendar, Mail, Upload, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export const Route = createFileRoute('/cuenta')({
  component: CuentaPage,
  head: () => ({
    meta: [
      { title: 'Mi Cuenta — FriendShop' },
      { name: 'description', content: 'Tu cuenta en FriendShop.' },
    ],
  }),
});

interface OrderProduct {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
}

interface Order {
  id: string;
  products: OrderProduct[];
  total: number;
  status: string;
  created_at: string;
}

function CuentaPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Estados para el perfil
  const [gender, setGender] = useState<string>('unspecified');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' });
    } else if (user) {
      // Cargar metadatos del usuario al iniciar
      setGender(user.user_metadata?.gender || 'unspecified');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id) // <-- ESTA ES LA LÍNEA CLAVE
        .order('created_at', { ascending: false })
        .limit(20) as any;
        
      if (error) console.error("Error cargando pedidos:", error);
      
      setOrders((data as Order[]) ?? []);
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [user]);

  // Función para subir avatar
  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Hubo un error subiendo la imagen.');
    } finally {
      setUploading(false);
    }
  };

  // Función para eliminar avatar
  const handleDeleteAvatar = async () => {
    try {
      if (!avatarUrl) return;

      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (storageError) throw storageError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (authError) throw authError;

      setAvatarUrl(null);
      alert('Foto eliminada correctamente.');
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('Hubo un error al intentar eliminar la foto.');
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar tu cuenta de forma permanente? Esta acción no se puede deshacer.")) {
        try {
            const { error } = await supabase.rpc('delete_user'); 
            if (error) {
                 console.error("Error intentando borrar usuario mediante RPC", error);
                 alert("No se pudo eliminar la cuenta. Verifica que la función 'delete_user' exista en Supabase.");
            } else {
                 await signOut();
                 navigate({ to: '/' });
            }
        } catch (e) {
            console.error("Excepción al borrar", e);
        }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : null;

  // Determinar color de la silueta basado en el género guardado
  const getAvatarColor = () => {
    if (gender === 'mujer') return 'bg-pink-500/20 text-pink-500';
    if (gender === 'hombre') return 'bg-blue-500/20 text-blue-500';
    return 'bg-purple-500/20 text-purple-500'; 
  };

  return (
    <>
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
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
        >
          <h1 className="font-heading text-4xl font-light text-foreground mb-8">Mi Cuenta</h1>

          {/* Profile info */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              
              {/* Contenedor de Avatar con botón de eliminar */}
              <div className="relative group">
                {avatarUrl ? (
                  <div className="relative">
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-border" 
                    />
                    {/* Botón para eliminar foto */}
                    <button
                      onClick={handleDeleteAvatar}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground p-1 rounded-full shadow-md hover:scale-110 transition-transform"
                      title="Eliminar foto"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getAvatarColor()} transition-colors duration-300`}>
                    <User size={32} />
                  </div>
                )}
                
                {/* Botón flotante para subir foto */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  <Upload size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUploadAvatar} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-medium text-foreground">{userName}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail size={13} />
                  {user.email}
                </p>
                {createdAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Calendar size={13} />
                    Miembro desde {createdAt}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>

              <button
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-colors ml-auto"
              >
                <Trash2 size={16} />
                Eliminar cuenta
              </button>
            </div>
          </div>

          {/* Orders */}
          <h2 className="font-heading text-2xl font-light text-foreground mb-4 flex items-center gap-2">
            <Package size={20} />
            Mis Pedidos
          </h2>

          {loadingOrders ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Cargando pedidos...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground text-sm mb-2">No tienes pedidos aún</p>
              <p className="text-xs text-muted-foreground/70">Tus pedidos aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4 pb-12">
              {orders.map((order) => {
                const orderDate = new Date(order.created_at);
                const products = order.products as OrderProduct[];
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {orderDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {' · '}
                          {orderDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {products.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {p.image && (
                            <img src={p.image} alt={p.name} loading="lazy" className="w-10 h-12 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {p.name}
                            </p>

                          {p.selectedSize && (
                            <p className="text-xs text-muted-foreground">
                              Talla: {p.selectedSize}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            x{p.quantity}
                          </p>
                        </div>
                          <p className="text-sm font-medium text-foreground">{formatPrice(p.price * p.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-3 pt-3 border-t border-border">
                      <p className="text-sm font-semibold text-foreground">Total: {formatPrice(Number(order.total))}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}