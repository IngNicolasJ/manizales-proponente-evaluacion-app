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
  additionalSpecificAmounts: Array<{
    name: string;
    amount: number;
    comment?: string;
  }>;
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
      additionalSpecificAmounts: [],
      contractors: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contractors'
  });

  const watchedValues = watch();

  // Calcular automáticamente las cantidades aportadas basadas en los contratos
  const calculateAdditionalSpecificAmounts = () => {
    if (!processData?.experience.additionalSpecific || !Array.isArray(processData.experience.additionalSpecific)) return;

    const calculatedAmounts = processData.experience.additionalSpecific.map((criteria, criteriaIndex) => {
      const total = watchedValues.contractors?.reduce((sum, contractor) => {
        const contribution = contractor.additionalSpecificExperienceContribution?.[criteriaIndex];
        const adjustedValue = contractor.adjustedAdditionalSpecificValue?.[criteriaIndex];
        return sum + (adjustedValue?.value || 0);
      }, 0) || 0;

      return {
        name: criteria.name,
        amount: total,
        comment: watchedValues.additionalSpecificAmounts?.[criteriaIndex]?.comment || ''
      };
    });

    setValue('additionalSpecificAmounts', calculatedAmounts);
  };

  useEffect(() => {
    calculateAdditionalSpecificAmounts();
  }, [watchedValues.contractors, processData]);

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
    if (proponent && processData) {
      // Ensure additionalSpecific is an array before using it
      const additionalSpecific = Array.isArray(processData.experience.additionalSpecific) 
        ? processData.experience.additionalSpecific 
        : [];
      
      // Inicializar amounts basado en processData
      const initialAmounts = additionalSpecific.map((criteria, index) => ({
        name: criteria.name,
        amount: Array.isArray(proponent.requirements.additionalSpecificExperience) 
          ? proponent.requirements.additionalSpecificExperience[index]?.amount || 0
          : 0,
        comment: Array.isArray(proponent.requirements.additionalSpecificExperience)
          ? proponent.requirements.additionalSpecificExperience[index]?.comment || ''
          : ''
      }));

      reset({
        proponentId,
        generalExperience: proponent.requirements.generalExperience,
        specificExperience: proponent.requirements.specificExperience,
        professionalCard: proponent.requirements.professionalCard,
        additionalSpecificAmounts: initialAmounts,
        contractors: proponent.contractors
      });
    }
  };

  const checkAdditionalSpecificCompliance = (amount: number, requiredValue: number): boolean => {
    return amount >= requiredValue;
  };

  const calculateAdjustedValue = (index: number) => {
    const contractor = watchedValues.contractors?.[index];
    if (contractor) {
      const adjustedValue = (contractor.totalValueSMMLV || 0) * ((contractor.participationPercentage || 0) / 100);
      setValue(`contractors.${index}.adjustedValue`, adjustedValue);
    }
  };

  const calculateAdjustedAdditionalSpecificValues = (contractorIndex: number) => {
    const contractor = watchedValues.contractors?.[contractorIndex];
    const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];
    
    if (contractor && additionalSpecific.length > 0) {
      const adjustedValues = additionalSpecific.map((criteria, criteriaIndex) => {
        const contribution = contractor.additionalSpecificExperienceContribution?.[criteriaIndex]?.value || 0;
        const adjustedValue = contribution * ((contractor.participationPercentage || 0) / 100);
        return {
          name: criteria.name,
          value: adjustedValue
        };
      });
      setValue(`contractors.${contractorIndex}.adjustedAdditionalSpecificValue`, adjustedValues);
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
    if (!selectedProponent || !processData) return;

    const additionalSpecificResults = data.additionalSpecificAmounts.map((amount, index) => {
      const additionalSpecific = Array.isArray(processData.experience.additionalSpecific) 
        ? processData.experience.additionalSpecific 
        : [];
      const requiredValue = additionalSpecific[index]?.value || 0;
      return {
        name: amount.name,
        amount: amount.amount,
        complies: checkAdditionalSpecificCompliance(amount.amount, requiredValue),
        comment: amount.comment
      };
    });

    const hasIncompleteContracts = data.contractors.some(contractor => 
      !contractor.contractingEntity || 
      !contractor.contractNumber || 
      !contractor.object ||
      !contractor.servicesCode ||
      !contractor.contractComplies ||
      (contractor.contractType === 'private' && !contractor.privateDocumentsComplete)
    );

    const nonCompliantContracts = data.contractors.filter(contractor => !contractor.contractComplies);
    const nonCompliantAdditionalCriteria = additionalSpecificResults.filter(result => !result.complies);

    const needsSubsanation = 
      !data.generalExperience ||
      !data.specificExperience ||
      !data.professionalCard ||
      nonCompliantAdditionalCriteria.length > 0 ||
      hasIncompleteContracts ||
      !selectedProponent.rup.complies;

    // Crear detalles de subsanación
    const subsanationDetails: string[] = [];
    
    if (!data.generalExperience) subsanationDetails.push("No cumple experiencia general");
    if (!data.specificExperience) subsanationDetails.push("No cumple experiencia específica");
    if (!data.professionalCard) subsanationDetails.push("No aporta tarjeta profesional");
    if (!selectedProponent.rup.complies) subsanationDetails.push("RUP no vigente");
    
    nonCompliantAdditionalCriteria.forEach((criteria) => {
      subsanationDetails.push(`No cumple ${criteria.name}`);
    });
    
    nonCompliantContracts.forEach((contractor, index) => {
      if (contractor.nonComplianceReason) {
        subsanationDetails.push(`Contrato #${contractor.order}: ${contractor.nonComplianceReason}`);
      }
    });

    updateProponent(selectedProponent.id, {
      requirements: {
        generalExperience: data.generalExperience,
        specificExperience: data.specificExperience,
        professionalCard: data.professionalCard,
        additionalSpecificExperience: additionalSpecificResults
      },
      contractors: data.contractors,
      needsSubsanation,
      subsanationDetails: subsanationDetails.length > 0 ? subsanationDetails : undefined
    });

    setSelectedProponentId('');
    reset();
  };

  const addContractor = () => {
    const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];
    
    const initialAdditionalSpecific = additionalSpecific.map(criteria => ({
      name: criteria.name,
      value: 0
    }));

    const initialAdjustedAdditionalSpecific = additionalSpecific.map(criteria => ({
      name: criteria.name,
      value: 0
    }));

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
      additionalSpecificExperienceContribution: initialAdditionalSpecific,
      adjustedAdditionalSpecificValue: initialAdjustedAdditionalSpecific,
      contractType: 'public',
      contractComplies: false,
      selectedClassifierCodes: [],
      classifierCodesMatch: false
    });
  };

  const handleClassifierCodeChange = (contractorIndex: number, code: string, checked: boolean) => {
    const currentCodes = watchedValues.contractors?.[contractorIndex]?.selectedClassifierCodes || [];
    const newCodes = checked 
      ? [...currentCodes, code]
      : currentCodes.filter(c => c !== code);
    
    setValue(`contractors.${contractorIndex}.selectedClassifierCodes`, newCodes);
    
    // Check if at least one code matches
    const processClassifierCodes = processData?.experience.classifierCodes || [];
    const hasMatch = newCodes.some(code => processClassifierCodes.includes(code));
    setValue(`contractors.${contractorIndex}.classifierCodesMatch`, hasMatch);
  };

  const getUnitLabel = (unit: string): string => {
    const labels = {
      'longitud': 'Longitud',
      'area_cubierta': 'Área de cubierta medida en planta',
      'area_ejecutada': 'Área ejecutada',
      'smlmv': 'SMLMV'
    };
    return labels[unit as keyof typeof labels] || unit;
  };

  // Ensure additionalSpecific is always an array
  const additionalSpecificCriteria = Array.isArray(processData?.experience.additionalSpecific) 
    ? processData.experience.additionalSpecific 
    : [];

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
                {additionalSpecificCriteria.map((criteria, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <h5 className="font-medium">{criteria.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Cantidad aportada ({getUnitLabel(criteria.unit)})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={watchedValues.additionalSpecificAmounts?.[index]?.amount || 0}
                          readOnly
                          className="bg-muted"
                        />
                        <div className="text-sm text-muted-foreground">
                          Valor requerido: {criteria.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          * Calculado automáticamente desde los contratos aportados
                        </div>
                        {watchedValues.additionalSpecificAmounts?.[index] && (
                          <div className="flex items-center space-x-2">
                            {checkAdditionalSpecificCompliance(
                              watchedValues.additionalSpecificAmounts[index].amount,
                              criteria.value
                            ) ? (
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

                      {!checkAdditionalSpecificCompliance(
                        watchedValues.additionalSpecificAmounts?.[index]?.amount || 0,
                        criteria.value
                      ) && (
                        <div className="space-y-2">
                          <Label className="text-destructive">
                            Comentario obligatorio (no cumple) *
                          </Label>
                          <Textarea
                            {...register(`additionalSpecificAmounts.${index}.comment`)}
                            placeholder="Explique por qué no cumple el requisito"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                          <Select 
                            value={watchedValues.contractors?.[index]?.requiredExperience || 'general'}
                            onValueChange={(value) => setValue(`contractors.${index}.requiredExperience`, value as any)}
                          >
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
                          <Label>Tipo de contrato *</Label>
                          <Select 
                            value={watchedValues.contractors?.[index]?.contractType || 'public'}
                            onValueChange={(value) => setValue(`contractors.${index}.contractType`, value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Público</SelectItem>
                              <SelectItem value="private">Privado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {watchedValues.contractors?.[index]?.contractType === 'private' && (
                          <div className="space-y-2 col-span-full">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`privateDocuments_${index}`}
                                checked={watchedValues.contractors?.[index]?.privateDocumentsComplete || false}
                                onCheckedChange={(checked) => setValue(`contractors.${index}.privateDocumentsComplete`, !!checked)}
                              />
                              <Label htmlFor={`privateDocuments_${index}`}>
                                ¿Presentó todos los documentos requeridos? (certificado de facturación firmado, acta de liquidación o recibo firmado)
                              </Label>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Forma de ejecución</Label>
                          <Select 
                            value={watchedValues.contractors?.[index]?.executionForm || 'I'}
                            onValueChange={(value) => setValue(`contractors.${index}.executionForm`, value as any)}
                          >
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
                              onChange: () => {
                                calculateAdjustedValue(index);
                                calculateAdjustedAdditionalSpecificValues(index);
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Integrante que aporta experiencia</Label>
                          <Select 
                            value={watchedValues.contractors?.[index]?.experienceContributor || ''}
                            onValueChange={(value) => setValue(`contractors.${index}.experienceContributor`, value)}
                          >
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

                        {/* Aportes en experiencia específica adicional */}
                        <div className="space-y-4 col-span-full">
                          <h5 className="font-medium">Aportes en experiencia específica adicional</h5>
                          {additionalSpecificCriteria.map((criteria, criteriaIndex) => (
                            <div key={criteriaIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded">
                              <div className="space-y-2">
                                <Label>Aporte en {criteria.name}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register(`contractors.${index}.additionalSpecificExperienceContribution.${criteriaIndex}.value`, { 
                                    valueAsNumber: true,
                                    onChange: () => calculateAdjustedAdditionalSpecificValues(index)
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Valor ajustado {criteria.name}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={watchedValues.contractors?.[index]?.adjustedAdditionalSpecificValue?.[criteriaIndex]?.value || 0}
                                  readOnly
                                  className="bg-muted"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Códigos clasificadores */}
                      {processData?.experience.classifierCodes && processData.experience.classifierCodes.length > 0 && (
                        <div className="space-y-4">
                          <h5 className="font-medium">Códigos clasificadores del proceso</h5>
                          <p className="text-sm text-muted-foreground">
                            Seleccione los códigos que coinciden con este contrato. 
                            Si al menos uno coincide, el contrato será hábil para este proceso.
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {processData.experience.classifierCodes.map((code) => (
                              <div key={code} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`classifier_${index}_${code}`}
                                  checked={watchedValues.contractors?.[index]?.selectedClassifierCodes?.includes(code) || false}
                                  onCheckedChange={(checked) => handleClassifierCodeChange(index, code, !!checked)}
                                />
                                <Label htmlFor={`classifier_${index}_${code}`} className="text-sm">
                                  {code}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <div className="text-sm">
                            {watchedValues.contractors?.[index]?.classifierCodesMatch ? (
                              <span className="text-green-600 font-medium">✓ Este contrato es hábil (códigos coincidentes)</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ Este contrato no es hábil (sin códigos coincidentes)</span>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`contractComplies_${index}`}
                            checked={watchedValues.contractors?.[index]?.contractComplies || false}
                            onCheckedChange={(checked) => setValue(`contractors.${index}.contractComplies`, !!checked)}
                          />
                          <Label htmlFor={`contractComplies_${index}`} className="font-medium">
                            ¿El contrato cumple con todos los requisitos?
                          </Label>
                        </div>

                        {!watchedValues.contractors?.[index]?.contractComplies && (
                          <div className="space-y-2">
                            <Label htmlFor={`nonComplianceReason_${index}`} className="text-destructive">
                              Motivo de incumplimiento *
                            </Label>
                            <Textarea
                              id={`nonComplianceReason_${index}`}
                              {...register(`contractors.${index}.nonComplianceReason`)}
                              placeholder="Explique qué debe subsanar en este contrato"
                              className="min-h-[80px]"
                            />
                          </div>
                        )}
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
