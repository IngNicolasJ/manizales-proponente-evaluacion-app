
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProcessManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteProcess = async (processId: string, processNumber: string) => {
    setLoading(true);
    try {
      console.log('🗑️ Deleting process:', processId);

      // Eliminar el proceso (esto automáticamente eliminará los proponentes por CASCADE)
      const { error } = await supabase
        .from('process_data')
        .delete()
        .eq('id', processId);

      if (error) throw error;

      console.log('✅ Process deleted successfully');
      
      toast({
        title: "Proceso eliminado",
        description: `El proceso ${processNumber} ha sido eliminado exitosamente`,
      });

      return true;

    } catch (error) {
      console.error('❌ Error deleting process:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el proceso. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markProcessAsShared = async (processId: string, isShared: boolean) => {
    try {
      const { error } = await supabase
        .from('process_data')
        .update({ 
          is_shared: isShared,
          created_by_admin: isShared 
        })
        .eq('id', processId);

      if (error) throw error;

      toast({
        title: isShared ? "Proceso compartido" : "Proceso privado",
        description: isShared 
          ? "El proceso ahora puede ser compartido con usuarios"
          : "El proceso ahora es privado",
      });

      return true;

    } catch (error) {
      console.error('Error updating process sharing status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del proceso",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    deleteProcess,
    markProcessAsShared,
    loading
  };
};
