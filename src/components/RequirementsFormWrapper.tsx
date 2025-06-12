
import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { RequirementsForm } from './RequirementsForm';
import { RequirementsFormData } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const RequirementsFormWrapper: React.FC = () => {
  const { proponents, setCurrentStep } = useAppStore();
  const [currentProponentIndex, setCurrentProponentIndex] = React.useState(0);

  const { register, watch, setValue, handleSubmit } = useForm<RequirementsFormData>({
    defaultValues: {
      requirements: {
        generalExperience: false,
        specificExperience: false,
        professionalCard: false,
        additionalSpecificExperience: []
      },
      contractors: []
    }
  });

  const onSubmit = (data: RequirementsFormData) => {
    // Data is already saved in the store through the RequirementsForm component
    setCurrentStep(4);
  };

  if (proponents.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay proponentes registrados</h3>
          <p className="text-muted-foreground mb-4">
            Debe agregar al menos un proponente en el paso anterior.
          </p>
          <Button onClick={() => setCurrentStep(2)} variant="outline">
            Volver al paso anterior
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Requisitos habilitantes</h2>
          <p className="text-muted-foreground">Evalúe el cumplimiento de requisitos para cada proponente</p>
        </div>
      </div>

      {/* Proponent Selector */}
      {proponents.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seleccionar proponente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {proponents.map((proponent, index) => (
                <Button
                  key={proponent.id}
                  variant={currentProponentIndex === index ? 'default' : 'outline'}
                  onClick={() => setCurrentProponentIndex(index)}
                  size="sm"
                >
                  {proponent.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Evaluación de: {proponents[currentProponentIndex]?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RequirementsForm
              proponentIndex={currentProponentIndex}
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(2)}
          >
            Volver al paso anterior
          </Button>
          <Button type="submit">
            Continuar al resumen
          </Button>
        </div>
      </form>
    </div>
  );
};
