
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoringSelect } from '@/components/ScoringSelect';
import { ProponentFormData } from '@/types/forms';
import { ProcessData } from '@/types';

interface ScoringSectionProps {
  watch: UseFormWatch<ProponentFormData>;
  setValue: UseFormSetValue<ProponentFormData>;
  processData: ProcessData;
}

export const ScoringSection: React.FC<ScoringSectionProps> = ({
  watch,
  setValue,
  processData
}) => {
  const watchedValues = watch();

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

    // Generate options: always include 0, and the configured max value if it's greater than 0
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
