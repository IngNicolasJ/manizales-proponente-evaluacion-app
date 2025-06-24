
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProcessData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['process-data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('process_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useProponents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['proponents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('proponents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAllProcessData = () => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all-process-data'],
    queryFn: async () => {
      if (!user || !isAdmin) return [];
      
      const { data, error } = await supabase
        .from('process_data')
        .select(`
          *,
          profiles!inner(
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });
};

export const useAllProponents = () => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all-proponents'],
    queryFn: async () => {
      if (!user || !isAdmin) return [];
      
      const { data, error } = await supabase
        .from('proponents')
        .select(`
          *,
          profiles!inner(
            email,
            full_name
          ),
          process_data!inner(
            process_name,
            process_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isAdmin,
  });
};

export const useUserStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Obtener datos de procesos del usuario
      const { data: processData } = await supabase
        .from('process_data')
        .select('id')
        .eq('user_id', user.id);

      // Obtener datos de proponentes del usuario
      const { data: proponentsData } = await supabase
        .from('proponents')
        .select('total_score')
        .eq('user_id', user.id);

      const totalProcesses = processData?.length || 0;
      const totalProponents = proponentsData?.length || 0;
      const avgScore = proponentsData?.length 
        ? proponentsData.reduce((sum, p) => sum + Number(p.total_score), 0) / proponentsData.length 
        : 0;

      return {
        totalProcesses,
        totalProponents,
        avgScore: Math.round(avgScore * 100) / 100
      };
    },
    enabled: !!user,
  });
};
