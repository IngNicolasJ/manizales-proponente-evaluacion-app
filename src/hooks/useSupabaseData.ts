import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProcessData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['process-data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('📊 Fetching process data for user:', user.id);
      
      // Obtener SOLO procesos propios del usuario (SIN procesos compartidos)
      const { data: ownProcesses, error: ownError } = await supabase
        .from('process_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ownError) {
        console.error('❌ Error fetching own process data:', ownError);
        throw ownError;
      }

      // Marcar procesos propios como eliminables y NO compartidos
      const ownProcessesWithFlags = (ownProcesses || []).map(process => ({
        ...process,
        is_deletable: true, // Los procesos propios SÍ se pueden eliminar
        is_shared_with_me: false, // Los procesos propios NO son compartidos
        is_own_process: true // Marcador adicional para claridad
      }));

      console.log('✅ Own process data fetched:', {
        ownProcesses: ownProcessesWithFlags.length,
        processes: ownProcessesWithFlags.map(p => ({ id: p.id, number: p.process_number, deletable: p.is_deletable }))
      });
      
      return ownProcessesWithFlags;
    },
    enabled: !!user,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
};

// Nueva query separada SOLO para procesos compartidos
export const useSharedProcessData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['shared-process-data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('📊 Fetching shared process data for user:', user.id);
      
      // Obtener SOLO procesos compartidos (donde el usuario tiene acceso pero NO es propietario)
      const { data: sharedData, error: sharedError } = await supabase
        .from('process_access')
        .select(`
          process_data (*)
        `)
        .eq('user_id', user.id);

      if (sharedError) {
        console.error('❌ Error fetching shared process data:', sharedError);
        throw sharedError;
      }

      // Procesar procesos compartidos
      const sharedProcesses = (sharedData || []).map(item => {
        if (!item.process_data) return null;
        
        return {
          ...item.process_data,
          is_shared_with_me: true, // Marcado como compartido
          is_deletable: false, // Los procesos compartidos NO se pueden eliminar
          is_own_process: false // NO es proceso propio
        };
      }).filter(Boolean); // Filtrar elementos nulos

      console.log('✅ Shared process data fetched:', {
        sharedProcesses: sharedProcesses.length,
        processes: sharedProcesses.map(p => ({ id: p.id, number: p.process_number, shared: p.is_shared_with_me }))
      });
      
      return sharedProcesses;
    },
    enabled: !!user,
    retry: 2,
    staleTime: 30000,
  });
};

export const useProponents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['proponents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('📊 Fetching proponents for user:', user.id);
      
      const { data, error } = await supabase
        .from('proponents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching proponents:', error);
        throw error;
      }
      
      console.log('✅ Proponents fetched:', data?.length || 0, 'records');
      return data || [];
    },
    enabled: !!user,
    retry: 2,
    staleTime: 30000,
  });
};

export const useAllProcessData = () => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all-process-data'],
    queryFn: async () => {
      if (!user || !isAdmin) return [];
      
      console.log('📊 Fetching all process data (admin)');
      
      // First get all process data
      const { data: processData, error: processError } = await supabase
        .from('process_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (processError) {
        console.error('❌ Error fetching all process data:', processError);
        throw processError;
      }
      
      // Then get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Manually join the data
      const joinedData = processData?.map(process => {
        const profile = profiles?.find(p => p.id === process.user_id);
        return {
          ...process,
          profiles: profile || null
        };
      }) || [];
      
      console.log('✅ All process data fetched:', joinedData.length, 'records');
      return joinedData;
    },
    enabled: !!user && isAdmin,
    retry: 2,
    staleTime: 30000,
  });
};

export const useAllProponents = () => {
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all-proponents'],
    queryFn: async () => {
      if (!user || !isAdmin) return [];
      
      console.log('📊 Fetching all proponents (admin)');
      
      // Get all proponents
      const { data: proponents, error: proponentsError } = await supabase
        .from('proponents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (proponentsError) {
        console.error('❌ Error fetching all proponents:', proponentsError);
        throw proponentsError;
      }
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) {
        console.error('❌ Error fetching profiles for proponents:', profilesError);
        throw profilesError;
      }
      
      // Get all process data
      const { data: processData, error: processError } = await supabase
        .from('process_data')
        .select('id, process_name, process_number');
      
      if (processError) {
        console.error('❌ Error fetching process data for proponents:', processError);
        throw processError;
      }
      
      // Manually join the data
      const joinedData = proponents?.map(proponent => {
        const profile = profiles?.find(p => p.id === proponent.user_id);
        const process = processData?.find(p => p.id === proponent.process_data_id);
        return {
          ...proponent,
          profiles: profile || null,
          process_data: process || null
        };
      }) || [];
      
      console.log('✅ All proponents fetched:', joinedData.length, 'records');
      return joinedData;
    },
    enabled: !!user && isAdmin,
    retry: 2,
    staleTime: 30000,
  });
};

export const useUserStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('📊 Fetching user stats for:', user.id);
      
      // Obtener datos de procesos del usuario
      const { data: processData, error: processError } = await supabase
        .from('process_data')
        .select('id')
        .eq('user_id', user.id);

      if (processError) {
        console.error('❌ Error fetching process data for stats:', processError);
        throw processError;
      }

      // Obtener datos de proponentes del usuario
      const { data: proponentsData, error: proponentsError } = await supabase
        .from('proponents')
        .select('total_score')
        .eq('user_id', user.id);

      if (proponentsError) {
        console.error('❌ Error fetching proponents for stats:', proponentsError);
        throw proponentsError;
      }

      const totalProcesses = processData?.length || 0;
      const totalProponents = proponentsData?.length || 0;
      const avgScore = proponentsData?.length 
        ? proponentsData.reduce((sum, p) => sum + Number(p.total_score), 0) / proponentsData.length 
        : 0;

      const stats = {
        totalProcesses,
        totalProponents,
        avgScore: Math.round(avgScore * 100) / 100
      };

      console.log('✅ User stats fetched:', stats);
      return stats;
    },
    enabled: !!user,
    retry: 2,
    staleTime: 30000,
  });
};
