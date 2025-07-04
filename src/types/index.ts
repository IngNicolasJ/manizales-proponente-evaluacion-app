
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
    // Campos específicos para concurso de méritos
    equipoTrabajo?: number;
    factorSostenibilidad?: number;
    experienciaFormacionAcademica?: number;
  };
  experience: {
    general: string;
    specific: string;
    additionalSpecific: Array<{
      name: string;
      value: number;
      unit: 'longitud' | 'area_cubierta' | 'area_ejecutada' | 'smlmv';
    }>;
    classifierCodes: string[];
  };
}

export interface Contractor {
  name: string;
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
  additionalSpecificExperienceContribution: Array<{
    name: string;
    value: number;
  }>;
  adjustedAdditionalSpecificValue: Array<{
    name: string;
    value: number;
  }>;
  contractType: 'public' | 'private';
  privateDocumentsComplete?: boolean;
  contractComplies: boolean;
  nonComplianceReason?: string;
  selectedClassifierCodes: string[];
  classifierCodesMatch: boolean;
}

export interface Proponent {
  id: string;
  number: string;
  name: string;
  isPlural: boolean;
  partners?: Array<{
    name: string;
    percentage: number;
    rupRenewalDate?: string;
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
    // Campos específicos para concurso de méritos
    equipoTrabajo?: number;
    factorSostenibilidad?: number;
    experienciaFormacionAcademica?: number;
    disabilityContributor?: string; // Socio que aporta certificado de discapacidad
    comments: Record<string, string>;
  };
  requirements: {
    generalExperience: boolean;
    specificExperience: boolean;
    professionalCard: boolean;
    additionalSpecificExperience: Array<{
      name: string;
      amount: number;
      complies: boolean;
      comment?: string;
    }>;
  };
  contractors: Contractor[];
  totalScore: number;
  needsSubsanation: boolean;
  subsanationDetails?: string[];
}

export interface AppState {
  processData: ProcessData | null;
  proponents: Proponent[];
  currentStep: number;
}
