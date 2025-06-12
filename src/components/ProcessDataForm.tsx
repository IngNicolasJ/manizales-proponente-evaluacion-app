
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Trash2 } from 'lucide-react';

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
}

export const ProcessDataForm: React.FC = () => {
  const { processData, setProcessData, setCurrentStep } = useAppStore();
  
  const { register, handleSubmit, control, formState: { errors }, getValues, setValue } = useForm<ProcessDataFormData>({
    defaultValues: {
      processNumber: processData?.processNumber || '',
      processObject: processData?.processObject || '',
      closingDate: processData?.closingDate || '',
      totalContractValue: processData?.totalContractValue || 0,
      minimumSalary: processData?.minimumSalary || 0,
      processType: processData?.processType || 'licitacion',
      generalExperience: processData?.experience?.general || '',
      specificExperience: processData?.experience?.specific || '',
      classifierCodes: Array.isArray(processData?.experience?.classifierCodes) ? processData.experience.classifierCodes : [''],
      additionalSpecific: Array.isArray(processData?.experience?.additionalSpecific) ? processData.experience.additionalSpecific : []
    }
  });

  const {
    fields: classifierCodeFields,
    append: appendClassifierCode,
    remove: removeClassifierCode,
  } = useFieldArray({
    control,
    name: 'classifierCodes',
  });

  const { fields: additionalFields, append: appendAdditional, remove: removeAdditional } = useFieldArray({
    control,
    name: 'additionalSpecific'
  });

  const onSubmit = (data: ProcessDataFormData) => {
    const formattedData = {
      processNumber: data.processNumber,
      processObject: data.processObject,
      closingDate: data.closingDate,
      totalContractValue: data.totalContractValue,
      minimumSalary: data.minimumSalary,
      processType: data.processType,
      scoring: processData?.scoring || {
        womanEntrepreneurship: 0,
        mipyme: 0,
        disabled: 0,
        qualityFactor: 0,
        environmentalQuality: 0,
        nationalIndustrySupport: 0
      },
      experience: {
        general: data.generalExperience,
        specific: data.specificExperience,
        classifierCodes: data.classifierCodes.filter(code => code.trim() !== ''),
        additionalSpecific: data.additionalSpecific
      }
    };

    setProcessData(formattedData);
    setCurrentStep(2);
  };

  const addClassifierCode = () => {
    appendClassifierCode('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Datos del proceso</h2>
          <p className="text-muted-foreground">Ingrese la información básica del proceso de contratación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Process Data */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Datos generales del proceso de contratación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processNumber">Número de proceso</Label>
                <Input id="processNumber" {...register('processNumber', { required: true })} />
                {errors.processNumber && <p className="text-sm text-destructive">Campo requerido</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="processType">Tipo de proceso</Label>
                <Select 
                  defaultValue={processData?.processType || 'licitacion'}
                  onValueChange={(value) => setValue('processType', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licitacion">Licitación pública</SelectItem>
                    <SelectItem value="concurso">Concurso de méritos</SelectItem>
                    <SelectItem value="abreviada">Selección abreviada</SelectItem>
                    <SelectItem value="minima">Mínima cuantía</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Fecha de cierre</Label>
                <Input id="closingDate" type="date" {...register('closingDate', { required: true })} />
                {errors.closingDate && <p className="text-sm text-destructive">Campo requerido</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalContractValue">Valor total del contrato</Label>
                <Input 
                  id="totalContractValue" 
                  type="number" 
                  step="0.01"
                  min="0"
                  {...register('totalContractValue', { required: true, valueAsNumber: true })} 
                />
                {errors.totalContractValue && <p className="text-sm text-destructive">Campo requerido</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumSalary">Salario mínimo (SMMLV)</Label>
                <Input 
                  id="minimumSalary" 
                  type="number" 
                  step="0.01"
                  min="0"
                  {...register('minimumSalary', { required: true, valueAsNumber: true })} 
                />
                {errors.minimumSalary && <p className="text-sm text-destructive">Campo requerido</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processObject">Objeto del proceso</Label>
              <Textarea 
                id="processObject" 
                {...register('processObject', { required: true })} 
                className="min-h-[100px]"
              />
              {errors.processObject && <p className="text-sm text-destructive">Campo requerido</p>}
            </div>
          </CardContent>
        </Card>

        {/* Experience Requirements Section */}
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

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(0)}
          >
            Volver al inicio
          </Button>
          <Button type="submit">
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};
