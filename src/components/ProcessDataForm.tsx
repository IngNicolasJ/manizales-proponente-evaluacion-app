import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, FileText } from 'lucide-react';
import { ProcessData } from '@/types';

const processSchema = z.object({
  processNumber: z.string().min(1, 'Número del proceso es requerido'),
  processObject: z.string().min(1, 'Objeto del proceso es requerido'),
  closingDate: z.string().min(1, 'Fecha de cierre es requerida'),
  totalContractValue: z.number().min(0, 'Valor debe ser mayor a 0'),
  minimumSalary: z.number().min(0, 'Salario mínimo debe ser mayor a 0'),
  processType: z.enum(['licitacion', 'concurso', 'abreviada', 'minima']),
  womanEntrepreneurship: z.number().min(0).max(0.25),
  mipyme: z.number().min(0).max(0.25),
  disabled: z.number().min(0).max(1),
  qualityFactor: z.number().min(0).max(20),
  environmentalQuality: z.number().min(0).max(10),
  nationalIndustrySupport: z.number().min(0).max(20),
  generalExperience: z.string().min(1, 'Experiencia general es requerida'),
  specificExperience: z.string().min(1, 'Experiencia específica es requerida'),
  additionalSpecificValue: z.number().min(0),
  additionalSpecificUnit: z.enum(['longitud', 'area_cubierta', 'area_ejecutada'])
});

type ProcessFormData = z.infer<typeof processSchema>;

