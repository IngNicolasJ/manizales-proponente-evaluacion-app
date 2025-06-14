
import React from 'react';
import { UseFormRegister, Control, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

// Define a type that includes classifierCodes
interface ProcessDataWithClassifierCodes {
  experience: {
    classifierCodes: string[];
    additionalSpecific?: Array<{
      name: string;
      value: number;
      unit: 'longitud' | 'area_cubierta' | 'area_ejecutada' | 'smlmv';
    }>;
  };
}

interface ClassifierCodesSectionProps {
  register: UseFormRegister<ProcessDataWithClassifierCodes>;
  control: Control<ProcessDataWithClassifierCodes>;
}

export const ClassifierCodesSection: React.FC<ClassifierCodesSectionProps> = ({
  register,
  control
}) => {
  const { 
    fields: classifierFields, 
    append: appendClassifier, 
    remove: removeClassifier 
  } = useFieldArray({
    control,
    name: 'experience.classifierCodes'
  });

  const addClassifierCode = () => {
    appendClassifier('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Códigos clasificadores</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addClassifierCode}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar código
        </Button>
      </div>
      
      {classifierFields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <Input
            {...register(`experience.classifierCodes.${index}` as const)}
            placeholder="ej: 72121501"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeClassifier(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      {classifierFields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay códigos clasificadores. Haga clic en "Agregar código" para añadir uno.
        </p>
      )}
    </div>
  );
};
