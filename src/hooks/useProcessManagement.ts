
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useProcessManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const deleteProcess = async (processId: string, processNumber: string): Promise<boolean> => {
    if (!user) {
      console.error('❌ No user found for delete operation');
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    
    try {
      console.log('🗑️ Deleting process:', processId, processNumber);
      
      // VERIFICAR que el proceso pertenece al usuario actual
      const { data: processCheck, error: checkError } = await supabase
        .from('process_data')
        .select('user_id')
        .eq('id', processId)
        .single();

      if (checkError) {
        console.error('❌ Error checking process ownership:', checkError);
        throw new Error('No se pudo verificar la propiedad del proceso');
      }

      if (processCheck.user_id !== user.id) {
        console.error('❌ User does not own this process');
        toast({
          title: "Error",
          description: "No tienes permisos para eliminar este proceso",
          variant: "destructive"
        });
        return false;
      }

      // Primero eliminar todos los proponentes asociados al proceso del usuario actual
      const { error: proponentsError } = await supabase
        .from('proponents')
        .delete()
        .eq('process_data_id', processId)
        .eq('user_id', user.id); // Asegurar que solo se eliminen los proponentes del usuario

      if (proponentsError) {
        console.error('❌ Error deleting proponents:', proponentsError);
        throw proponentsError;
      }

      // Luego eliminar los accesos del proceso (si existen)
      const { error: accessError } = await supabase
        .from('process_access')
        .delete()
        .eq('process_data_id', processId);

      if (accessError) {
        console.warn('⚠️ Error deleting process access (may not exist):', accessError);
        // No lanzamos error aquí porque los accesos pueden no existir
      }

      // Finalmente eliminar el proceso (solo si pertenece al usuario)
      const { error: processError } = await supabase
        .from('process_data')
        .delete()
        .eq('id', processId)
        .eq('user_id', user.id); // Doble verificación de propiedad

      if (processError) {
        console.error('❌ Error deleting process:', processError);
        throw processError;
      }

      toast({
        title: "Proceso eliminado",
        description: `El proceso ${processNumber} ha sido eliminado exitosamente`,
      });

      console.log('✅ Process deleted successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Error deleting process:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el proceso. Inténtelo nuevamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markProcessAsShared = async (processId: string, isShared: boolean): Promise<boolean> => {
    if (!user) {
      console.error('❌ No user found for sharing operation');
      return false;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Updating process sharing status:', processId, isShared);
      
      // Verificar que el proceso pertenece al usuario actual
      const { data: processCheck, error: checkError } = await supabase
        .from('process_data')
        .select('user_id')
        .eq('id', processId)
        .single();

      if (checkError || processCheck.user_id !== user.id) {
        throw new Error('No tienes permisos para modificar este proceso');
      }

      const { error } = await supabase
        .from('process_data')
        .update({ is_shared: isShared })
        .eq('id', processId)
        .eq('user_id', user.id); // Doble verificación de propiedad

      if (error) {
        console.error('❌ Error updating process sharing:', error);
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

    } catch (error: any) {
      console.error('❌ Error updating process sharing:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado del proceso. Inténtelo nuevamente.",
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
