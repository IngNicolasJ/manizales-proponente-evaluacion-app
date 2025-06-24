
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessData, Proponent } from '@/types';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [proponents, setProponents] = useState<Proponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load process data
      const { data: processDataResult } = await supabase
        .from('process_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (processDataResult) {
        const transformedProcessData: ProcessData = {
          processNumber: processDataResult.process_number,
          processObject: processDataResult.process_name,
          closingDate: processDataResult.closing_date,
          totalContractValue: processDataResult.experience.totalContractValue || 0,
          minimumSalary: processDataResult.experience.minimumSalary || 0,
          processType: processDataResult.experience.processType || 'licitacion',
          scoring: processDataResult.scoring_criteria,
          experience: processDataResult.experience
        };
        setProcessData(transformedProcessData);

        // Load proponents for this process
        const { data: proponentsResult } = await supabase
          .from('proponents')
          .select('*')
          .eq('process_data_id', processDataResult.id);

        if (proponentsResult) {
          const transformedProponents: Proponent[] = proponentsResult.map(p => ({
            id: p.id,
            name: p.name,
            isPlural: p.is_plural,
            partners: p.partners,
            rup: p.rup,
            scoring: p.scoring,
            requirements: p.requirements,
            contractors: p.contractors,
            totalScore: Number(p.total_score),
            needsSubsanation: p.needs_subsanation,
            subsanationDetails: p.subsanation_details
          }));
          setProponents(transformedProponents);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProcessData = async (data: ProcessData) => {
    if (!user) return;

    try {
      const { data: result, error } = await supabase
        .from('process_data')
        .upsert({
          user_id: user.id,
          process_name: data.processObject,
          process_number: data.processNumber,
          closing_date: data.closingDate,
          experience: {
            ...data.experience,
            totalContractValue: data.totalContractValue,
            minimumSalary: data.minimumSalary,
            processType: data.processType
          },
          scoring_criteria: data.scoring,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setProcessData(data);
      return result;
    } catch (error) {
      console.error('Error saving process data:', error);
      throw error;
    }
  };

  const saveProponent = async (proponent: Proponent, processDataId: string) => {
    if (!user) return;

    try {
      const { data: result, error } = await supabase
        .from('proponents')
        .upsert({
          id: proponent.id,
          user_id: user.id,
          process_data_id: processDataId,
          name: proponent.name,
          is_plural: proponent.isPlural,
          partners: proponent.partners,
          rup: proponent.rup,
          scoring: proponent.scoring,
          requirements: proponent.requirements,
          contractors: proponent.contractors,
          total_score: proponent.totalScore,
          needs_subsanation: proponent.needsSubsanation,
          subsanation_details: proponent.subsanationDetails,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProponents(prev => {
        const existing = prev.find(p => p.id === proponent.id);
        if (existing) {
          return prev.map(p => p.id === proponent.id ? proponent : p);
        } else {
          return [...prev, proponent];
        }
      });

      return result;
    } catch (error) {
      console.error('Error saving proponent:', error);
      throw error;
    }
  };

  const deleteProponent = async (proponentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('proponents')
        .delete()
        .eq('id', proponentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProponents(prev => prev.filter(p => p.id !== proponentId));
    } catch (error) {
      console.error('Error deleting proponent:', error);
      throw error;
    }
  };

  return {
    processData,
    proponents,
    loading,
    saveProcessData,
    saveProponent,
    deleteProponent,
    refreshData: loadData
  };
};
