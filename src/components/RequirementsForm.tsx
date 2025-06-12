import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Proponent } from '@/types';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ProponentFormData } from '@/types/forms';

interface RequirementsFormProps {
  proponentIndex: number;
  register: UseFormRegister<ProponentFormData>;
  watch: UseFormWatch<ProponentFormData>;
  setValue: UseFormSetValue<ProponentFormData>;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  proponentIndex,
  register,
  watch,
  setValue
}) => {
  const proponents = useAppStore((state) => state.proponents);
  const proponent = proponents[proponentIndex];

  if (!proponent) {
    return <p>Proponente no encontrado</p>;
  }

  const watchedValues = watch();

  const handleCheckboxChange = (field: string, value: boolean) => {
    setValue(`proponents.${proponentIndex}.${field}`, value);
  };

  const handleAdditionalExperienceChange = (index: number, field: string, value: any) => {
    setValue(`proponents.${proponentIndex}.requirements.additionalSpecificExperience.${index}.${field}`, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Experiencia general</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`generalExperience-${proponentIndex}`}
              checked={watchedValues.proponents?.[proponentIndex]?.requirements?.generalExperience}
              onCheckedChange={(checked) =>
                handleCheckboxChange(`requirements.generalExperience`, !!checked)
              }
            />
            <Label htmlFor={`generalExperience-${proponentIndex}`}>Cumple con experiencia general</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiencia específica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`specificExperience-${proponentIndex}`}
              checked={watchedValues.proponents?.[proponentIndex]?.requirements?.specificExperience}
              onCheckedChange={(checked) =>
                handleCheckboxChange(`requirements.specificExperience`, !!checked)
              }
            />
            <Label htmlFor={`specificExperience-${proponentIndex}`}>Cumple con experiencia específica</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarjeta profesional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`professionalCard-${proponentIndex}`}
              checked={watchedValues.proponents?.[proponentIndex]?.requirements?.professionalCard}
              onCheckedChange={(checked) =>
                handleCheckboxChange(`requirements.professionalCard`, !!checked)
              }
            />
            <Label htmlFor={`professionalCard-${proponentIndex}`}>Entrega copia de tarjeta profesional</Label>
          </div>
        </CardContent>
      </Card>

      {proponent.requirements.additionalSpecificExperience &&
        proponent.requirements.additionalSpecificExperience.map((exp, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{exp.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Monto requerido: {exp.amount}</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`additionalSpecificExperience-${index}`}
                    checked={watchedValues.proponents?.[proponentIndex]?.requirements?.additionalSpecificExperience?.[index]?.complies}
                    onCheckedChange={(checked) =>
                      handleAdditionalExperienceChange(index, 'complies', !!checked)
                    }
                  />
                  <Label htmlFor={`additionalSpecificExperience-${index}`}>Cumple</Label>
                </div>
                {watchedValues.proponents?.[proponentIndex]?.requirements?.additionalSpecificExperience?.[index]?.complies === false && (
                  <>
                    <Label>Comentario:</Label>
                    <Textarea
                      placeholder="Indique por qué no cumple"
                      value={watchedValues.proponents?.[proponentIndex]?.requirements?.additionalSpecificExperience?.[index]?.comment || ''}
                      onChange={(e) => handleAdditionalExperienceChange(index, 'comment', e.target.value)}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

      {proponent.contractors &&
        proponent.contractors.map((contractor, contractorIndex) => (
          <Card key={contractorIndex}>
            <CardHeader>
              <CardTitle>Contratista: {contractor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Códigos de servicios del contrato</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentCodes = watch(`proponents.${proponentIndex}.contractors.${contractorIndex}.matchingCodes`) || [];
                            setValue(`proponents.${proponentIndex}.contractors.${contractorIndex}.matchingCodes`, [...currentCodes, '']);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar código
                        </Button>
                      </div>
                      {contractor.matchingCodes && contractor.matchingCodes.map((code, codeIndex) => (
                        <div key={codeIndex} className="flex items-center space-x-2">
                          <Input
                            {...register(`proponents.${proponentIndex}.contractors.${contractorIndex}.matchingCodes.${codeIndex}`)}
                            placeholder="Código de servicio"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentCodes = watch(`proponents.${proponentIndex}.contractors.${contractorIndex}.matchingCodes`) || [];
                              const newCodes = [...currentCodes];
                              newCodes.splice(codeIndex, 1);
                              setValue(`proponents.${proponentIndex}.contractors.${contractorIndex}.matchingCodes`, newCodes);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  
            </CardContent>
          </Card>
        ))}
    </div>
  );
};
