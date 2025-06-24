
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';

interface EmptyProponentsStateProps {
  onAddProponent: () => void;
}

export const EmptyProponentsState: React.FC<EmptyProponentsStateProps> = ({
  onAddProponent
}) => {
  return (
    <div className="text-center py-12">
      <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Agregar proponentes</h3>
      <p className="text-muted-foreground mb-4">
        Comience agregando proponentes para evaluar en este proceso
      </p>
      <Button onClick={onAddProponent}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar primer proponente
      </Button>
    </div>
  );
};
