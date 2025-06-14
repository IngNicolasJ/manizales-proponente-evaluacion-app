
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { CheckSquare, AlertTriangle } from 'lucide-react';
import { RequirementsFormData } from '@/types/forms';
import { ProponentSelector } from './forms/ProponentSelector';
import { ExperienceVerificationSection } from './forms/ExperienceVerificationSection';
import { ContractsSection } from './forms/ContractsSection';

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

  const onSubmit = (data: RequirementsFormData) => {
    if (!selectedProponent || !processData) return;

    const additionalSpecificResults = data.additionalSpecificAmounts.map((amount, index) => {
      const additionalSpecific = Array.isArray(processData.experience.additionalSpecific) 
        ? processData.experience.additionalSpecific 
        : [];
      const requiredValue = additionalSpecific[index]?.value || 0;
      const complies = checkAdditionalSpecificCompliance(amount.amount, requiredValue);
      
      console.log(`Additional Specific ${index}:`, {
        name: amount.name,
        amount: amount.amount,
        requiredValue,
        complies
      });
      
      return {
        name: amount.name,
        amount: amount.amount,
        complies,
        comment: amount.comment
      };
    });

    // Mejor validación para contratos incompletos - solo considerar contratos que NO cumplen
    const nonCompliantContracts = data.contractors.filter(contractor => !contractor.contractComplies);
    
    // Validar campos requeridos solo en contratos que deben cumplir
    const hasIncompleteRequiredContracts = data.contractors.some(contractor => {
      // Si el contrato ya está marcado como no cumple, no validar campos individuales
      if (!contractor.contractComplies) return false;
      
      // Para contratos que deben cumplir, verificar campos requeridos
      const basicFieldsIncomplete = !contractor.contractingEntity?.trim() || 
        !contractor.contractNumber?.trim() || 
        !contractor.object?.trim();
      
      const privateContractIncomplete = contractor.contractType === 'private' && 
        !contractor.privateDocumentsComplete;
      
      console.log(`Contract ${contractor.order} required fields validation:`, {
        contractComplies: contractor.contractComplies,
        contractingEntity: !!contractor.contractingEntity?.trim(),
        contractNumber: !!contractor.contractNumber?.trim(),
        object: !!contractor.object?.trim(),
        contractType: contractor.contractType,
        privateDocumentsComplete: contractor.privateDocumentsComplete,
        basicFieldsIncomplete,
        privateContractIncomplete
      });
      
      return basicFieldsIncomplete || privateContractIncomplete;
    });

    const nonCompliantAdditionalCriteria = additionalSpecificResults.filter(result => !result.complies);

    console.log('Subsanation Debug:', {
      generalExperience: data.generalExperience,
      specificExperience: data.specificExperience,
      professionalCard: data.professionalCard,
      nonCompliantAdditionalCriteria: nonCompliantAdditionalCriteria.length,
      hasIncompleteRequiredContracts,
      rupComplies: selectedProponent.rup.complies,
      contractsCount: data.contractors.length,
      nonCompliantContractsCount: nonCompliantContracts.length
    });

    // Lógica corregida de subsanación
    const needsSubsanation = 
      !data.generalExperience ||
      !data.specificExperience ||
      !data.professionalCard ||
      nonCompliantAdditionalCriteria.length > 0 ||
      hasIncompleteRequiredContracts ||
      !selectedProponent.rup.complies ||
      nonCompliantContracts.length > 0;

    console.log('Final subsanation decision:', needsSubsanation);

    // Crear detalles de subsanación más precisos
    const subsanationDetails: string[] = [];
    
    if (!data.generalExperience) subsanationDetails.push("No cumple experiencia general");
    if (!data.specificExperience) subsanationDetails.push("No cumple experiencia específica");
    if (!data.professionalCard) subsanationDetails.push("No aporta tarjeta profesional");
    if (!selectedProponent.rup.complies) subsanationDetails.push("RUP no vigente");
    
    nonCompliantAdditionalCriteria.forEach((criteria) => {
      subsanationDetails.push(`No cumple ${criteria.name}`);
    });
    
    nonCompliantContracts.forEach((contractor) => {
      if (contractor.nonComplianceReason) {
        subsanationDetails.push(`Contrato #${contractor.order}: ${contractor.nonComplianceReason}`);
      } else {
        subsanationDetails.push(`Contrato #${contractor.order}: No cumple requisitos`);
      }
    });

    if (hasIncompleteRequiredContracts) {
      subsanationDetails.push("Hay contratos con información incompleta");
    }

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

    // Forzar una actualización del estado al resetear el formulario
    setTimeout(() => {
      setSelectedProponentId('');
      reset();
    }, 100);
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

      <ProponentSelector
        proponents={proponents}
        selectedProponentId={selectedProponentId}
        onProponentSelect={handleProponentSelect}
      />

      {selectedProponent && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ExperienceVerificationSection
            processData={processData}
            watchedValues={watchedValues}
            setValue={setValue}
            selectedProponentName={selectedProponent.name}
          />

          <ContractsSection
            register={register}
            control={control}
            watchedValues={watchedValues}
            setValue={setValue}
            processData={processData}
            selectedProponent={selectedProponent}
          />

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
