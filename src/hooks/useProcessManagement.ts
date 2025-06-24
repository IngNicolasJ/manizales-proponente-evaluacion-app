
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProcessManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteProcess = async (processId: string, processNumber: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log('🗑️ Deleting process:', processId, processNumber);
      
      // Primero eliminar todos los proponentes asociados
      const { error: proponentsError } = await supabase
        .from('proponents')
        .delete()
        .eq('process_data_id', processId);

      if (proponentsError) {
        console.error('Error deleting proponents:', proponentsError);
        throw proponentsError;
      }

      // Luego eliminar los accesos del proceso
      const { error: accessError } = await supabase
        .from('process_access')
        .delete()
        .eq('process_data_id', processId);

      if (accessError) {
        console.error('Error deleting process access:', accessError);
        // No lanzamos error aquí porque los accesos pueden no existir
      }

      // Finalmente eliminar el proceso
      const { error: processError } = await supabase
        .from('process_data')
        .delete()
        .eq('id', processId);

      if (processError) {
        console.error('Error deleting process:', processError);
        throw processError;
      }

      toast({
        title: "Proceso eliminado",
        description: `El proceso ${processNumber} ha sido eliminado exitosamente`,
      });

      console.log('✅ Process deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ Error deleting process:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proceso. Inténtelo nuevamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markProcessAsShared = async (processId: string, isShared: boolean): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log('🔄 Updating process sharing status:', processId, isShared);
      
      const { error } = await supabase
        .from('process_data')
        .update({ is_shared: isShared })
        .eq('id', processId);

      if (error) {
        console.error('Error updating process sharing:', error);
        throw error;
      }

      toast({
        title: isShared ? "Proceso compartido" : "Proceso privado",
        description: isShared 
          ? "El proceso ahora está disponible para compartir con otros usuarios"
          : "El proceso ahora es privado",
      });

      console.log('✅ Process sharing status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ Error updating process sharing:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del proceso. Inténtelo nuevamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProcess,
    markProcessAsShared,
    loading
  };
};
