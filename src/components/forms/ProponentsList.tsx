
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import { Proponent } from '@/types';

interface ProponentsListProps {
  proponents: Proponent[];
  onEditProponent: (proponent: Proponent) => void;
}

export const ProponentsList: React.FC<ProponentsListProps> = ({
  proponents,
  onEditProponent
}) => {
  if (proponents.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Proponentes registrados</CardTitle>
        <CardDescription>
          Revise y modifique los puntajes de los proponentes existentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proponents.map((proponent) => (
            <div key={proponent.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{proponent.name}</h4>
                <div className="text-sm text-muted-foreground">
                  Puntaje total: <span className="font-semibold">{proponent.totalScore.toFixed(2)}</span>
                  {proponent.isPlural && (
                    <span className="ml-2">• Proponente plural ({proponent.partners?.length || 0} socios)</span>
                  )}
                </div>
                <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                  <span>Mujer: {proponent.scoring.womanEntrepreneurship}</span>
                  <span>MIPYME: {proponent.scoring.mipyme}</span>
                  <span>Discapacitado: {proponent.scoring.disabled}</span>
                  <span>Calidad: {proponent.scoring.qualityFactor}</span>
                  <span>Ambiental: {proponent.scoring.environmentalQuality}</span>
                  <span>Nacional: {proponent.scoring.nationalIndustrySupport}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditProponent(proponent)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar puntajes
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
