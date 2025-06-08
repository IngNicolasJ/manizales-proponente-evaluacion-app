
export interface ProcessData {
  processNumber: string;
  processObject: string;
  closingDate: string;
  totalContractValue: number;
  minimumSalary: number;
  processType: 'licitacion' | 'concurso' | 'abreviada' | 'minima';
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
  };
  experience: {
    general: string;
    specific: string;
    additionalSpecific: {
      value: number;
      unit: 'longitud' | 'area_cubierta' | 'area_ejecutada';
    };
  };
}

export interface Contractor {
  name: string;
  order: number;
  rupConsecutive: string;
  requiredExperience: 'general' | 'specific' | 'both';
  contractingEntity: string;
  contractNumber: string;
  object: string;
  servicesCode: string;
  executionForm: 'I' | 'C' | 'UT' | 'OTRA';
  participationPercentage?: number;
  experienceContributor?: string;
  totalValueSMMLV: number;
  adjustedValue: number;
  additionalSpecificExperienceContribution: number;
}

export interface Proponent {
  id: string;
  name: string;
  isPlural: boolean;
  partners?: Array<{
    name: string;
    percentage: number;
  }>;
  rup: {
    renewalDate: string;
    complies: boolean;
  };
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
    comments: Record<string, string>;
  };
  requirements: {
    generalExperience: boolean;
    specificExperience: boolean;
    professionalCard: boolean;
    additionalSpecificExperience: {
      amount: number;
      complies: boolean;
      comment?: string;
    };
  };
  contractors: Contractor[];
  totalScore: number;
  needsSubsanation: boolean;
}

export interface AppState {
  processData: ProcessData | null;
  proponents: Proponent[];
  currentStep: number;
}
