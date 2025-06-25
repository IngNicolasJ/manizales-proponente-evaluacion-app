
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';
import { ProcessData, Proponent } from '@/types';

export const useCurrentProcessData = () => {
  const { user } = useAuth();
  const { setProcessData, setProponents, clearProponents } = useAppStore();

  useEffect(() => {
    if (!user) return;

    const loadCurrentProcessData = async () => {
      try {
        const processId = localStorage.getItem('current_process_id');
        
        // Si no hay process_id, limpiar datos y salir
        if (!processId || processId === 'undefined' || processId === 'null') {
          console.log('📊 No valid current process ID found, clearing data');
          setProcessData(null);
          clearProponents();
          return;
        }

        console.log('📊 Loading data for process:', processId);

        // Verificar que el processId es un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(processId)) {
          console.error('❌ Invalid UUID format for process_id:', processId);
          localStorage.removeItem('current_process_id');
          return;
        }

        // Cargar datos del proceso
        const { data: processData, error: processError } = await supabase
          .from('process_data')
          .select('*')
          .eq('id', processId)
          .single();

        if (processError) {
          console.error('❌ Error loading process data:', processError);
          if (processError.code === '22P02') {
            console.log('🧹 Clearing invalid process_id from localStorage');
            localStorage.removeItem('current_process_id');
          }
          return;
        }

        if (processData) {
          console.log('✅ Process data loaded:', processData);
          
          // Convertir los datos del proceso al formato esperado
          const formattedProcessData: ProcessData = {
            processNumber: processData.process_number,
            processObject: processData.process_name,
            closingDate: processData.closing_date,
            totalContractValue: Number(processData.total_contract_value) || 0,
            minimumSalary: Number(processData.minimum_salary) || 0,
            processType: 'licitacion',
            scoring: (processData.scoring_criteria as any) || {
              womanEntrepreneurship: 0,
              mipyme: 0,
              disabled: 0,
              qualityFactor: 0,
              environmentalQuality: 0,
              nationalIndustrySupport: 0
            },
            experience: (processData.experience as any) || {
              general: '',
              specific: '',
              additionalSpecific: [],
              classifierCodes: []
            }
          };

          setProcessData(formattedProcessData);
        }

        // CRÍTICO: Cargar SOLO los proponentes del proceso específico Y del usuario actual
        const { data: proponentsData, error: proponentsError } = await supabase
          .from('proponents')
          .select('*')
          .eq('process_data_id', processId)
          .eq('user_id', user.id);

        if (proponentsError) {
          console.error('❌ Error loading proponents:', proponentsError);
          return;
        }

        if (proponentsData) {
          console.log('✅ Proponents loaded for process and user:', {
            count: proponentsData.length,
            processId,
            userId: user.id,
            proponents: proponentsData.map(p => ({ id: p.id, name: p.name }))
          });
          
          // Convertir los datos de los proponentes al formato esperado
          const formattedProponents: Proponent[] = proponentsData.map(p => ({
            id: p.id,
            name: p.name,
            isPlural: p.is_plural,
            partners: (p.partners as any) || null,
            rup: (p.rup as any) || { renewalDate: '', complies: false },
            scoring: (p.scoring as any) || {
              womanEntrepreneurship: 0,
              mipyme: 0,
              disabled: 0,
              qualityFactor: 0,
              environmentalQuality: 0,
              nationalIndustrySupport: 0,
              comments: {}
            },
            requirements: (p.requirements as any) || {
              generalExperience: false,
              specificExperience: false,
              professionalCard: false,
              additionalSpecificExperience: []
            },
            contractors: (p.contractors as any) || [],
            totalScore: Number(p.total_score),
            needsSubsanation: p.needs_subsanation,
            subsanationDetails: p.subsanation_details || []
          }));

          setProponents(formattedProponents);
        } else {
          // Si no hay proponentes, limpiar el array
          clearProponents();
        }

      } catch (error) {
        console.error('❌ Error loading current process data:', error);
        // En caso de error, limpiar datos para evitar estados inconsistentes
        setProcessData(null);
        clearProponents();
      }
    };

    loadCurrentProcessData();
  }, [user, setProcessData, setProponents, clearProponents]);
};
