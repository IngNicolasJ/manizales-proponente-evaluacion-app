
export interface ProponentFormData {
  name: string;
  isPlural: boolean;
  partners: Array<{
    name: string;
    percentage: number;
    rupRenewalDate: string;
  }>;
  rupRenewalDate: string;
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
    disabilityContributor?: string; // Socio que aporta certificado de discapacidad
    comments: Record<string, string>;
  };
}

export interface RequirementsFormData {
  proponentId: string;
  generalExperience: boolean;
  specificExperience: boolean;
  professionalCard: boolean;
  additionalSpecificAmounts: Array<{
    name: string;
    amount: number;
    comment?: string;
  }>;
  contractors: Array<{
    name: string;
    order: number;
    rupConsecutive: string;
    requiredExperience: 'general' | 'specific' | 'both';
    contractingEntity: string;
    contractNumber: string;
    object: string;
    servicesCode: string;
    executionForm: 'I' | 'C' | 'UT' | 'OTRA';
    participationPercentage: number;
    experienceContributor: string;
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
    contractComplies: boolean;
    selectedClassifierCodes: string[];
    classifierCodesMatch: boolean;
    privateDocumentsComplete?: boolean;
    nonComplianceReason?: string;
  }>;
}
