
import React from 'react';
import { UseFormRegister, Control, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ProcessData } from '@/types';

const unitOptions = [
  { value: 'longitud', label: 'Longitud (metros)' },
  { value: 'area_cubierta', label: 'Área cubierta (m²)' },
  { value: 'area_ejecutada', label: 'Área ejecutada (m²)' },
  { value: 'smlmv', label: 'SMLMV' }
];

interface AdditionalSpecificSectionProps {
  register: UseFormRegister<ProcessData>;
  control: Control<ProcessData>;
  watchedValues: ProcessData;
  setValue: UseFormSetValue<ProcessData>;
}

export const AdditionalSpecificSection: React.FC<AdditionalSpecificSectionProps> = ({
  register,
  control,
  watchedValues,
  setValue
}) => {
  const { 
    fields: additionalFields, 
    append: appendAdditional, 
    remove: removeAdditional 
  } = useFieldArray({
    control,
    name: 'experience.additionalSpecific'
  });

  const addAdditionalCriteria = () => {
    if (additionalFields.length < 5) {
      appendAdditional({
        name: `Criterio ${additionalFields.length + 1}`,
        value: 0,
        unit: 'longitud'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Experiencia específica adicional</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAdditionalCriteria}
          disabled={additionalFields.length >= 5}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar criterio
        </Button>
      </div>
      
      {additionalFields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Criterio {index + 1}</h5>
            {additionalFields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAdditional(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nombre del criterio *</Label>
              <Input
                {...register(`experience.additionalSpecific.${index}.name`, { 
                  required: 'Nombre del criterio es requerido' 
                })}
                placeholder="ej: Longitud en vías"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor requerido *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register(`experience.additionalSpecific.${index}.value`, { 
                  required: 'Valor es requerido',
                  valueAsNumber: true 
                })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Unidad de medida *</Label>
              <Select 
                value={watchedValues.experience?.additionalSpecific?.[index]?.unit || 'longitud'}
                onValueChange={(value) => setValue(`experience.additionalSpecific.${index}.unit`, value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
