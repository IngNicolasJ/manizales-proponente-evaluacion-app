
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScoringSelect } from '@/components/ScoringSelect';
import { ProponentFormData } from '@/types/forms';
import { ProcessData, Proponent } from '@/types';
import { useExperienceCalculation } from '@/hooks/useExperienceCalculation';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
  const { getPartnerExperiencePercentage, canPartnerReceiveDisabilityScore } = useExperienceCalculation(currentProponent);

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
    
    // Para proponentes plurales, validar el porcentaje de experiencia
    const canAssignScore = !isPlural || (selectedContributor && canPartnerReceiveDisabilityScore(selectedContributor));
    const requiresComment = currentValue === 0;

    const customOptions = maxValue > 0 ? [0, maxValue] : [0];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="disabled">Discapacitado</Label>
          
          {isPlural && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">¿Qué socio aporta el certificado de discapacidad?</Label>
                <Select
                  value={selectedContributor || ''}
                  onValueChange={(value) => {
                    setValue('scoring.disabilityContributor', value);
                    // Si el socio no cumple el 40%, resetear puntaje a 0
                    if (!canPartnerReceiveDisabilityScore(value)) {
                      setValue('scoring.disabled', 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar socio" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedValues.partners?.filter(partner => partner.name && partner.name.trim() !== '').map((partner) => (
                      <SelectItem key={partner.name} value={partner.name}>
                        {partner.name} ({getPartnerExperiencePercentage(partner.name).toFixed(1)}% experiencia)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContributor && (
                <Alert className={canAssignScore ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center space-x-2">
                    {canAssignScore ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={canAssignScore ? "text-green-800" : "text-red-800"}>
                      {canAssignScore ? (
                        `${selectedContributor} aporta ${getPartnerExperiencePercentage(selectedContributor).toFixed(1)}% de la experiencia (≥40% requerido). Puede recibir puntaje.`
                      ) : (
                        `${selectedContributor} aporta ${getPartnerExperiencePercentage(selectedContributor).toFixed(1)}% de la experiencia. Requiere ≥40% para recibir puntaje.`
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )}

          <ScoringSelect
            value={currentValue}
            onChange={(value) => {
              // Solo permitir puntaje > 0 si cumple condiciones
              if (value > 0 && !canAssignScore) {
                return; // No permitir asignación
              }
              setValue('scoring.disabled', value);
            }}
            maxValue={maxValue}
            customOptions={customOptions}
            placeholder="Seleccionar puntaje"
            disabled={!canAssignScore && currentValue === 0}
          />
          
          <p className="text-xs text-muted-foreground">
            Opciones: 0 o {maxValue}
            {isPlural && !selectedContributor && (
              <span className="text-red-600 block">
                * Debe seleccionar el socio que aporta el certificado
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

  return (
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
            `Opciones: 0 o ${processData.scoring.womanEntrepreneurship}`
          )}
          {renderScoringField(
            'mipyme',
            'MIPYME',
            processData.scoring.mipyme,
            `Opciones: 0 o ${processData.scoring.mipyme}`
          )}
          {renderScoringField(
            'disabled',
            'Discapacitado',
            processData.scoring.disabled,
            `Opciones: 0 o ${processData.scoring.disabled}`
          )}
          {renderScoringField(
            'qualityFactor',
            'Factor de calidad',
            processData.scoring.qualityFactor,
            `Opciones: 0 o ${processData.scoring.qualityFactor}`
          )}
          {renderScoringField(
            'environmentalQuality',
            'Factor de calidad ambiental',
            processData.scoring.environmentalQuality,
            `Opciones: 0 o ${processData.scoring.environmentalQuality}`
          )}
          {renderScoringField(
            'nationalIndustrySupport',
            'Apoyo a la industria nacional',
            processData.scoring.nationalIndustrySupport,
            `Opciones: 0 o ${processData.scoring.nationalIndustrySupport}`
          )}
        </div>
      </CardContent>
    </Card>
  );
};
