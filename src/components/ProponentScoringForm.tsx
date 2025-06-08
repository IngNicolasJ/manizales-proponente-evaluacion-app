
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, User, AlertTriangle } from 'lucide-react';
import { Proponent } from '@/types';

interface ProponentFormData {
  name: string;
  isPlural: boolean;
  partners: Array<{
    name: string;
    percentage: number;
  }>;
  rupRenewalDate: string;
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
    comments: Record<string, string>;
  };
}

export const ProponentScoringForm: React.FC = () => {
  const { processData, addProponent, setCurrentStep } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<ProponentFormData>({
    defaultValues: {
      name: '',
      isPlural: false,
      partners: [],
      rupRenewalDate: '',
      scoring: {
        womanEntrepreneurship: 0,
        mipyme: 0,
        disabled: 0,
        qualityFactor: 0,
        environmentalQuality: 0,
        nationalIndustrySupport: 0,
        comments: {}
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'partners'
  });

  const watchedValues = watch();

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

  const onSubmit = (data: ProponentFormData) => {
    const closingDate = new Date(processData.closingDate);
    const rupDate = new Date(data.rupRenewalDate);
    const timeDiff = Math.abs(rupDate.getTime() - closingDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const rupComplies = daysDiff <= 30;

    const totalScore = 
      data.scoring.womanEntrepreneurship +
      data.scoring.mipyme +
      data.scoring.disabled +
      data.scoring.qualityFactor +
      data.scoring.environmentalQuality +
      data.scoring.nationalIndustrySupport;

    const newProponent: Proponent = {
      id: uuidv4(),
      name: data.name,
      isPlural: data.isPlural,
      partners: data.isPlural ? data.partners.map(partner => ({
        name: partner.name || '',
        percentage: partner.percentage || 0
      })) : undefined,
      rup: {
        renewalDate: data.rupRenewalDate,
        complies: rupComplies
      },
      scoring: data.scoring,
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
      totalScore,
      needsSubsanation: false
    };

    addProponent(newProponent);
    reset();
    setShowForm(false);
  };

  const addPartner = () => {
    append({ name: '', percentage: 0 });
  };

  const getScoringComment = (criterionKey: string): string => {
    return watchedValues.scoring?.comments?.[criterionKey] || '';
  };

  const setScoringComment = (criterionKey: string, comment: string) => {
    setValue(`scoring.comments.${criterionKey}`, comment);
  };

  const renderScoringField = (
    key: keyof ProponentFormData['scoring'],
    label: string,
    maxValue: number,
    description?: string
  ) => {
    if (key === 'comments') return null;
    
    const currentValue = watchedValues.scoring?.[key] || 0;
    const requiresComment = currentValue === 0;

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          type="number"
          step="0.01"
          min="0"
          max={maxValue}
          {...register(`scoring.${key}`, { valueAsNumber: true })}
        />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {requiresComment && (
          <div className="space-y-2">
            <Label className="text-destructive text-xs">
              Comentario obligatorio (puntaje 0) *
            </Label>
            <Textarea
              value={getScoringComment(key)}
              onChange={(e) => setScoringComment(key, e.target.value)}
              placeholder="Explique por qué asigna 0 puntos"
              className="text-sm"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Puntaje</h2>
            <p className="text-muted-foreground">Evalúe y puntúe a los proponentes</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(3)}
          >
            Verificar requisitos
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar proponente
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo proponente</CardTitle>
            <CardDescription>Complete la información del proponente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Información básica */}
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

                {watchedValues.isPlural && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Socios del proponente plural</span>
                        <Button type="button" variant="outline" size="sm" onClick={addPartner}>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar socio
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {fields.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No hay socios registrados. Haga clic en "Agregar socio" para comenzar.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end space-x-4 p-4 border rounded-lg">
                              <div className="flex-1 space-y-2">
                                <Label>Nombre del socio</Label>
                                <Input
                                  {...register(`partners.${index}.name`)}
                                  placeholder="Nombre completo"
                                />
                              </div>
                              <div className="w-32 space-y-2">
                                <Label>% Participación</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  {...register(`partners.${index}.percentage`, { valueAsNumber: true })}
                                  placeholder="0.00"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

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
              </div>

              {/* Puntajes por criterios */}
              <Card>
                <CardHeader>
                  <CardTitle>Puntajes por criterios</CardTitle>
                  <CardDescription>Asigne los puntajes según el desempeño del proponente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderScoringField(
                      'womanEntrepreneurship',
                      'Emprendimiento mujer',
                      processData.scoring.womanEntrepreneurship,
                      `Máximo: ${processData.scoring.womanEntrepreneurship}`
                    )}
                    {renderScoringField(
                      'mipyme',
                      'MIPYME',
                      processData.scoring.mipyme,
                      `Máximo: ${processData.scoring.mipyme}`
                    )}
                    {renderScoringField(
                      'disabled',
                      'Discapacitado',
                      processData.scoring.disabled,
                      `Máximo: ${processData.scoring.disabled}`
                    )}
                    {renderScoringField(
                      'qualityFactor',
                      'Factor de calidad',
                      processData.scoring.qualityFactor,
                      `Máximo: ${processData.scoring.qualityFactor}`
                    )}
                    {renderScoringField(
                      'environmentalQuality',
                      'Factor de calidad ambiental',
                      processData.scoring.environmentalQuality,
                      `Máximo: ${processData.scoring.environmentalQuality}`
                    )}
                    {renderScoringField(
                      'nationalIndustrySupport',
                      'Apoyo a la industria nacional',
                      processData.scoring.nationalIndustrySupport,
                      `Máximo: ${processData.scoring.nationalIndustrySupport}`
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar proponente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Agregar proponentes</h3>
          <p className="text-muted-foreground mb-4">
            Comience agregando proponentes para evaluar en este proceso
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar primer proponente
          </Button>
        </div>
      )}
    </div>
  );
};
