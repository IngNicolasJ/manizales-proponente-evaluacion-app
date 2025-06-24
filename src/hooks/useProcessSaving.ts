
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProcessSaving = () => {
  const { processData, proponents } = useAppStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Guardar datos del proceso cuando cambien
  useEffect(() => {
    if (!processData || !user) return;

    const saveProcessData = async () => {
      try {
        console.log('💾 Guardando datos del proceso:', processData);

        const { data, error } = await supabase
          .from('process_data')
          .upsert({
            user_id: user.id,
            process_number: processData.processNumber,
            process_name: processData.processName,
            closing_date: processData.closingDate,
            experience: processData.experience,
            scoring_criteria: processData.scoringCriteria,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,process_number'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error guardando proceso:', error);
          throw error;
        }

        console.log('✅ Proceso guardado exitosamente:', data);
        
        // Guardar el ID del proceso para asociar proponentes
        if (data) {
          localStorage.setItem('current_process_id', data.id);
        }

      } catch (error) {
        console.error('❌ Error al guardar proceso:', error);
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar el proceso automáticamente",
          variant: "destructive"
        });
      }
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(saveProcessData, 1000);
    return () => clearTimeout(timeoutId);
  }, [processData, user, toast]);

  // Guardar proponentes cuando cambien
  useEffect(() => {
    if (!proponents.length || !user) return;

    const saveProponents = async () => {
      try {
        const processId = localStorage.getItem('current_process_id');
        if (!processId) {
          console.log('⏳ Esperando ID del proceso para guardar proponentes');
          return;
        }

        console.log('💾 Guardando proponentes:', proponents.length);

        for (const proponent of proponents) {
          const { error } = await supabase
            .from('proponents')
            .upsert({
              id: proponent.id,
              user_id: user.id,
              process_data_id: processId,
              name: proponent.name,
              is_plural: proponent.isPlural || false,
              partners: proponent.partners || null,
              rup: proponent.rup || {},
              contractors: proponent.contractors || [],
              scoring: proponent.scoring || {},
              requirements: proponent.requirements || {},
              total_score: proponent.totalScore || 0,
              needs_subsanation: proponent.needsSubsanation || false,
              subsanation_details: proponent.subsanationDetails || null,
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('❌ Error guardando proponente:', proponent.name, error);
            throw error;
          }
        }

        console.log('✅ Proponentes guardados exitosamente');

      } catch (error) {
        console.error('❌ Error al guardar proponentes:', error);
        toast({
          title: "Error al guardar",
          description: "No se pudieron guardar los proponentes automáticamente",
          variant: "destructive"
        });
      }
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(saveProponents, 1000);
    return () => clearTimeout(timeoutId);
  }, [proponents, user, toast]);

  return {
    // Función para forzar guardado manual si es necesario
    forceSave: async () => {
      // Esta función se puede usar para guardar manualmente
      console.log('🔄 Forzando guardado manual...');
    }
  };
};
