
import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessData } from '@/types';
import { BasicExperienceFields } from './BasicExperienceFields';
import { ClassifierCodesSection } from './ClassifierCodesSection';
import { AdditionalSpecificSection } from './AdditionalSpecificSection';

interface ExperienceRequirementsSectionProps {
  register: UseFormRegister<ProcessData>;
  control: Control<ProcessData>;
  errors: FieldErrors<ProcessData>;
  watchedValues: ProcessData;
  setValue: UseFormSetValue<ProcessData>;
  watch: UseFormWatch<ProcessData>;
}

export const ExperienceRequirementsSection: React.FC<ExperienceRequirementsSectionProps> = ({
  register,
  control,
  errors,
  watchedValues,
  setValue,
  watch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos de experiencia</CardTitle>
        <CardDescription>Configure los requisitos de experiencia del proceso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BasicExperienceFields register={register} errors={errors} />
        
        <ClassifierCodesSection 
          register={register} 
          control={control} 
          watch={watch}
          setValue={setValue}
        />

        <AdditionalSpecificSection 
          register={register} 
          control={control} 
          watchedValues={watchedValues} 
          setValue={setValue} 
        />
      </CardContent>
    </Card>
  );
};
