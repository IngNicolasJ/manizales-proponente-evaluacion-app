
import React from 'react';
import { UseFormRegister, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ProcessData } from '@/types';

interface ClassifierCodesSectionProps {
  register: UseFormRegister<ProcessData>;
  control: Control<ProcessData>;
  watch: UseFormWatch<ProcessData>;
  setValue: UseFormSetValue<ProcessData>;
}

export const ClassifierCodesSection: React.FC<ClassifierCodesSectionProps> = ({
  watch,
  setValue
}) => {
  const watchedValues = watch();
  
  // Ensure classifierCodes is always an array
  const classifierCodes = watchedValues.experience?.classifierCodes || [];

  const addClassifierCode = () => {
    const newCodes = [...classifierCodes, ''];
    setValue('experience.classifierCodes', newCodes);
  };

  const removeClassifierCode = (index: number) => {
    const newCodes = classifierCodes.filter((_, i) => i !== index);
    setValue('experience.classifierCodes', newCodes);
  };

  const updateClassifierCode = (index: number, value: string) => {
    const newCodes = [...classifierCodes];
    newCodes[index] = value;
    setValue('experience.classifierCodes', newCodes);
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
      
      {classifierCodes.length > 0 && classifierCodes.map((code, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            value={code || ''}
            onChange={(e) => updateClassifierCode(index, e.target.value)}
            placeholder="ej: 72121501"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeClassifierCode(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      {classifierCodes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay códigos clasificadores. Haga clic en "Agregar código" para añadir uno.
        </p>
      )}
    </div>
  );
};
