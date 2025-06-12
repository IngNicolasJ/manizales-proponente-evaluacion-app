
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProcessDataFormData {
  processNumber: string;
  processObject: string;
  closingDate: string;
  totalContractValue: number;
  minimumSalary: number;
  processType: 'licitacion' | 'concurso' | 'abreviada' | 'minima';
  generalExperience: string;
  specificExperience: string;
  classifierCodes: string[];
  additionalSpecific: Array<{
    name: string;
    value: number;
    unit: 'longitud' | 'area_cubierta' | 'area_ejecutada' | 'smlmv';
  }>;
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
  };
}

interface ScoringCriteriaSectionProps {
  register: UseFormRegister<ProcessDataFormData>;
  setValue: UseFormSetValue<ProcessDataFormData>;
  watch: UseFormWatch<ProcessDataFormData>;
}

const scoringOptionsMap = {
  womanEntrepreneurship: [0, 0.25],
  mipyme: [0, 0.25],
  disabled: [0, 1],
  qualityFactor: [0, 10, 19, 20],
  environmentalQuality: [0, 9, 10, 20],
  nationalIndustrySupport: [0, 10, 20]
};

export const ScoringCriteriaSection: React.FC<ScoringCriteriaSectionProps> = ({ 
  register, 
  setValue, 
  watch 
}) => {
  const watchedScoring = watch('scoring');

  const handleScoringChange = (field: keyof ProcessDataFormData['scoring'], value: string) => {
    setValue(`scoring.${field}`, parseFloat(value));
  };

  const renderScoringSelect = (
    field: keyof ProcessDataFormData['scoring'],
    label: string,
    id: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={watchedScoring[field]?.toString() || '0'}
        onValueChange={(value) => handleScoringChange(field, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar puntaje" />
        </SelectTrigger>
        <SelectContent>
          {scoringOptionsMap[field].map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criterios de puntuación</CardTitle>
        <CardDescription>Configure los puntajes máximos para cada criterio de evaluación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderScoringSelect('womanEntrepreneurship', 'Emprendimiento mujer', 'womanEntrepreneurship')}
          {renderScoringSelect('mipyme', 'MIPYME', 'mipyme')}
          {renderScoringSelect('disabled', 'Discapacitado', 'disabled')}
          {renderScoringSelect('qualityFactor', 'Factor de calidad', 'qualityFactor')}
          {renderScoringSelect('environmentalQuality', 'Factor de calidad ambiental', 'environmentalQuality')}
          {renderScoringSelect('nationalIndustrySupport', 'Apoyo a la industria nacional', 'nationalIndustrySupport')}
        </div>
      </CardContent>
    </Card>
  );
};
