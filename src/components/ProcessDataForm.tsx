
import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { FileText, ArrowRight } from 'lucide-react';
import { ScoringSelect } from '@/components/ScoringSelect';
import { ProcessData } from '@/types';

const processTypeOptions = [
  { value: 'licitacion', label: 'Licitación Pública' },
  { value: 'concurso', label: 'Concurso de Méritos' },
  { value: 'abreviada', label: 'Selección Abreviada' },
  { value: 'minima', label: 'Mínima Cuantía' }
];

const unitOptions = [
  { value: 'longitud', label: 'Longitud (metros)' },
  { value: 'area_cubierta', label: 'Área cubierta (m²)' },
  { value: 'area_ejecutada', label: 'Área ejecutada (m²)' }
];

export const ProcessDataForm: React.FC = () => {
  const { setProcessData, setCurrentStep } = useAppStore();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProcessData>({
    defaultValues: {
      processNumber: '',
      processObject: '',
      closingDate: '',
      totalContractValue: 0,
      minimumSalary: 0,
      processType: 'licitacion',
      scoring: {
        womanEntrepreneurship: 0,
        mipyme: 0,
        disabled: 0,
        qualityFactor: 0,
        environmentalQuality: 0,
        nationalIndustrySupport: 0,
      },
      experience: {
        general: '',
        specific: '',
        additionalSpecific: {
          value: 0,
          unit: 'longitud'
        }
      }
    }
  });

  const watchedValues = watch();

  const onSubmit = (data: ProcessData) => {
    setProcessData(data);
    setCurrentStep(2);
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
        {/* Process Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del proceso</CardTitle>
            <CardDescription>Datos básicos del proceso de contratación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processNumber">Número del proceso *</Label>
                <Input
                  id="processNumber"
                  {...register('processNumber', { required: 'Número del proceso es requerido' })}
                  placeholder="ej: LP-001-2024"
                />
                {errors.processNumber && (
                  <p className="text-sm text-destructive">{errors.processNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Fecha de cierre *</Label>
                <Input
                  id="closingDate"
                  type="date"
                  {...register('closingDate', { required: 'Fecha de cierre es requerida' })}
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
                {...register('processObject', { required: 'Objeto del proceso es requerido' })}
                placeholder="Descripción del objeto a contratar"
              />
              {errors.processObject && (
                <p className="text-sm text-destructive">{errors.processObject.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalContractValue">Valor total del contrato (SMMLV) *</Label>
                <Input
                  id="totalContractValue"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('totalContractValue', { 
                    required: 'Valor total es requerido',
                    valueAsNumber: true 
                  })}
                  placeholder="0.00"
                />
                {errors.totalContractValue && (
                  <p className="text-sm text-destructive">{errors.totalContractValue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumSalary">Salario mínimo vigente *</Label>
                <Input
                  id="minimumSalary"
                  type="number"
                  min="0"
                  {...register('minimumSalary', { 
                    required: 'Salario mínimo es requerido',
                    valueAsNumber: true 
                  })}
                  placeholder="1300000"
                />
                {errors.minimumSalary && (
                  <p className="text-sm text-destructive">{errors.minimumSalary.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipo de proceso *</Label>
              <RadioGroup 
                value={watchedValues.processType} 
                onValueChange={(value) => setValue('processType', value as any)}
              >
                {processTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Puntajes por criterios</CardTitle>
            <CardDescription>Configure los puntajes máximos para cada criterio de evaluación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="womanEntrepreneurship">Emprendimiento mujer</Label>
                <ScoringSelect
                  value={watchedValues.scoring.womanEntrepreneurship}
                  onChange={(value) => setValue('scoring.womanEntrepreneurship', value)}
                  maxValue={0.25}
                  customOptions={[0, 0.25]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0 o 0.25</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mipyme">MIPYME</Label>
                <ScoringSelect
                  value={watchedValues.scoring.mipyme}
                  onChange={(value) => setValue('scoring.mipyme', value)}
                  maxValue={0.25}
                  customOptions={[0, 0.25]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0 o 0.25</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled">Discapacitado *</Label>
                <ScoringSelect
                  value={watchedValues.scoring.disabled}
                  onChange={(value) => setValue('scoring.disabled', value)}
                  maxValue={1}
                  customOptions={[0, 1]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0 o 1</p>
                {errors.scoring?.disabled && (
                  <p className="text-sm text-destructive">{errors.scoring.disabled.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityFactor">Factor de calidad *</Label>
                <ScoringSelect
                  value={watchedValues.scoring.qualityFactor}
                  onChange={(value) => setValue('scoring.qualityFactor', value)}
                  maxValue={20}
                  customOptions={[0, 10, 19, 20]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0, 10, 19 o 20</p>
                {errors.scoring?.qualityFactor && (
                  <p className="text-sm text-destructive">{errors.scoring.qualityFactor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="environmentalQuality">Factor de calidad ambiental *</Label>
                <ScoringSelect
                  value={watchedValues.scoring.environmentalQuality}
                  onChange={(value) => setValue('scoring.environmentalQuality', value)}
                  maxValue={20}
                  customOptions={[0, 10, 20]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0, 10 o 20</p>
                {errors.scoring?.environmentalQuality && (
                  <p className="text-sm text-destructive">{errors.scoring.environmentalQuality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalIndustrySupport">Apoyo a la industria nacional *</Label>
                <ScoringSelect
                  value={watchedValues.scoring.nationalIndustrySupport}
                  onChange={(value) => setValue('scoring.nationalIndustrySupport', value)}
                  maxValue={20}
                  customOptions={[0, 10, 20]}
                  placeholder="Seleccionar puntaje"
                />
                <p className="text-xs text-muted-foreground">Opciones: 0, 10 o 20</p>
                {errors.scoring?.nationalIndustrySupport && (
                  <p className="text-sm text-destructive">{errors.scoring.nationalIndustrySupport.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Experience Requirements */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="additionalSpecificValue">Experiencia específica adicional (valor) *</Label>
                <Input
                  id="additionalSpecificValue"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('experience.additionalSpecific.value', { 
                    required: 'Valor de experiencia específica adicional es requerido',
                    valueAsNumber: true 
                  })}
                  placeholder="0.00"
                />
                {errors.experience?.additionalSpecific?.value && (
                  <p className="text-sm text-destructive">{errors.experience.additionalSpecific.value.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Unidad de medida *</Label>
                <RadioGroup 
                  value={watchedValues.experience?.additionalSpecific?.unit || 'longitud'} 
                  onValueChange={(value) => setValue('experience.additionalSpecific.unit', value as any)}
                >
                  {unitOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`unit-${option.value}`} />
                      <Label htmlFor={`unit-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <span>Continuar a evaluación</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
