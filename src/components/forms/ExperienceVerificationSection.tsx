
import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProcessData } from '@/types';
import { RequirementsFormData } from '@/types/forms';

interface ExperienceVerificationSectionProps {
  processData: ProcessData;
  watchedValues: RequirementsFormData;
  setValue: UseFormSetValue<RequirementsFormData>;
  selectedProponentName: string;
}

export const ExperienceVerificationSection: React.FC<ExperienceVerificationSectionProps> = ({
  processData,
  watchedValues,
  setValue,
  selectedProponentName
}) => {
  const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
    ? processData.experience.additionalSpecific 
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de experiencia - {selectedProponentName}</CardTitle>
        <CardDescription>Marque los requisitos que cumple el proponente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generalExperience"
              checked={watchedValues.generalExperience}
              onCheckedChange={(checked) => setValue('generalExperience', !!checked)}
            />
            <Label htmlFor="generalExperience">Experiencia general</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="specificExperience"
              checked={watchedValues.specificExperience}
              onCheckedChange={(checked) => setValue('specificExperience', !!checked)}
            />
            <Label htmlFor="specificExperience">Experiencia específica</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="professionalCard"
              checked={watchedValues.professionalCard}
              onCheckedChange={(checked) => setValue('professionalCard', !!checked)}
            />
            <Label htmlFor="professionalCard">Tarjeta profesional</Label>
          </div>
        </div>

        {additionalSpecific.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Experiencia específica adicional</h4>
            <div className="grid grid-cols-1 gap-4">
              {additionalSpecific.map((criteria, index) => {
                const amount = watchedValues.additionalSpecificAmounts?.[index];
                const complies = (amount?.amount || 0) >= criteria.value;
                
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{criteria.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        Requerido: {criteria.value} {criteria.unit}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cantidad aportada</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={amount?.amount || 0}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Comentarios</Label>
                        <Input
                          value={amount?.comment || ''}
                          onChange={(e) => {
                            const newAmounts = [...(watchedValues.additionalSpecificAmounts || [])];
                            if (newAmounts[index]) {
                              newAmounts[index] = { ...newAmounts[index], comment: e.target.value };
                            } else {
                              newAmounts[index] = { name: criteria.name, amount: 0, comment: e.target.value };
                            }
                            setValue('additionalSpecificAmounts', newAmounts);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className={`text-sm font-medium ${complies ? 'text-green-600' : 'text-red-600'}`}>
                      {complies ? '✓ Cumple' : '✗ No cumple'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
