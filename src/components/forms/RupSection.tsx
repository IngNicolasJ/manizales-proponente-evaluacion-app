
import React from 'react';
import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProponentFormData } from '@/types/forms';
import { ProcessData } from '@/types';

interface RupSectionProps {
  register: UseFormRegister<ProponentFormData>;
  watch: UseFormWatch<ProponentFormData>;
  errors: FieldErrors<ProponentFormData>;
  processData: ProcessData;
  checkRupCompliance: (rupDate: string) => boolean;
}

export const RupSection: React.FC<RupSectionProps> = ({
  register,
  watch,
  errors,
  processData,
  checkRupCompliance
}) => {
  const watchedValues = watch();

  return (
    <div className="space-y-2">
      <Label htmlFor="rupRenewalDate">Fecha de renovación del RUP *</Label>
      <Input
        id="rupRenewalDate"
        type="date"
        {...register('rupRenewalDate', { required: 'Fecha de renovación es requerida' })}
      />
      {errors.rupRenewalDate && (
        <p className="text-sm text-destructive">{errors.rupRenewalDate.message}</p>
      )}
      {watchedValues.rupRenewalDate && processData && (
        <div className="flex items-center space-x-2">
          {(() => {
            const closingDate = new Date(processData.closingDate);
            const rupDate = new Date(watchedValues.rupRenewalDate);
            const timeDiff = Math.abs(rupDate.getTime() - closingDate.getTime());
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const complies = daysDiff <= 30;
            
            return complies ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Cumple
              </Badge>
            ) : (
              <Badge variant="destructive">
                No cumple (más de 30 días)
              </Badge>
            );
          })()}
        </div>
      )}
    </div>
  );
};
