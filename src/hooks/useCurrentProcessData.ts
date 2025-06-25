
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';
import { ProcessData, Proponent } from '@/types';

export const useCurrentProcessData = () => {
  const { user } = useAuth();
  const { setProcessData, setProponents } = useAppStore();

  useEffect(() => {
    if (!user) return;

    const loadCurrentProcessData = async () => {
      try {
        const processId = localStorage.getItem('current_process_id');
        if (!processId) {
          console.log('📊 No current process ID found');
          return;
        }

        console.log('📊 Loading data for process:', processId);

        // Cargar datos del proceso
        const { data: processData, error: processError } = await supabase
          .from('process_data')
          .select('*')
          .eq('id', processId)
          .single(); // Removido el filtro de user_id para procesos compartidos

        if (processError) {
          console.error('❌ Error loading process data:', processError);
          return;
        }

        if (processData) {
          console.log('✅ Process data loaded:', processData);
          
          // Convertir los datos del proceso al formato esperado incluyendo valores reales
          const formattedProcessData: ProcessData = {
            processNumber: processData.process_number,
            processObject: processData.process_name,
            closingDate: processData.closing_date,
            totalContractValue: Number(processData.total_contract_value) || 0,
            minimumSalary: Number(processData.minimum_salary) || 0,
            processType: 'licitacion', // Valor por defecto
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
          .eq('user_id', user.id); // FILTRO CRÍTICO: Solo proponentes del usuario actual

        if (proponentsError) {
          console.error('❌ Error loading proponents:', proponentsError);
          return;
        }

        if (proponentsData) {
          console.log('✅ Proponents loaded for process and user:', proponentsData.length, 'Process ID:', processId, 'User ID:', user.id);
          
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
        }

      } catch (error) {
        console.error('❌ Error loading current process data:', error);
      }
    };

    loadCurrentProcessData();
  }, [user, setProcessData, setProponents]);
};
