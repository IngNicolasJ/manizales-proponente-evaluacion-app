
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
          .eq('user_id', user.id)
          .single();

        if (processError) {
          console.error('❌ Error loading process data:', processError);
          return;
        }

        if (processData) {
          console.log('✅ Process data loaded:', processData);
          
          // Convertir los datos del proceso al formato esperado
          const formattedProcessData: ProcessData = {
            processNumber: processData.process_number,
            processObject: processData.process_name,
            closingDate: processData.closing_date,
            totalContractValue: 0, // Este valor no se guarda en la BD actualmente
            minimumSalary: 0, // Este valor no se guarda en la BD actualmente
            processType: 'licitacion', // Valor por defecto
            scoring: processData.scoring_criteria || {
              womanEntrepreneurship: 0,
              mipyme: 0,
              disabled: 0,
              qualityFactor: 0,
              environmentalQuality: 0,
              nationalIndustrySupport: 0
            },
            experience: processData.experience || {
              general: '',
              specific: '',
              additionalSpecific: [],
              classifierCodes: []
            }
          };

          setProcessData(formattedProcessData);
        }

        // Cargar proponentes del proceso
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
          console.log('✅ Proponents loaded for process:', proponentsData.length);
          
          // Convertir los datos de los proponentes al formato esperado
          const formattedProponents: Proponent[] = proponentsData.map(p => ({
            id: p.id,
            name: p.name,
            isPlural: p.is_plural,
            partners: p.partners,
            rup: p.rup,
            scoring: p.scoring,
            requirements: p.requirements,
            contractors: p.contractors || [],
            totalScore: Number(p.total_score),
            needsSubsanation: p.needs_subsanation,
            subsanationDetails: p.subsanation_details
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
