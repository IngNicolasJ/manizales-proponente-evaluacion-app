
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
      
      // First get all process data
      const { data: processData, error: processError } = await supabase
        .from('process_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (processError) throw processError;
      
      // Then get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) throw profilesError;
      
      // Manually join the data
      const joinedData = processData?.map(process => {
        const profile = profiles?.find(p => p.id === process.user_id);
        return {
          ...process,
          profiles: profile || null
        };
      }) || [];
      
      return joinedData;
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
      
      // Get all proponents
      const { data: proponents, error: proponentsError } = await supabase
        .from('proponents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (proponentsError) throw proponentsError;
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) throw profilesError;
      
      // Get all process data
      const { data: processData, error: processError } = await supabase
        .from('process_data')
        .select('id, process_name, process_number');
      
      if (processError) throw processError;
      
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
      
      return joinedData;
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
