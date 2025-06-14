
import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ProcessData } from '@/types';

interface RequirementsFormData {
  proponentId: string;
  generalExperience: boolean;
  specificExperience: boolean;
  professionalCard: boolean;
  additionalSpecificAmounts: Array<{
    name: string;
    amount: number;
    comment?: string;
  }>;
}

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
  const getUnitLabel = (unit: string): string => {
    const labels = {
      'longitud': 'Longitud',
      'area_cubierta': 'Área de cubierta medida en planta',
      'area_ejecutada': 'Área ejecutada',
      'smlmv': 'SMLMV'
    };
    return labels[unit as keyof typeof labels] || unit;
  };

  const checkAdditionalSpecificCompliance = (amount: number, requiredValue: number): boolean => {
    return amount >= requiredValue;
  };

  const additionalSpecificCriteria = Array.isArray(processData?.experience.additionalSpecific) 
    ? processData.experience.additionalSpecific 
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de experiencia</CardTitle>
        <CardDescription>Marque los requisitos que cumple el proponente {selectedProponentName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="generalExperience"
                checked={watchedValues.generalExperience}
                onCheckedChange={(checked) => setValue('generalExperience', !!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="generalExperience" className="font-medium">
                  ¿Cumple experiencia general?
                </Label>
                <p className="text-sm text-muted-foreground">
                  {processData.experience.general}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="specificExperience"
                checked={watchedValues.specificExperience}
                onCheckedChange={(checked) => setValue('specificExperience', !!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="specificExperience" className="font-medium">
                  ¿Cumple experiencia específica?
                </Label>
                <p className="text-sm text-muted-foreground">
                  {processData.experience.specific}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="professionalCard"
                checked={watchedValues.professionalCard}
                onCheckedChange={(checked) => setValue('professionalCard', !!checked)}
              />
              <Label htmlFor="professionalCard">
                ¿Aporta tarjeta profesional del ingeniero?
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Experiencia específica adicional</h4>
          {additionalSpecificCriteria.map((criteria, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <h5 className="font-medium">{criteria.name}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Cantidad aportada ({getUnitLabel(criteria.unit)})
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={watchedValues.additionalSpecificAmounts?.[index]?.amount || 0}
                    readOnly
                    className="bg-muted"
                  />
                  <div className="text-sm text-muted-foreground">
                    Valor requerido: {criteria.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    * Calculado automáticamente desde los contratos aportados
                  </div>
                  {watchedValues.additionalSpecificAmounts?.[index] && (
                    <div className="flex items-center space-x-2">
                      {checkAdditionalSpecificCompliance(
                        watchedValues.additionalSpecificAmounts[index].amount,
                        criteria.value
                      ) ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success font-medium">Cumple</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-destructive font-medium">SUBSANAR</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {!checkAdditionalSpecificCompliance(
                  watchedValues.additionalSpecificAmounts?.[index]?.amount || 0,
                  criteria.value
                ) && (
                  <div className="space-y-2">
                    <Label className="text-destructive">
                      Comentario obligatorio (no cumple) *
                    </Label>
                    <Textarea
                      value={watchedValues.additionalSpecificAmounts?.[index]?.comment || ''}
                      onChange={(e) => {
                        const newAmounts = [...(watchedValues.additionalSpecificAmounts || [])];
                        if (newAmounts[index]) {
                          newAmounts[index].comment = e.target.value;
                        }
                        setValue('additionalSpecificAmounts', newAmounts);
                      }}
                      placeholder="Explique por qué no cumple el requisito"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
