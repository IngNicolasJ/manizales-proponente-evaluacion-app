
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Proponent } from '@/types';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { RequirementsFormData } from '@/types/forms';

interface RequirementsFormProps {
  proponentIndex: number;
  register: UseFormRegister<RequirementsFormData>;
  watch: UseFormWatch<RequirementsFormData>;
  setValue: UseFormSetValue<RequirementsFormData>;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  proponentIndex,
  register,
  watch,
  setValue
}) => {
  const proponents = useAppStore((state) => state.proponents);
  const updateProponent = useAppStore((state) => state.updateProponent);
  const proponent = proponents[proponentIndex];

  if (!proponent) {
    return <p>Proponente no encontrado</p>;
  }

  const watchedValues = watch();

  const handleCheckboxChange = (field: string, value: boolean) => {
    const updatedProponent = { ...proponent };
    if (field === 'requirements.generalExperience') {
      updatedProponent.requirements.generalExperience = value;
    } else if (field === 'requirements.specificExperience') {
      updatedProponent.requirements.specificExperience = value;
    } else if (field === 'requirements.professionalCard') {
      updatedProponent.requirements.professionalCard = value;
    }
    updateProponent(proponentIndex, updatedProponent);
  };

  const handleAdditionalExperienceChange = (index: number, field: string, value: any) => {
    const updatedProponent = { ...proponent };
    if (!updatedProponent.requirements.additionalSpecificExperience[index]) {
      updatedProponent.requirements.additionalSpecificExperience[index] = {
        name: '',
        amount: 0,
        complies: false
      };
    }
    
    if (field === 'complies') {
      updatedProponent.requirements.additionalSpecificExperience[index].complies = value;
    } else if (field === 'comment') {
      updatedProponent.requirements.additionalSpecificExperience[index].comment = value;
    }
    
    updateProponent(proponentIndex, updatedProponent);
  };

  const handleContractorCodeChange = (contractorIndex: number, codeIndex: number, value: string) => {
    const updatedProponent = { ...proponent };
    if (!updatedProponent.contractors[contractorIndex].matchingCodes) {
      updatedProponent.contractors[contractorIndex].matchingCodes = [];
    }
    updatedProponent.contractors[contractorIndex].matchingCodes[codeIndex] = value;
    updateProponent(proponentIndex, updatedProponent);
  };

  const addContractorCode = (contractorIndex: number) => {
    const updatedProponent = { ...proponent };
    if (!updatedProponent.contractors[contractorIndex].matchingCodes) {
      updatedProponent.contractors[contractorIndex].matchingCodes = [];
    }
    updatedProponent.contractors[contractorIndex].matchingCodes.push('');
    updateProponent(proponentIndex, updatedProponent);
  };

  const removeContractorCode = (contractorIndex: number, codeIndex: number) => {
    const updatedProponent = { ...proponent };
    updatedProponent.contractors[contractorIndex].matchingCodes.splice(codeIndex, 1);
    updateProponent(proponentIndex, updatedProponent);
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
              checked={proponent.requirements.generalExperience}
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
              checked={proponent.requirements.specificExperience}
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
              checked={proponent.requirements.professionalCard}
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
                    checked={exp.complies}
                    onCheckedChange={(checked) =>
                      handleAdditionalExperienceChange(index, 'complies', !!checked)
                    }
                  />
                  <Label htmlFor={`additionalSpecificExperience-${index}`}>Cumple</Label>
                </div>
                {exp.complies === false && (
                  <>
                    <Label>Comentario:</Label>
                    <Textarea
                      placeholder="Indique por qué no cumple"
                      value={exp.comment || ''}
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
                    onClick={() => addContractorCode(contractorIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar código
                  </Button>
                </div>
                {contractor.matchingCodes && contractor.matchingCodes.map((code, codeIndex) => (
                  <div key={codeIndex} className="flex items-center space-x-2">
                    <Input
                      value={code}
                      onChange={(e) => handleContractorCodeChange(contractorIndex, codeIndex, e.target.value)}
                      placeholder="Código de servicio"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeContractorCode(contractorIndex, codeIndex)}
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
