import { createFileRoute, redirect } from '@tanstack/react-router';
import AdminProductsPage from '../AdminProductsPage';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    // Obtener sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw redirect({ to: '/login' });
    }

    // Obtener profile
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    // Si falla la consulta o no hay perfil
    if (profileError || !profile) {
      throw redirect({ to: '/' });
    }

    // Si no es admin
    if (profile.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },

  component: AdminPage,
});

function AdminPage() {
  return <AdminProductsPage />;
}


/*import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin"!</div>
}*/
