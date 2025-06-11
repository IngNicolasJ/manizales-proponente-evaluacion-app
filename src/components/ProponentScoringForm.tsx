
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, User, AlertTriangle } from 'lucide-react';
import { ProponentBasicInfo } from '@/components/forms/ProponentBasicInfo';
import { PartnersSection } from '@/components/forms/PartnersSection';
import { RupSection } from '@/components/forms/RupSection';
import { ScoringSection } from '@/components/forms/ScoringSection';
import { Proponent } from '@/types';
import { ProponentFormData } from '@/types/forms';

export const ProponentScoringForm: React.FC = () => {
  const { processData, addProponent, setCurrentStep } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<ProponentFormData>({
    defaultValues: {
      name: '',
      isPlural: false,
      partners: [],
      rupRenewalDate: '',
      scoring: {
        womanEntrepreneurship: 0,
        mipyme: 0,
        disabled: 0,
        qualityFactor: 0,
        environmentalQuality: 0,
        nationalIndustrySupport: 0,
        comments: {}
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'partners'
  });

  const watchedValues = watch();

  if (!processData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuración requerida</h3>
          <p className="text-muted-foreground mb-4">
            Debe completar los datos de entrada antes de evaluar proponentes.
          </p>
          <Button onClick={() => setCurrentStep(1)}>Ir a datos de entrada</Button>
        </div>
      </div>
    );
  }

  const checkRupCompliance = (rupDate: string): boolean => {
    if (!rupDate || !processData) return false;
    const closingDate = new Date(processData.closingDate);
    const renewalDate = new Date(rupDate);
    const timeDiff = Math.abs(renewalDate.getTime() - closingDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30;
  };

  const onSubmit = (data: ProponentFormData) => {
    let rupComplies = false;
    
    if (data.isPlural) {
      rupComplies = data.partners.every(partner => checkRupCompliance(partner.rupRenewalDate));
    } else {
      rupComplies = checkRupCompliance(data.rupRenewalDate);
    }

    const totalScore = 
      data.scoring.womanEntrepreneurship +
      data.scoring.mipyme +
      data.scoring.disabled +
      data.scoring.qualityFactor +
      data.scoring.environmentalQuality +
      data.scoring.nationalIndustrySupport;

    // Inicializar additionalSpecificExperience como array basado en los criterios del processData
    const additionalSpecificExperience = processData.experience.additionalSpecific.map(criterion => ({
      name: criterion.name,
      amount: 0,
      complies: false,
      comment: undefined
    }));

    const newProponent: Proponent = {
      id: uuidv4(),
      name: data.name,
      isPlural: data.isPlural,
      partners: data.isPlural ? data.partners.map(partner => ({
        name: partner.name || '',
        percentage: partner.percentage || 0
      })) : undefined,
      rup: {
        renewalDate: data.rupRenewalDate,
        complies: rupComplies
      },
      scoring: data.scoring,
      requirements: {
        generalExperience: false,
        specificExperience: false,
        professionalCard: false,
        additionalSpecificExperience
      },
      contractors: [],
      totalScore,
      needsSubsanation: false
    };

    addProponent(newProponent);
    reset();
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Puntaje</h2>
            <p className="text-muted-foreground">Evalúe y puntúe a los proponentes</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(3)}
          >
            Verificar requisitos
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar proponente
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo proponente</CardTitle>
            <CardDescription>Complete la información del proponente</CardDescription>
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
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar proponente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Agregar proponentes</h3>
          <p className="text-muted-foreground mb-4">
            Comience agregando proponentes para evaluar en este proceso
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar primer proponente
          </Button>
        </div>
      )}
    </div>
  );
};
