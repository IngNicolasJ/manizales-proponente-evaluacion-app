
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Proponent } from '@/types';

const proponentSchema = z.object({
  name: z.string().min(1, 'Nombre del proponente es requerido'),
  isPlural: z.boolean(),
  partners: z.array(z.object({
    name: z.string().min(1, 'Nombre del socio es requerido'),
    percentage: z.number().min(0).max(100, 'Porcentaje debe estar entre 0 y 100')
  })).optional(),
  rupRenewalDate: z.string().min(1, 'Fecha de renovación del RUP es requerida'),
  womanEntrepreneurship: z.number().min(0),
  mipyme: z.number().min(0),
  disabled: z.number().min(0),
  qualityFactor: z.number().min(0),
  environmentalQuality: z.number().min(0),
  nationalIndustrySupport: z.number().min(0),
  womanEntrepreneurshipComment: z.string().optional(),
  mipymeComment: z.string().optional(),
  disabledComment: z.string().optional(),
  qualityFactorComment: z.string().optional(),
  environmentalQualityComment: z.string().optional(),
  nationalIndustrySupportComment: z.string().optional()
});

type ProponentFormData = z.infer<typeof proponentSchema>;

export const ProponentScoringForm: React.FC = () => {
  const { processData, addProponent, setCurrentStep } = useAppStore();
  const [showPartners, setShowPartners] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, watch, setValue, reset } = useForm<ProponentFormData>({
    resolver: zodResolver(proponentSchema),
    defaultValues: {
      isPlural: false,
      partners: [{ name: '', percentage: 0 }],
      womanEntrepreneurship: 0,
      mipyme: 0,
      disabled: 0,
      qualityFactor: 0,
      environmentalQuality: 0,
      nationalIndustrySupport: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'partners'
  });

  const watchedValues = watch();
  const isPlural = watch('isPlural');

  if (!processData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuración requerida</h3>
          <p className="text-muted-foreground mb-4">
            Debe completar los datos de entrada antes de evaluar proponentes.
          </p>
          <Button onClick={() => setCurrentStep(1)}>Ir a datos de entrada</Button>
        </div>
      </div>
    );
  }

  const checkRupCompliance = (renewalDate: string): boolean => {
    if (!renewalDate || !processData.closingDate) return false;
    
    const renewal = new Date(renewalDate);
    const closing = new Date(processData.closingDate);
    const diffTime = Math.abs(renewal.getTime() - closing.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30;
  };

  const calculateTotalScore = (): number => {
    return (
      watchedValues.womanEntrepreneurship +
      watchedValues.mipyme +
      watchedValues.disabled +
      watchedValues.qualityFactor +
      watchedValues.environmentalQuality +
      watchedValues.nationalIndustrySupport
    );
  };

  const needsComment = (criteriaName: keyof typeof watchedValues, score: number): boolean => {
    return score === 0 && (processData.scoring[criteriaName as keyof typeof processData.scoring] > 0);
  };

  const onSubmit = (data: ProponentFormData) => {
    const rupComplies = checkRupCompliance(data.rupRenewalDate);
    
    const proponent: Proponent = {
      id: `proponent-${Date.now()}`,
      name: data.name,
      isPlural: data.isPlural,
      partners: data.isPlural ? data.partners : undefined,
      rup: {
        renewalDate: data.rupRenewalDate,
        complies: rupComplies
      },
      scoring: {
        womanEntrepreneurship: data.womanEntrepreneurship,
        mipyme: data.mipyme,
        disabled: data.disabled,
        qualityFactor: data.qualityFactor,
        environmentalQuality: data.environmentalQuality,
        nationalIndustrySupport: data.nationalIndustrySupport,
        comments: {
          womanEntrepreneurship: data.womanEntrepreneurshipComment || '',
          mipyme: data.mipymeComment || '',
          disabled: data.disabledComment || '',
          qualityFactor: data.qualityFactorComment || '',
          environmentalQuality: data.environmentalQualityComment || '',
          nationalIndustrySupport: data.nationalIndustrySupportComment || ''
        }
      },
      requirements: {
        generalExperience: false,
        specificExperience: false,
        professionalCard: false,
        additionalSpecificExperience: {
          amount: 0,
          complies: false
        }
      },
      contractors: [],
      totalScore: calculateTotalScore(),
      needsSubsanation: !rupComplies
    };

    addProponent(proponent);
    reset();
    setShowPartners(false);
  };

  const totalScore = calculateTotalScore();
  const maxScore = Object.values(processData.scoring).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Evaluación de proponentes</h2>
            <p className="text-muted-foreground">Asigne puntajes por criterio de evaluación</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-lg px-3 py-1">
            Puntaje: {totalScore.toFixed(2)} / {maxScore.toFixed(2)}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica del proponente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del proponente</CardTitle>
            <CardDescription>Datos básicos del proponente a evaluar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proponente *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre completo del proponente"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPlural"
                checked={isPlural}
                onCheckedChange={(checked) => {
                  setValue('isPlural', checked);
                  setShowPartners(checked);
                }}
              />
              <Label htmlFor="isPlural">¿Es proponente plural?</Label>
            </div>

            {isPlural && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Socios del consorcio/unión temporal</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', percentage: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar socio
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        {...register(`partners.${index}.name`)}
                        placeholder="Nombre del socio"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...register(`partners.${index}.percentage`, { valueAsNumber: true })}
                        placeholder="% participación"
                      />
                    </div>
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
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rupRenewalDate">Fecha de renovación del RUP *</Label>
              <Input
                id="rupRenewalDate"
                type="date"
                {...register('rupRenewalDate')}
              />
              {errors.rupRenewalDate && (
                <p className="text-sm text-destructive">{errors.rupRenewalDate.message}</p>
              )}
              {watchedValues.rupRenewalDate && (
                <div className="flex items-center space-x-2">
                  {checkRupCompliance(watchedValues.rupRenewalDate) ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">Cumple</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">No cumple - Excede 1 mes</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Puntajes por criterios */}
        <Card>
          <CardHeader>
            <CardTitle>Puntajes por criterios</CardTitle>
            <CardDescription>Asigne el puntaje obtenido por el proponente en cada criterio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emprendimiento mujer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="womanEntrepreneurship">Emprendimiento mujer</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.womanEntrepreneurship}
                </Badge>
              </div>
              <Input
                id="womanEntrepreneurship"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.womanEntrepreneurship}
                {...register('womanEntrepreneurship', { valueAsNumber: true })}
              />
              {needsComment('womanEntrepreneurship', watchedValues.womanEntrepreneurship) && (
                <div className="space-y-2">
                  <Label htmlFor="womanEntrepreneurshipComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="womanEntrepreneurshipComment"
                    {...register('womanEntrepreneurshipComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* MIPYME */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="mipyme">MIPYME</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.mipyme}
                </Badge>
              </div>
              <Input
                id="mipyme"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.mipyme}
                {...register('mipyme', { valueAsNumber: true })}
              />
              {needsComment('mipyme', watchedValues.mipyme) && (
                <div className="space-y-2">
                  <Label htmlFor="mipymeComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="mipymeComment"
                    {...register('mipymeComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Discapacitado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="disabled">Discapacitado</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.disabled}
                </Badge>
              </div>
              <Input
                id="disabled"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.disabled}
                {...register('disabled', { valueAsNumber: true })}
              />
              {needsComment('disabled', watchedValues.disabled) && (
                <div className="space-y-2">
                  <Label htmlFor="disabledComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="disabledComment"
                    {...register('disabledComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Factor de calidad */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="qualityFactor">Factor de calidad</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.qualityFactor}
                </Badge>
              </div>
              <Input
                id="qualityFactor"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.qualityFactor}
                {...register('qualityFactor', { valueAsNumber: true })}
              />
              {needsComment('qualityFactor', watchedValues.qualityFactor) && (
                <div className="space-y-2">
                  <Label htmlFor="qualityFactorComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="qualityFactorComment"
                    {...register('qualityFactorComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Factor de calidad ambiental */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="environmentalQuality">Factor de calidad ambiental</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.environmentalQuality}
                </Badge>
              </div>
              <Input
                id="environmentalQuality"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.environmentalQuality}
                {...register('environmentalQuality', { valueAsNumber: true })}
              />
              {needsComment('environmentalQuality', watchedValues.environmentalQuality) && (
                <div className="space-y-2">
                  <Label htmlFor="environmentalQualityComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="environmentalQualityComment"
                    {...register('environmentalQualityComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Apoyo a la industria nacional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="nationalIndustrySupport">Apoyo a la industria nacional</Label>
                <Badge variant="secondary">
                  Máximo: {processData.scoring.nationalIndustrySupport}
                </Badge>
              </div>
              <Input
                id="nationalIndustrySupport"
                type="number"
                step="0.01"
                min="0"
                max={processData.scoring.nationalIndustrySupport}
                {...register('nationalIndustrySupport', { valueAsNumber: true })}
              />
              {needsComment('nationalIndustrySupport', watchedValues.nationalIndustrySupport) && (
                <div className="space-y-2">
                  <Label htmlFor="nationalIndustrySupportComment" className="text-destructive">
                    Comentario obligatorio (puntaje 0) *
                  </Label>
                  <Textarea
                    id="nationalIndustrySupportComment"
                    {...register('nationalIndustrySupportComment')}
                    placeholder="Explique por qué el puntaje es 0"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(3)}
          >
            Continuar a requisitos habilitantes
          </Button>
          <Button type="submit">
            Guardar proponente
          </Button>
        </div>
      </form>
    </div>
  );
};
