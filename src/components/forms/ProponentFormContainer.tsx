
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { ProponentBasicInfo } from '@/components/forms/ProponentBasicInfo';
import { PartnersSection } from '@/components/forms/PartnersSection';
import { RupSection } from '@/components/forms/RupSection';
import { ScoringSection } from '@/components/forms/ScoringSection';
import { ProponentFormData } from '@/types/forms';
import { ProcessData, Proponent } from '@/types';

interface ProponentFormContainerProps {
  editingProponent: string | null;
  processData: ProcessData;
  checkRupCompliance: (rupDate: string) => boolean;
  onSubmit: (data: ProponentFormData) => void;
  onCancel: () => void;
  initialValues?: Partial<ProponentFormData>;
  proponents: Proponent[];
}

export const ProponentFormContainer: React.FC<ProponentFormContainerProps> = ({
  editingProponent,
  processData,
  checkRupCompliance,
  onSubmit,
  onCancel,
  initialValues,
  proponents
}) => {
  // Encontrar el proponente actual
  const currentProponent = editingProponent 
    ? proponents.find(p => p.id === editingProponent) 
    : null;

  // Preparar valores iniciales basados en el proponente existente
  const getInitialValues = (): ProponentFormData => {
    if (currentProponent) {
      console.log('🔄 Loading existing proponent data:', currentProponent.name);
      console.log('🔍 Partners data:', currentProponent.partners);
      return {
        number: currentProponent.number || '',
        name: currentProponent.name,
        isPlural: currentProponent.isPlural,
        partners: currentProponent.partners?.map(partner => ({
          name: partner.name,
          percentage: partner.percentage,
          rupRenewalDate: partner.rupRenewalDate || ''
        })) || [],
        rupRenewalDate: currentProponent.rup?.renewalDate || '',
        scoring: {
          womanEntrepreneurship: currentProponent.scoring?.womanEntrepreneurship || 0,
          mipyme: currentProponent.scoring?.mipyme || 0,
          disabled: currentProponent.scoring?.disabled || 0,
          qualityFactor: currentProponent.scoring?.qualityFactor || 0,
          environmentalQuality: currentProponent.scoring?.environmentalQuality || 0,
          nationalIndustrySupport: currentProponent.scoring?.nationalIndustrySupport || 0,
          disabilityContributor: currentProponent.scoring?.disabilityContributor || undefined,
          comments: currentProponent.scoring?.comments || {}
        }
      };
    }
    
    return {
      number: initialValues?.number || '',
      name: initialValues?.name || '',
      isPlural: initialValues?.isPlural || false,
      partners: initialValues?.partners || [],
      rupRenewalDate: initialValues?.rupRenewalDate || '',
      scoring: initialValues?.scoring || {
        womanEntrepreneurship: 0,
        mipyme: 0,
        disabled: 0,
        qualityFactor: 0,
        environmentalQuality: 0,
        nationalIndustrySupport: 0,
        disabilityContributor: undefined,
        comments: {}
      }
    };
  };

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<ProponentFormData>({
    defaultValues: getInitialValues()
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'partners'
  });

  const watchedValues = watch();

  // Resetear el formulario cuando cambie el proponente a editar
  useEffect(() => {
    const newValues = getInitialValues();
    console.log('🔄 Resetting form with values:', newValues);
    console.log('🔍 Partners in reset:', newValues.partners);
    reset(newValues);
  }, [editingProponent, currentProponent?.id]); // Solo usar el ID del proponente como dependencia

  // Separar el efecto para sincronizar useFieldArray 
  useEffect(() => {
    if (currentProponent?.partners && currentProponent.partners.length > 0) {
      // Solo sincronizar si hay cambios reales en los partners
      if (fields.length !== currentProponent.partners.length) {
        // Limpiar fields existentes
        while (fields.length > 0) {
          remove(0);
        }
        // Agregar los partners uno por uno
        currentProponent.partners.forEach(partner => {
          append({
            name: partner.name,
            percentage: partner.percentage,
            rupRenewalDate: partner.rupRenewalDate || ''
          });
        });
      }
    } else if (fields.length > 0) {
      // Si no hay partners pero hay fields, limpiarlos
      while (fields.length > 0) {
        remove(0);
      }
    }
  }, [currentProponent?.id, currentProponent?.partners?.length, append, remove]); // Dependencias más específicas

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {editingProponent ? 'Editar proponente' : 'Nuevo proponente'}
        </CardTitle>
        <CardDescription>
          {editingProponent ? 'Modifique los datos del proponente' : 'Complete la información del proponente'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ProponentBasicInfo
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          {watchedValues.isPlural && (
            <PartnersSection
              register={register}
              watch={watch}
              fields={fields}
              append={append}
              remove={remove}
              processData={processData}
              checkRupCompliance={checkRupCompliance}
            />
          )}

          {!watchedValues.isPlural && (
            <RupSection
              register={register}
              watch={watch}
              errors={errors}
              processData={processData}
              checkRupCompliance={checkRupCompliance}
            />
          )}

          <ScoringSection
            watch={watch}
            setValue={setValue}
            processData={processData}
            currentProponent={currentProponent}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingProponent ? 'Actualizar proponente' : 'Guardar proponente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
