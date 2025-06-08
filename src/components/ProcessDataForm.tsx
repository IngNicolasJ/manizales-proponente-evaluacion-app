import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Calculator } from 'lucide-react';
import { ProcessData } from '@/types';

interface ProcessFormData {
  processNumber: string;
  processObject: string;
  closingDate: string;
  totalContractValue: number;
  minimumSalary: number;
  processType: 'licitacion' | 'concurso' | 'abreviada' | 'minima';
  womanEntrepreneurship: number;
  mipyme: number;
  disabled: number;
  qualityFactor: number;
  environmentalQuality: number;
  nationalIndustrySupport: number;
  generalExperience: string;
  specificExperience: string;
  additionalSpecificValue: number;
  additionalSpecificUnit: 'longitud' | 'area_cubierta' | 'area_ejecutada';
}

export const ProcessDataForm: React.FC = () => {
  const { setProcessData, setCurrentStep, processData } = useAppStore();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProcessFormData>({
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
      processNumber: '',
      processObject: '',
      closingDate: '',
      totalContractValue: 0,
      minimumSalary: 0,
      processType: 'licitacion',
      womanEntrepreneurship: 0,
      mipyme: 0,
      disabled: 0,
      qualityFactor: 0,
      environmentalQuality: 0,
      nationalIndustrySupport: 0,
      generalExperience: '',
      specificExperience: '',
      additionalSpecificValue: 0,
      additionalSpecificUnit: 'area_ejecutada'
    }
  });

  const watchedValues = watch();

  const onSubmit = (data: ProcessFormData) => {
    const newProcessData: ProcessData = {
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

    setProcessData(newProcessData);
    setCurrentStep(2);
  };

  const getUnitLabel = (unit: string): string => {
    const labels = {
      'longitud': 'Longitud',
      'area_cubierta': 'Área de cubierta medida en planta',
      'area_ejecutada': 'Área ejecutada'
    };
    return labels[unit as keyof typeof labels] || unit;
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Datos de entrada</h2>
          <p className="text-muted-foreground">Configure los parámetros del proceso de selección</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="womanEntrepreneurship">Emprendimiento mujer (0 - 0.25)</Label>
                <Select
                  value={watchedValues.womanEntrepreneurship?.toString() || "0"}
                  onValueChange={(value) => setValue('womanEntrepreneurship', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar puntaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0.00</SelectItem>
                    <SelectItem value="0.25">0.25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mipyme">MIPYME (0 - 0.25)</Label>
                <Select
                  value={watchedValues.mipyme?.toString() || "0"}
                  onValueChange={(value) => setValue('mipyme', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar puntaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0.00</SelectItem>
                    <SelectItem value="0.25">0.25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled">Discapacitado</Label>
                <Input
                  id="disabled"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('disabled', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityFactor">Factor de calidad</Label>
                <Input
                  id="qualityFactor"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('qualityFactor', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalQuality">Factor de calidad ambiental</Label>
                <Input
                  id="environmentalQuality"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('environmentalQuality', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalIndustrySupport">Apoyo a la industria nacional</Label>
                <Input
                  id="nationalIndustrySupport"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('nationalIndustrySupport', { valueAsNumber: true })}
                />
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
