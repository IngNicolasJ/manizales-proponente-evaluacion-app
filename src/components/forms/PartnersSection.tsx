
import React from 'react';
import { Control, UseFieldArrayReturn, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { ProponentFormData } from '@/types/forms';
import { ProcessData } from '@/types';

interface PartnersSectionProps {
  register: UseFormRegister<ProponentFormData>;
  watch: UseFormWatch<ProponentFormData>;
  fields: UseFieldArrayReturn<ProponentFormData, 'partners'>['fields'];
  append: UseFieldArrayReturn<ProponentFormData, 'partners'>['append'];
  remove: UseFieldArrayReturn<ProponentFormData, 'partners'>['remove'];
  processData: ProcessData;
  checkRupCompliance: (rupDate: string) => boolean;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  register,
  watch,
  fields,
  append,
  remove,
  processData,
  checkRupCompliance
}) => {
  const watchedValues = watch();

  const addPartner = () => {
    append({ name: '', percentage: 0, rupRenewalDate: '' });
  };

  return (
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
                <div className="w-40 space-y-2">
                  <Label>Fecha renovación RUP</Label>
                  <Input
                    type="date"
                    {...register(`partners.${index}.rupRenewalDate`)}
                  />
                  {watchedValues.partners?.[index]?.rupRenewalDate && processData && (
                    <div className="flex items-center space-x-2">
                      {checkRupCompliance(watchedValues.partners[index].rupRenewalDate) ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Cumple
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          No cumple
                        </Badge>
                      )}
                    </div>
                  )}
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
  );
};
