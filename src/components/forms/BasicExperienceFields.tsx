
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProcessData } from '@/types';

interface BasicExperienceFieldsProps {
  register: UseFormRegister<ProcessData>;
  errors: FieldErrors<ProcessData>;
}

export const BasicExperienceFields: React.FC<BasicExperienceFieldsProps> = ({
  register,
  errors
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="generalExperience">Experiencia general *</Label>
        <Input
          id="generalExperience"
          {...register('experience.general', { required: 'Experiencia general es requerida' })}
          placeholder="Descripción de la experiencia general requerida"
        />
        {errors.experience?.general && (
          <p className="text-sm text-destructive">{errors.experience.general.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificExperience">Experiencia específica *</Label>
        <Input
          id="specificExperience"
          {...register('experience.specific', { required: 'Experiencia específica es requerida' })}
          placeholder="Descripción de la experiencia específica requerida"
        />
        {errors.experience?.specific && (
          <p className="text-sm text-destructive">{errors.experience.specific.message}</p>
        )}
      </div>
    </>
  );
};
