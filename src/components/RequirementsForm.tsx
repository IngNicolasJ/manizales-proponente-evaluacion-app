import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckSquare, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Contractor } from '@/types';

interface RequirementsFormData {
  proponentId: string;
  generalExperience: boolean;
  specificExperience: boolean;
  professionalCard: boolean;
  additionalSpecificAmount: number;
  additionalSpecificComment?: string;
  contractors: Contractor[];
}

export const RequirementsForm: React.FC = () => {
  const { proponents, updateProponent, processData, setCurrentStep } = useAppStore();
  const [selectedProponentId, setSelectedProponentId] = useState<string>('');

  const selectedProponent = proponents.find(p => p.id === selectedProponentId);

  const { register, handleSubmit, control, watch, setValue, reset } = useForm<RequirementsFormData>({
    defaultValues: {
      proponentId: '',
      generalExperience: false,
      specificExperience: false,
      professionalCard: false,
      additionalSpecificAmount: 0,
      contractors: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contractors'
  });

  const watchedValues = watch();

  // Calcular automáticamente la cantidad aportada basada en los contratos
  const calculateAdditionalSpecificAmount = () => {
    const total = watchedValues.contractors?.reduce((sum, contractor) => {
      return sum + (contractor.additionalSpecificExperienceContribution || 0);
    }, 0) || 0;
    
    setValue('additionalSpecificAmount', total);
  };

  useEffect(() => {
    calculateAdditionalSpecificAmount();
  }, [watchedValues.contractors]);

  if (!processData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuración requerida</h3>
          <p className="text-muted-foreground mb-4">
            Debe completar los datos de entrada antes de verificar requisitos.
          </p>
          <Button onClick={() => setCurrentStep(1)}>Ir a datos de entrada</Button>
        </div>
      </div>
    );
  }

  if (proponents.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin proponentes registrados</h3>
          <p className="text-muted-foreground mb-4">
            Debe registrar al menos un proponente antes de verificar requisitos.
          </p>
          <Button onClick={() => setCurrentStep(2)}>Ir a evaluación de proponentes</Button>
        </div>
      </div>
    );
  }

  const handleProponentSelect = (proponentId: string) => {
    setSelectedProponentId(proponentId);
    const proponent = proponents.find(p => p.id === proponentId);
    if (proponent) {
      reset({
        proponentId,
        generalExperience: proponent.requirements.generalExperience,
        specificExperience: proponent.requirements.specificExperience,
        professionalCard: proponent.requirements.professionalCard,
        additionalSpecificAmount: proponent.requirements.additionalSpecificExperience.amount,
        additionalSpecificComment: proponent.requirements.additionalSpecificExperience.comment,
        contractors: proponent.contractors
      });
    }
  };

  const checkAdditionalSpecificCompliance = (amount: number): boolean => {
    return amount >= processData.experience.additionalSpecific.value;
  };

  const calculateAdjustedValue = (index: number) => {
    const contractor = watchedValues.contractors?.[index];
    if (contractor) {
      const adjustedValue = (contractor.totalValueSMMLV || 0) * ((contractor.participationPercentage || 0) / 100);
      setValue(`contractors.${index}.adjustedValue`, adjustedValue);
    }
  };

  const getExperienceContributorOptions = () => {
    if (!selectedProponent) return [];
    
    if (selectedProponent.isPlural && selectedProponent.partners) {
      return selectedProponent.partners.map(partner => partner.name);
    } else {
      return [selectedProponent.name];
    }
  };

  const onSubmit = (data: RequirementsFormData) => {
    if (!selectedProponent) return;

    const additionalSpecificComplies = checkAdditionalSpecificCompliance(data.additionalSpecificAmount);
    const hasIncompleteContracts = data.contractors.some(contractor => 
      !contractor.contractingEntity || 
      !contractor.contractNumber || 
      !contractor.object ||
      !contractor.servicesCode
    );

    const needsSubsanation = 
      !data.generalExperience ||
      !data.specificExperience ||
      !data.professionalCard ||
      !additionalSpecificComplies ||
      hasIncompleteContracts ||
      !selectedProponent.rup.complies;

    updateProponent(selectedProponent.id, {
      requirements: {
        generalExperience: data.generalExperience,
        specificExperience: data.specificExperience,
        professionalCard: data.professionalCard,
        additionalSpecificExperience: {
          amount: data.additionalSpecificAmount,
          complies: additionalSpecificComplies,
          comment: data.additionalSpecificComment
        }
      },
      contractors: data.contractors,
      needsSubsanation
    });

    setSelectedProponentId('');
    reset();
  };

  const addContractor = () => {
    append({
      name: '',
      order: fields.length + 1,
      rupConsecutive: '',
      requiredExperience: 'general',
      contractingEntity: '',
      contractNumber: '',
      object: '',
      servicesCode: '',
      executionForm: 'I',
      participationPercentage: 100,
      experienceContributor: '',
      totalValueSMMLV: 0,
      adjustedValue: 0,
      additionalSpecificExperienceContribution: 0
    });
  };

  const getUnitLabel = (unit: string): string => {
    const labels = {
      'longitud': 'Longitud',
      'area_cubierta': 'Área de cubierta medida en planta',
      'area_ejecutada': 'Área ejecutada'
    };
    return labels[unit as keyof typeof labels] || unit;
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CheckSquare className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Requisitos habilitantes</h2>
          <p className="text-muted-foreground">Verifique el cumplimiento de requisitos por proponente</p>
        </div>
      </div>

      {/* Selector de proponente */}
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
                onClick={() => handleProponentSelect(proponent.id)}
                className="h-auto p-4 text-left justify-start"
              >
                <div>
                  <div className="font-medium">{proponent.name}</div>
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

      {selectedProponent && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Verificación de experiencia */}
          <Card>
            <CardHeader>
              <CardTitle>Verificación de experiencia</CardTitle>
              <CardDescription>Marque los requisitos que cumple el proponente {selectedProponent.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="generalExperience"
                      checked={watchedValues.generalExperience}
                      onCheckedChange={(checked) => setValue('generalExperience', !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="generalExperience" className="font-medium">
                        ¿Cumple experiencia general?
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {processData.experience.general}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="specificExperience"
                      checked={watchedValues.specificExperience}
                      onCheckedChange={(checked) => setValue('specificExperience', !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="specificExperience" className="font-medium">
                        ¿Cumple experiencia específica?
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {processData.experience.specific}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="professionalCard"
                      checked={watchedValues.professionalCard}
                      onCheckedChange={(checked) => setValue('professionalCard', !!checked)}
                    />
                    <Label htmlFor="professionalCard">
                      ¿Aporta tarjeta profesional del ingeniero?
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Experiencia específica adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="additionalSpecificAmount">
                      Cantidad aportada ({getUnitLabel(processData.experience.additionalSpecific.unit)})
                    </Label>
                    <Input
                      id="additionalSpecificAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={watchedValues.additionalSpecificAmount || 0}
                      readOnly
                      className="bg-muted"
                    />
                    <div className="text-sm text-muted-foreground">
                      Valor requerido: {processData.experience.additionalSpecific.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      * Calculado automáticamente desde los contratos aportados
                    </div>
                    {watchedValues.additionalSpecificAmount !== undefined && (
                      <div className="flex items-center space-x-2">
                        {checkAdditionalSpecificCompliance(watchedValues.additionalSpecificAmount) ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-sm text-success font-medium">Cumple</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive font-medium">SUBSANAR</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!checkAdditionalSpecificCompliance(watchedValues.additionalSpecificAmount || 0) && (
                    <div className="space-y-2">
                      <Label htmlFor="additionalSpecificComment" className="text-destructive">
                        Comentario obligatorio (no cumple) *
                      </Label>
                      <Textarea
                        id="additionalSpecificComment"
                        {...register('additionalSpecificComment')}
                        placeholder="Explique por qué no cumple el requisito"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contratos aportados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contratos aportados</span>
                <Button type="button" variant="outline" size="sm" onClick={addContractor}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar contrato
                </Button>
              </CardTitle>
              <CardDescription>Registre los contratos que aporta el proponente como experiencia</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay contratos registrados. Haga clic en "Agregar contrato" para comenzar.
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Contrato #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>No. de orden</Label>
                          <Input
                            type="number"
                            {...register(`contractors.${index}.order`, { valueAsNumber: true })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Consecutivo en RUP</Label>
                          <Input {...register(`contractors.${index}.rupConsecutive`)} />
                        </div>

                        <div className="space-y-2">
                          <Label>Experiencia requerida</Label>
                          <Select onValueChange={(value) => setValue(`contractors.${index}.requiredExperience`, value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="specific">Específica</SelectItem>
                              <SelectItem value="both">Ambas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Entidad contratante *</Label>
                          <Input {...register(`contractors.${index}.contractingEntity`)} />
                        </div>

                        <div className="space-y-2">
                          <Label>No. de contrato *</Label>
                          <Input {...register(`contractors.${index}.contractNumber`)} />
                        </div>

                        <div className="space-y-2">
                          <Label>Objeto *</Label>
                          <Input {...register(`contractors.${index}.object`)} />
                        </div>

                        <div className="space-y-2">
                          <Label>Código clasificador *</Label>
                          <Input {...register(`contractors.${index}.servicesCode`)} />
                        </div>

                        <div className="space-y-2">
                          <Label>Forma de ejecución</Label>
                          <Select onValueChange={(value) => setValue(`contractors.${index}.executionForm`, value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="I">Individual (I)</SelectItem>
                              <SelectItem value="C">Consorcio (C)</SelectItem>
                              <SelectItem value="UT">Unión Temporal (UT)</SelectItem>
                              <SelectItem value="OTRA">Otra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>% de participación</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register(`contractors.${index}.participationPercentage`, { 
                              valueAsNumber: true,
                              onChange: () => calculateAdjustedValue(index)
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Integrante que aporta experiencia</Label>
                          <Select onValueChange={(value) => setValue(`contractors.${index}.experienceContributor`, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {getExperienceContributorOptions().map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valor total en SMMLV</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`contractors.${index}.totalValueSMMLV`, { 
                              valueAsNumber: true,
                              onChange: () => calculateAdjustedValue(index)
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Valor ajustado por participación</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={watchedValues.contractors?.[index]?.adjustedValue || 0}
                            readOnly
                            className="bg-muted"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Aporte en experiencia específica adicional</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`contractors.${index}.additionalSpecificExperienceContribution`, { 
                              valueAsNumber: true 
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(4)}
            >
              Ver resumen de proponentes
            </Button>
            <Button type="submit">
              Guardar requisitos
            </Button>
          </div>
        </form>
      )}

      {!selectedProponent && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(4)}
          >
            Ver resumen de proponentes
          </Button>
        </div>
      )}
    </div>
  );
};
