import React from 'react';
import { UseFormRegister, Control, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProcessData, Proponent } from '@/types';
import { RequirementsFormData } from '@/types/forms';
import { ContractForm } from './ContractForm';

interface ContractsSectionProps {
  register: UseFormRegister<RequirementsFormData>;
  control: Control<RequirementsFormData>;
  watchedValues: RequirementsFormData;
  setValue: UseFormSetValue<RequirementsFormData>;
  processData: ProcessData;
  selectedProponent: Proponent;
}

export const ContractsSection: React.FC<ContractsSectionProps> = ({
  register,
  control,
  watchedValues,
  setValue,
  processData,
  selectedProponent
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contractors'
  });

  const addContractor = () => {
    const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];
    
    const initialAdditionalSpecific = additionalSpecific.map(criteria => ({
      name: criteria.name,
      value: 0
    }));

    const initialAdjustedAdditionalSpecific = additionalSpecific.map(criteria => ({
      name: criteria.name,
      value: 0
    }));

    append({
      name: '',
      rupConsecutive: '',
      requiredExperience: 'general',
      contractingEntity: '',
      contractNumber: '',
      object: '',
      servicesCode: '',
      executionForm: 'I',
      participationPercentage: 100,
      experienceContributor: '',
      totalValueSMMLV: 0,
      adjustedValue: 0,
      additionalSpecificExperienceContribution: initialAdditionalSpecific,
      adjustedAdditionalSpecificValue: initialAdjustedAdditionalSpecific,
      contractType: 'public',
      contractComplies: false,
      selectedClassifierCodes: [],
      classifierCodesMatch: false
    });
  };

  const calculateAdjustedValue = (index: number) => {
    const contractor = watchedValues.contractors?.[index];
    if (contractor) {
      const adjustedValue = (contractor.totalValueSMMLV || 0) * ((contractor.participationPercentage || 0) / 100);
      setValue(`contractors.${index}.adjustedValue`, adjustedValue);
    }
  };

  const calculateAdjustedAdditionalSpecificValues = (contractorIndex: number) => {
    const contractor = watchedValues.contractors?.[contractorIndex];
    const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];
    
    if (contractor && additionalSpecific.length > 0) {
      const adjustedValues = additionalSpecific.map((criteria, criteriaIndex) => {
        const contribution = contractor.additionalSpecificExperienceContribution?.[criteriaIndex]?.value || 0;
        const adjustedValue = contribution * ((contractor.participationPercentage || 0) / 100);
        return {
          name: criteria.name,
          value: adjustedValue
        };
      });
      setValue(`contractors.${contractorIndex}.adjustedAdditionalSpecificValue`, adjustedValues);
    }
  };

  const handleClassifierCodeChange = (contractorIndex: number, code: string, checked: boolean) => {
    const currentCodes = watchedValues.contractors?.[contractorIndex]?.selectedClassifierCodes || [];
    const newCodes = checked 
      ? [...currentCodes, code]
      : currentCodes.filter(c => c !== code);
    
    setValue(`contractors.${contractorIndex}.selectedClassifierCodes`, newCodes);
    
    // Check if at least one code matches
    const processClassifierCodes = processData?.experience.classifierCodes || [];
    const hasMatch = newCodes.some(code => processClassifierCodes.includes(code));
    setValue(`contractors.${contractorIndex}.classifierCodesMatch`, hasMatch);
  };

  const getExperienceContributorOptions = () => {
    if (!selectedProponent) return [];
    
    if (selectedProponent.isPlural && selectedProponent.partners) {
      return selectedProponent.partners.map(partner => partner.name);
    } else {
      return [selectedProponent.number ? `${selectedProponent.number}. ${selectedProponent.name}` : selectedProponent.name];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Contratos aportados</span>
          <Button type="button" variant="outline" size="sm" onClick={addContractor}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar contrato
          </Button>
        </CardTitle>
        <CardDescription>Registre los contratos que aporta el proponente como experiencia</CardDescription>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No hay contratos registrados.</p>
            <Button type="button" variant="outline" onClick={addContractor}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer contrato
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <ContractForm
                key={field.id}
                index={index}
                register={register}
                watchedValues={watchedValues}
                setValue={setValue}
                processData={processData}
                experienceContributorOptions={getExperienceContributorOptions()}
                onRemove={() => remove(index)}
                onCalculateAdjustedValue={() => calculateAdjustedValue(index)}
                onCalculateAdjustedAdditionalSpecificValues={() => calculateAdjustedAdditionalSpecificValues(index)}
                onClassifierCodeChange={(code, checked) => handleClassifierCodeChange(index, code, checked)}
              />
            ))}
            <div className="flex justify-center pt-4">
              <Button type="button" variant="outline" onClick={addContractor}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar otro contrato
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
