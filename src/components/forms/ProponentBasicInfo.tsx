
import React from 'react';
import { Control, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ProponentFormData } from '@/types/forms';

interface ProponentBasicInfoProps {
  register: UseFormRegister<ProponentFormData>;
  watch: UseFormWatch<ProponentFormData>;
  setValue: (field: keyof ProponentFormData, value: any) => void;
  errors: FieldErrors<ProponentFormData>;
}

export const ProponentBasicInfo: React.FC<ProponentBasicInfoProps> = ({
  register,
  watch,
  setValue,
  errors
}) => {
  const watchedValues = watch();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del proponente *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nombre es requerido' })}
          placeholder="Nombre completo del proponente"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPlural"
          checked={watchedValues.isPlural}
          onCheckedChange={(checked) => setValue('isPlural', !!checked)}
        />
        <Label htmlFor="isPlural">¿Es proponente plural? (Consorcio/Unión Temporal)</Label>
      </div>
    </div>
  );
};
