
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoringSelect } from '@/components/ScoringSelect';
import { ProponentFormData } from '@/types/forms';
import { ProcessData, Proponent } from '@/types';

interface ScoringSectionProps {
  watch: UseFormWatch<ProponentFormData>;
  setValue: UseFormSetValue<ProponentFormData>;
  processData: ProcessData;
  currentProponent?: Proponent | null;
}

export const ScoringSection: React.FC<ScoringSectionProps> = ({
  watch,
  setValue,
  processData,
  currentProponent
}) => {
  const watchedValues = watch();

  const getScoringComment = (criterionKey: string): string => {
    return watchedValues.scoring?.comments?.[criterionKey] || '';
  };

  const setScoringComment = (criterionKey: string, comment: string) => {
    setValue(`scoring.comments.${criterionKey}`, comment);
  };

  const renderDisabledField = () => {
    const currentValue = watchedValues.scoring?.disabled || 0;
    const maxValue = processData.scoring.disabled;
    const isPlural = watchedValues.isPlural;
    const selectedContributor = watchedValues.scoring?.disabilityContributor;
    
    // Si el valor máximo es 0, no mostrar este criterio
    if (maxValue === 0) return null;
    
    const requiresComment = currentValue === 0;
    const customOptions = maxValue > 0 ? [0, maxValue] : [0];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="disabled">Discapacitado</Label>
          
          {isPlural && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">¿Qué socio aporta el certificado de discapacidad? (Opcional)</Label>
                <Select
                  value={selectedContributor || ''}
                  onValueChange={(value) => setValue('scoring.disabilityContributor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar socio (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedValues.partners?.filter(partner => partner.name && partner.name.trim() !== '').map((partner) => (
                      <SelectItem key={partner.name} value={partner.name}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <ScoringSelect
            value={currentValue}
            onChange={(value) => setValue('scoring.disabled', value)}
            maxValue={maxValue}
            customOptions={customOptions}
            placeholder="Seleccionar puntaje"
          />
          
          <p className="text-xs text-muted-foreground">
            Opciones: 0 o {maxValue}
            {isPlural && (
              <span className="text-blue-600 block">
                * La validación del 40% de experiencia se verificará en los requisitos habilitantes
              </span>
            )}
          </p>
          
          {requiresComment && (
            <div className="space-y-2">
              <Label className="text-destructive text-xs">
                Comentario obligatorio (puntaje 0) *
              </Label>
              <Textarea
                value={getScoringComment('disabled')}
                onChange={(e) => setScoringComment('disabled', e.target.value)}
                placeholder="Explique por qué asigna 0 puntos"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderScoringField = (
    key: keyof ProponentFormData['scoring'],
    label: string,
    maxValue: number,
    description?: string
  ) => {
    if (key === 'comments' || key === 'disabilityContributor') return null;
    
    // Si el valor máximo es 0, no mostrar este criterio
    if (maxValue === 0) return null;
    
    // Usar el campo especializado para discapacidad
    if (key === 'disabled') {
      return renderDisabledField();
    }
    
    const currentValue = watchedValues.scoring?.[key] || 0;
    const requiresComment = currentValue === 0;

    const customOptions = maxValue > 0 ? [0, maxValue] : [0];

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <ScoringSelect
          value={currentValue}
          onChange={(value) => setValue(`scoring.${key}`, value)}
          maxValue={maxValue}
          customOptions={customOptions}
          placeholder="Seleccionar puntaje"
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

  // Filtrar criterios con valor máximo mayor a 0
  const availableCriteria = [
    { key: 'womanEntrepreneurship' as const, label: 'Emprendimiento mujer', maxValue: processData.scoring.womanEntrepreneurship },
    { key: 'mipyme' as const, label: 'MIPYME', maxValue: processData.scoring.mipyme },
    { key: 'disabled' as const, label: 'Discapacitado', maxValue: processData.scoring.disabled },
    { key: 'qualityFactor' as const, label: 'Factor de calidad', maxValue: processData.scoring.qualityFactor },
    { key: 'environmentalQuality' as const, label: 'Factor de calidad ambiental', maxValue: processData.scoring.environmentalQuality },
    { key: 'nationalIndustrySupport' as const, label: 'Apoyo a la industria nacional', maxValue: processData.scoring.nationalIndustrySupport }
  ].filter(criterion => criterion.maxValue > 0);

  // Si no hay criterios disponibles, mostrar mensaje
  if (availableCriteria.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puntajes por criterios</CardTitle>
          <CardDescription>No hay criterios de puntaje configurados para este proceso</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Todos los criterios de puntaje tienen valor 0. No hay puntajes que asignar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Puntajes por criterios</CardTitle>
        <CardDescription>Asigne los puntajes según el desempeño del proponente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableCriteria.map(criterion => 
            renderScoringField(
              criterion.key,
              criterion.label,
              criterion.maxValue,
              `Opciones: 0 o ${criterion.maxValue}`
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};