export const ProcessDataForm: React.FC = () => {
  const { setProcessData, setCurrentStep, processData } = useAppStore();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: processData ? {
      processNumber: processData.processNumber,
      processObject: processData.processObject,
      closingDate: processData.closingDate,
      totalContractValue: processData.totalContractValue,
      minimumSalary: processData.minimumSalary,
      processType: processData.processType,
      womanEntrepreneurship: processData.scoring.womanEntrepreneurship,
      mipyme: processData.scoring.mipyme,
      disabled: processData.scoring.disabled,
      qualityFactor: processData.scoring.qualityFactor,
      environmentalQuality: processData.scoring.environmentalQuality,
      nationalIndustrySupport: processData.scoring.nationalIndustrySupport,
      generalExperience: processData.experience.general,
      specificExperience: processData.experience.specific,
      additionalSpecificValue: processData.experience.additionalSpecific.value,
      additionalSpecificUnit: processData.experience.additionalSpecific.unit
    } : {
      womanEntrepreneurship: 0,
      mipyme: 0,
      disabled: 0,
      qualityFactor: 0,
      environmentalQuality: 0,
      nationalIndustrySupport: 0,
      generalExperience: '',
      specificExperience: '',
      additionalSpecificValue: 0,
      additionalSpecificUnit: 'longitud' as const
    }
  });

  const onSubmit = (data: ProcessFormData) => {
    const processData: ProcessData = {
      processNumber: data.processNumber,
      processObject: data.processObject,
      closingDate: data.closingDate,
      totalContractValue: data.totalContractValue,
      minimumSalary: data.minimumSalary,
      processType: data.processType,
      scoring: {
        womanEntrepreneurship: data.womanEntrepreneurship,
        mipyme: data.mipyme,
        disabled: data.disabled,
        qualityFactor: data.qualityFactor,
        environmentalQuality: data.environmentalQuality,
        nationalIndustrySupport: data.nationalIndustrySupport
      },
      experience: {
        general: data.generalExperience,
        specific: data.specificExperience,
        additionalSpecific: {
          value: data.additionalSpecificValue,
          unit: data.additionalSpecificUnit
        }
      }
    };

    setProcessData(processData);
    setCurrentStep(2);
  };

  const processTypeOptions = [
    { value: 'licitacion', label: 'Licitación pública' },
    { value: 'concurso', label: 'Concurso de méritos' },
    { value: 'abreviada', label: 'Selección abreviada' },
    { value: 'minima', label: 'Mínima cuantía' }
  ];

  const unitOptions = [
    { value: 'longitud', label: 'Longitud' },
    { value: 'area_cubierta', label: 'Área de cubierta medida en planta' },
    { value: 'area_ejecutada', label: 'Área ejecutada' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Datos de entrada</h2>
          <p className="text-muted-foreground">Configure los parámetros del proceso de selección</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Información general del proceso */}
        <Card>
          <CardHeader>
            <CardTitle>Información general del proceso</CardTitle>
            <CardDescription>Datos básicos del proceso de selección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processNumber">Número del proceso *</Label>
                <Input
                  id="processNumber"
                  {...register('processNumber')}
                  placeholder="Ej: LP-001-2024"
                />
                {errors.processNumber && (
                  <p className="text-sm text-destructive">{errors.processNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Fecha de cierre del proceso *</Label>
                <Input
                  id="closingDate"
                  type="date"
                  {...register('closingDate')}
                />
                {errors.closingDate && (
                  <p className="text-sm text-destructive">{errors.closingDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processObject">Objeto del proceso *</Label>
              <Input
                id="processObject"
                {...register('processObject')}
                placeholder="Descripción del objeto del proceso"
              />
              {errors.processObject && (
                <p className="text-sm text-destructive">{errors.processObject.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalContractValue">Valor total del contrato *</Label>
                <Input
                  id="totalContractValue"
                  type="number"
                  step="0.01"
                  {...register('totalContractValue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.totalContractValue && (
                  <p className="text-sm text-destructive">{errors.totalContractValue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumSalary">Valor del salario mínimo actual *</Label>
                <Input
                  id="minimumSalary"
                  type="number"
                  step="0.01"
                  {...register('minimumSalary', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.minimumSalary && (
                  <p className="text-sm text-destructive">{errors.minimumSalary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="processType">Tipo de proceso *</Label>
                <Select onValueChange={(value) => setValue('processType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {processTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.processType && (
                  <p className="text-sm text-destructive">{errors.processType.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Puntajes por criterios */}
        <Card>
          <CardHeader>
            <CardTitle>Puntajes por criterios</CardTitle>
            <CardDescription>Configure los puntajes máximos para cada criterio de evaluación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="womanEntrepreneurship">Emprendimiento mujer (0 - 0.25)</Label>
                <Input
                  id="womanEntrepreneurship"
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.25"
                  {...register('womanEntrepreneurship', { valueAsNumber: true })}
                />
                {errors.womanEntrepreneurship && (
                  <p className="text-sm text-destructive">{errors.womanEntrepreneurship.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mipyme">MIPYME (0 - 0.25)</Label>
                <Input
                  id="mipyme"
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.25"
                  {...register('mipyme', { valueAsNumber: true })}
                />
                {errors.mipyme && (
                  <p className="text-sm text-destructive">{errors.mipyme.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled">Discapacitado (0 - 1)</Label>
                <Input
                  id="disabled"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register('disabled', { valueAsNumber: true })}
                />
                {errors.disabled && (
                  <p className="text-sm text-destructive">{errors.disabled.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityFactor">Factor de calidad (0, 10, 19 o 20)</Label>
                <Input
                  id="qualityFactor"
                  type="number"
                  min="0"
                  max="20"
                  {...register('qualityFactor', { valueAsNumber: true })}
                />
                {errors.qualityFactor && (
                  <p className="text-sm text-destructive">{errors.qualityFactor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalQuality">Factor de calidad ambiental (0 - 10)</Label>
                <Input
                  id="environmentalQuality"
                  type="number"
                  min="0"
                  max="10"
                  {...register('environmentalQuality', { valueAsNumber: true })}
                />
                {errors.environmentalQuality && (
                  <p className="text-sm text-destructive">{errors.environmentalQuality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalIndustrySupport">Apoyo a la industria nacional (0 - 20)</Label>
                <Input
                  id="nationalIndustrySupport"
                  type="number"
                  min="0"
                  max="20"
                  {...register('nationalIndustrySupport', { valueAsNumber: true })}
                />
                {errors.nationalIndustrySupport && (
                  <p className="text-sm text-destructive">{errors.nationalIndustrySupport.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiencia del proceso */}
        <Card>
          <CardHeader>
            <CardTitle>Experiencia del proceso</CardTitle>
            <CardDescription>Configure los requisitos de experiencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generalExperience">Experiencia general *</Label>
                <Input
                  id="generalExperience"
                  {...register('generalExperience')}
                  placeholder="Descripción de la experiencia general requerida"
                />
                {errors.generalExperience && (
                  <p className="text-sm text-destructive">{errors.generalExperience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specificExperience">Experiencia específica *</Label>
                <Input
                  id="specificExperience"
                  {...register('specificExperience')}
                  placeholder="Descripción de la experiencia específica requerida"
                />
                {errors.specificExperience && (
                  <p className="text-sm text-destructive">{errors.specificExperience.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Experiencia específica adicional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="additionalSpecificValue">Valor requerido</Label>
                  <Input
                    id="additionalSpecificValue"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('additionalSpecificValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.additionalSpecificValue && (
                    <p className="text-sm text-destructive">{errors.additionalSpecificValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalSpecificUnit">Unidad de medida</Label>
                  <Select onValueChange={(value) => setValue('additionalSpecificUnit', value as any)}>
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
                  {errors.additionalSpecificUnit && (
                    <p className="text-sm text-destructive">{errors.additionalSpecificUnit.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <span>Continuar a evaluación de proponentes</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
