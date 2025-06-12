
import React from 'react';
import { Control, UseFormRegister, UseFormGetValues, UseFormSetValue, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';

interface ProcessDataFormData {
  processNumber: string;
  processObject: string;
  closingDate: string;
  totalContractValue: number;
  minimumSalary: number;
  processType: 'licitacion' | 'concurso' | 'abreviada' | 'minima';
  generalExperience: string;
  specificExperience: string;
  classifierCodes: string[];
  additionalSpecific: Array<{
    name: string;
    value: number;
    unit: 'longitud' | 'area_cubierta' | 'area_ejecutada' | 'smlmv';
  }>;
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
  };
}

interface ExperienceRequirementsSectionProps {
  register: UseFormRegister<ProcessDataFormData>;
  control: Control<ProcessDataFormData>;
  getValues: UseFormGetValues<ProcessDataFormData>;
  setValue: UseFormSetValue<ProcessDataFormData>;
  classifierCodeFields: FieldArrayWithId<ProcessDataFormData, "classifierCodes", "id">[];
  appendClassifierCode: UseFieldArrayAppend<ProcessDataFormData, "classifierCodes">;
  removeClassifierCode: UseFieldArrayRemove;
  additionalFields: FieldArrayWithId<ProcessDataFormData, "additionalSpecific", "id">[];
  appendAdditional: UseFieldArrayAppend<ProcessDataFormData, "additionalSpecific">;
  removeAdditional: UseFieldArrayRemove;
}

export const ExperienceRequirementsSection: React.FC<ExperienceRequirementsSectionProps> = ({
  register,
  getValues,
  setValue,
  classifierCodeFields,
  appendClassifierCode,
  removeClassifierCode,
  additionalFields,
  appendAdditional,
  removeAdditional
}) => {
  const addClassifierCode = () => {
    appendClassifierCode('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos de experiencia</CardTitle>
        <CardDescription>Configure los requisitos de experiencia del proceso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generalExperience">Experiencia general requerida</Label>
            <Textarea 
              id="generalExperience" 
              {...register('generalExperience')} 
              placeholder="Describa los requisitos de experiencia general"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificExperience">Experiencia específica requerida</Label>
            <Textarea 
              id="specificExperience" 
              {...register('specificExperience')} 
              placeholder="Describa los requisitos de experiencia específica"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <Separator />

        {/* Classifier Codes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Códigos clasificadores requeridos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addClassifierCode}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar código
            </Button>
          </div>
          
          {classifierCodeFields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay códigos clasificadores configurados
            </p>
          ) : (
            <div className="space-y-2">
              {classifierCodeFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Input
                    {...register(`classifierCodes.${index}` as const)}
                    placeholder="Código clasificador (ej: 72101600)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeClassifierCode(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Specific Experience Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Experiencia específica adicional</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAdditional({
                name: '',
                value: 0,
                unit: 'longitud'
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar criterio
            </Button>
          </div>

          {additionalFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Nombre del criterio</Label>
                <Input
                  {...register(`additionalSpecific.${index}.name`)}
                  placeholder="Ej: Longitud de vía"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Valor requerido</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`additionalSpecific.${index}.value`, { valueAsNumber: true })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select 
                  defaultValue={field.unit}
                  onValueChange={(value) => {
                    const currentValues = getValues();
                    currentValues.additionalSpecific[index].unit = value as any;
                    setValue('additionalSpecific', currentValues.additionalSpecific);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="longitud">Longitud</SelectItem>
                    <SelectItem value="area_cubierta">Área de cubierta</SelectItem>
                    <SelectItem value="area_ejecutada">Área ejecutada</SelectItem>
                    <SelectItem value="smlmv">SMLMV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAdditional(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
