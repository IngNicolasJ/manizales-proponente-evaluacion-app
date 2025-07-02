
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Proponent } from '@/types';

interface ProponentSelectorProps {
  proponents: Proponent[];
  selectedProponentId: string;
  onProponentSelect: (proponentId: string) => void;
}

export const ProponentSelector: React.FC<ProponentSelectorProps> = ({
  proponents,
  selectedProponentId,
  onProponentSelect
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Seleccionar proponente</CardTitle>
        <CardDescription>Elija el proponente para verificar sus requisitos habilitantes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {proponents.map((proponent) => (
            <Button
              key={proponent.id}
              variant={selectedProponentId === proponent.id ? "default" : "outline"}
              onClick={() => onProponentSelect(proponent.id)}
              className="h-auto p-4 text-left justify-start"
            >
              <div>
                <div className="font-medium">{proponent.number ? `${proponent.number}. ${proponent.name}` : proponent.name}</div>
                <div className="text-sm opacity-75">
                  Puntaje: {proponent.totalScore.toFixed(2)}
                </div>
                {proponent.needsSubsanation && (
                  <Badge variant="destructive" className="mt-1">
                    Necesita subsanación
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
