
import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ExperienceRequirementsSectionProps {
  register: UseFormRegister<ProcessData>;
  control: Control<ProcessData>;
  errors: FieldErrors<ProcessData>;
  watchedValues: ProcessData;
  setValue: UseFormSetValue<ProcessData>;
}

export const ExperienceRequirementsSection: React.FC<ExperienceRequirementsSectionProps> = ({
  register,
  control,
  errors,
  watchedValues,
  setValue
}) => {
  // useFieldArray for additionalSpecific (objects)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience.additionalSpecific'
  });

  // useFieldArray for classifierCodes (strings)
  const { fields: classifierFields, append: appendClassifier, remove: removeClassifier } = useFieldArray({
    control,
    name: 'experience.classifierCodes'
  });

  const addAdditionalCriteria = () => {
    if (fields.length < 5) {
      append({
        name: `Criterio ${fields.length + 1}`,
        value: 0,
        unit: 'longitud'
      });
    }
  };

  const addClassifierCode = () => {
    appendClassifier('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos de experiencia</CardTitle>
        <CardDescription>Configure los requisitos de experiencia del proceso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Códigos clasificadores</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addClassifierCode}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar código
            </Button>
          </div>
          
          {classifierFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Input
                {...register(`experience.classifierCodes.${index}` as const)}
                placeholder="ej: 72121501"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeClassifier(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {classifierFields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay códigos clasificadores. Haga clic en "Agregar código" para añadir uno.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Experiencia específica adicional</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAdditionalCriteria}
              disabled={fields.length >= 5}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar criterio
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Criterio {index + 1}</h5>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
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
      </CardContent>
    </Card>
  );
};
