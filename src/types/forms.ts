
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
    comments: Record<string, string>;
  };
}
