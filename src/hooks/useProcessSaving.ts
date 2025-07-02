
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProcessSaving = () => {
  const { processData, proponents } = useAppStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const lastSavedProcessRef = useRef<string | null>(null);
  const lastSavedProponentsRef = useRef<Map<string, string>>(new Map());

  // Guardar datos del proceso cuando cambien
  useEffect(() => {
    if (!processData || !user || !processData.processNumber) return;

    // Evitar guardado duplicado del mismo proceso
    const processKey = `${processData.processNumber}-${user.id}`;
    if (lastSavedProcessRef.current === processKey) return;

    const saveProcessData = async () => {
      try {
        console.log('💾 Guardando datos del proceso:', processData.processNumber);

        // Primero intentar actualizar si ya existe
        const { data: existingProcess } = await supabase
          .from('process_data')
          .select('id')
          .eq('user_id', user.id)
          .eq('process_number', processData.processNumber)
          .single();

        let processId;

        if (existingProcess) {
          // Actualizar proceso existente
          const { data, error } = await supabase
            .from('process_data')
            .update({
              process_name: processData.processObject,
              closing_date: processData.closingDate,
              total_contract_value: processData.totalContractValue,
              minimum_salary: processData.minimumSalary,
              experience: processData.experience || {},
              scoring_criteria: processData.scoring || {},
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProcess.id)
            .select()
            .single();

          if (error) throw error;
          processId = existingProcess.id;
          console.log('✅ Proceso actualizado exitosamente:', data);
        } else {
          // Crear nuevo proceso
          const { data, error } = await supabase
            .from('process_data')
            .insert({
              user_id: user.id,
              process_number: processData.processNumber,
              process_name: processData.processObject,
              closing_date: processData.closingDate,
              total_contract_value: processData.totalContractValue,
              minimum_salary: processData.minimumSalary,
              experience: processData.experience || {},
              scoring_criteria: processData.scoring || {},
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          processId = data.id;
          console.log('✅ Proceso creado exitosamente:', data);
        }

        // CRÍTICO: Guardar el ID del proceso en localStorage inmediatamente
        if (processId) {
          localStorage.setItem('current_process_id', processId);
          lastSavedProcessRef.current = processKey;
          console.log('📝 Process ID guardado en localStorage:', processId);
        }

      } catch (error) {
        console.error('❌ Error al guardar proceso:', error);
        if (!error.message?.includes('duplicate key')) {
          toast({
            title: "Error al guardar",
            description: "No se pudo guardar el proceso automáticamente",
            variant: "destructive"
          });
        }
      }
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(saveProcessData, 1000);
    return () => clearTimeout(timeoutId);
  }, [processData, user, toast]);

  // Función para guardar/actualizar un proponente específico
  const saveProponent = async (proponent: any, specificProcessId: string) => {
    if (!user || !specificProcessId) {
      console.log('⏳ No hay usuario o processId para guardar proponente:', proponent.name);
      return;
    }

    try {
      console.log('💾 Guardando proponente específico:', proponent.name);

      // Convertir contractors a JSON compatible
      const contractorsJson = proponent.contractors?.map(contractor => ({
        name: contractor.name || '',
        order: contractor.order || 0,
        rupConsecutive: contractor.rupConsecutive || '',
        requiredExperience: contractor.requiredExperience || 'general',
        contractingEntity: contractor.contractingEntity || '',
        contractNumber: contractor.contractNumber || '',
        object: contractor.object || '',
        servicesCode: contractor.servicesCode || '',
        executionForm: contractor.executionForm || 'I',
        participationPercentage: contractor.participationPercentage || 0,
        experienceContributor: contractor.experienceContributor || '',
        totalValueSMMLV: contractor.totalValueSMMLV || 0,
        adjustedValue: contractor.adjustedValue || 0,
        additionalSpecificExperienceContribution: contractor.additionalSpecificExperienceContribution || [],
        adjustedAdditionalSpecificValue: contractor.adjustedAdditionalSpecificValue || [],
        contractType: contractor.contractType || 'public',
        privateDocumentsComplete: contractor.privateDocumentsComplete || false,
        contractComplies: contractor.contractComplies || false,
        nonComplianceReason: contractor.nonComplianceReason || '',
        selectedClassifierCodes: contractor.selectedClassifierCodes || [],
        classifierCodesMatch: contractor.classifierCodesMatch || false
      })) || [];

      // Intentar actualizar primero, si no existe, insertar
      const { data: existingProponent } = await supabase
        .from('proponents')
        .select('id')
        .eq('id', proponent.id)
        .eq('user_id', user.id)
        .eq('process_data_id', specificProcessId)
        .single();

      if (existingProponent) {
        // Actualizar proponente existente
        const { error } = await supabase
          .from('proponents')
          .update({
            number: proponent.number || '',
            name: proponent.name,
            is_plural: proponent.isPlural || false,
            partners: proponent.partners || null,
            rup: proponent.rup || {},
            contractors: contractorsJson,
            scoring: proponent.scoring || {},
            requirements: proponent.requirements || {},
            total_score: proponent.totalScore || 0,
            needs_subsanation: proponent.needsSubsanation || false,
            subsanation_details: proponent.subsanationDetails || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', proponent.id)
          .eq('user_id', user.id)
          .eq('process_data_id', specificProcessId);

        if (error) throw error;
        console.log('✅ Proponente actualizado exitosamente:', proponent.name);
      } else {
        // Insertar nuevo proponente
        const { error } = await supabase
          .from('proponents')
          .insert({
            id: proponent.id,
            user_id: user.id,
            process_data_id: specificProcessId,
            number: proponent.number || '',
            name: proponent.name,
            is_plural: proponent.isPlural || false,
            partners: proponent.partners || null,
            rup: proponent.rup || {},
            contractors: contractorsJson,
            scoring: proponent.scoring || {},
            requirements: proponent.requirements || {},
            total_score: proponent.totalScore || 0,
            needs_subsanation: proponent.needsSubsanation || false,
            subsanation_details: proponent.subsanationDetails || null,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        console.log('✅ Proponente insertado exitosamente:', proponent.name);
      }

    } catch (error) {
      console.error('❌ Error guardando proponente:', proponent.name, error);
      throw error;
    }
  };

  // Función para guardar proponentes (ahora guarda solo los que han cambiado)
  const saveProponents = async (specificProcessId: string) => {
    if (!proponents.length || !user || !specificProcessId) {
      console.log('⏳ No hay proponentes, usuario o processId para guardar:', { 
        proponentsLength: proponents.length, 
        hasUser: !!user, 
        processId: specificProcessId 
      });
      return;
    }

    try {
      console.log('💾 Guardando proponentes para proceso específico:', specificProcessId, 'Total proponentes:', proponents.length);

      // Guardar cada proponente individualmente (solo si ha cambiado)
      for (const proponent of proponents) {
        try {
          // Crear una clave única para este proponente
          const proponentKey = `${proponent.id}-${JSON.stringify(proponent.contractors)}-${JSON.stringify(proponent.requirements)}`;
          const lastSavedKey = lastSavedProponentsRef.current.get(proponent.id);

          // Solo guardar si ha cambiado
          if (lastSavedKey !== proponentKey) {
            await saveProponent(proponent, specificProcessId);
            lastSavedProponentsRef.current.set(proponent.id, proponentKey);
          } else {
            console.log('⏭️ Proponente sin cambios, saltando:', proponent.name);
          }
        } catch (proponentError) {
          console.error('❌ Error en proponente individual:', proponent.name, proponentError);
          // Continuar con el siguiente proponente
        }
      }

      console.log('✅ Proceso de guardado de proponentes completado para proceso:', specificProcessId);

    } catch (error) {
      console.error('❌ Error al guardar proponentes:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los proponentes automáticamente",
        variant: "destructive"
      });
    }
  };

  // Guardar proponentes cuando cambien
  useEffect(() => {
    if (!proponents.length || !user) return;

    const saveProponentsDelayed = async () => {
      const currentProcessId = localStorage.getItem('current_process_id');
      if (!currentProcessId || currentProcessId === 'undefined' || currentProcessId === 'null') {
        console.log('⏳ No hay process_id válido disponible, esperando...');
        return;
      }

      // VERIFICACIÓN ADICIONAL: Solo guardar si el proceso actual coincide
      if (processData?.processNumber) {
        try {
          const { data: processCheck } = await supabase
            .from('process_data')
            .select('process_number')
            .eq('id', currentProcessId)
            .eq('user_id', user.id)
            .single();

          if (processCheck?.process_number !== processData.processNumber) {
            console.warn('⚠️ Process ID en localStorage no coincide con proceso actual');
            return;
          }
        } catch (error) {
          console.error('❌ Error verificando proceso:', error);
          return;
        }
      }

      await saveProponents(currentProcessId);
    };

    // Debounce para evitar muchas llamadas
    const timeoutId = setTimeout(saveProponentsDelayed, 1500);
    return () => clearTimeout(timeoutId);
  }, [proponents, user, processData?.processNumber, toast]);

  return {
    forceSave: async () => {
      console.log('🔄 Forzando guardado manual...');
      const processId = localStorage.getItem('current_process_id');
      if (processId && processId !== 'undefined' && processId !== 'null' && proponents.length > 0) {
        await saveProponents(processId);
      }
    }
  };
};
