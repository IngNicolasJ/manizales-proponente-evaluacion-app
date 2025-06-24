
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';

const Dashboard = () => {
  const { isAdmin, loading, user } = useAuth();

  console.log('📊 Dashboard v2.0 - loading:', loading, 'user:', user?.email || 'none', 'isAdmin:', isAdmin);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">🔄 Cargando dashboard v2.0...</p>
          <p className="text-xs text-muted-foreground mt-2">Verificando permisos de usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">❌ Error: Usuario no encontrado</p>
          <p className="text-xs text-muted-foreground mt-2">Por favor, inicia sesión nuevamente</p>
        </div>
      </div>
    );
  }

  console.log('✅ Dashboard: Rendering', isAdmin ? 'AdminDashboard' : 'UserDashboard');
  
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
