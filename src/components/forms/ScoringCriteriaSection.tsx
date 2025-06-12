
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
}

export const ScoringCriteriaSection: React.FC<ScoringCriteriaSectionProps> = ({ register }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criterios de puntuación</CardTitle>
        <CardDescription>Configure los puntajes máximos para cada criterio de evaluación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="womanEntrepreneurship">Emprendimiento mujer</Label>
            <Input 
              id="womanEntrepreneurship"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.womanEntrepreneurship', { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mipyme">MIPYME</Label>
            <Input 
              id="mipyme"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.mipyme', { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disabled">Discapacitado</Label>
            <Input 
              id="disabled"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.disabled', { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityFactor">Factor de calidad</Label>
            <Input 
              id="qualityFactor"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.qualityFactor', { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environmentalQuality">Factor de calidad ambiental</Label>
            <Input 
              id="environmentalQuality"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.environmentalQuality', { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalIndustrySupport">Apoyo a la industria nacional</Label>
            <Input 
              id="nationalIndustrySupport"
              type="number" 
              step="0.01"
              min="0"
              {...register('scoring.nationalIndustrySupport', { valueAsNumber: true })} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
