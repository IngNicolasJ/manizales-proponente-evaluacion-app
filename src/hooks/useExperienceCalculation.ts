
import { useMemo } from 'react';
import { Contractor, Proponent } from '@/types';

export const useExperienceCalculation = (proponent: Proponent | null) => {
  const calculatePartnerExperiencePercentages = useMemo(() => {
    if (!proponent || !proponent.isPlural || !proponent.partners || !proponent.contractors.length) {
      return {};
    }

    // Calcular el total de experiencia aportada por todos los contratos
    const totalExperience = proponent.contractors.reduce((sum, contractor) => {
      return sum + (contractor.adjustedValue || 0);
    }, 0);

    if (totalExperience === 0) return {};

    // Calcular cuánto aporta cada socio
    const partnerContributions: Record<string, number> = {};
    
    proponent.partners.forEach(partner => {
      const partnerContracts = proponent.contractors.filter(
        contractor => contractor.experienceContributor === partner.name
      );
      
      const partnerExperience = partnerContracts.reduce((sum, contractor) => {
        return sum + (contractor.adjustedValue || 0);
      }, 0);
      
      const percentage = (partnerExperience / totalExperience) * 100;
      partnerContributions[partner.name] = percentage;
    });

    return partnerContributions;
  }, [proponent]);

  const getPartnerExperiencePercentage = (partnerName: string): number => {
    return calculatePartnerExperiencePercentages[partnerName] || 0;
  };

  const canPartnerReceiveDisabilityScore = (partnerName: string): boolean => {
    return getPartnerExperiencePercentage(partnerName) >= 40;
  };

  return {
    calculatePartnerExperiencePercentages,
    getPartnerExperiencePercentage,
    canPartnerReceiveDisabilityScore
  };
};
