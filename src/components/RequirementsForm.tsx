
import React, { useState, useEffect, useRef } from 'react';
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
  const manuallyEditedAmounts = useRef<Set<number>>(new Set());

  const selectedProponent = proponents.find(p => p.id === selectedProponentId);

  const getInitialFormData = (proponent: any): RequirementsFormData => {
    if (!proponent || !processData) {
      return {
        proponentId: '',
        generalExperience: false,
        specificExperience: false,
        professionalCard: false,
        additionalSpecificAmounts: [],
        contractors: []
      };
    }

    // Ensure additionalSpecific is an array before using it
    const additionalSpecific = Array.isArray(processData.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];
    
    // Inicializar amounts basado en processData y datos guardados del proponente
    const initialAmounts = additionalSpecific.map((criteria, index) => ({
      name: criteria.name,
      amount: Array.isArray(proponent.requirements.additionalSpecificExperience) 
        ? proponent.requirements.additionalSpecificExperience[index]?.amount || 0
        : 0,
      comment: Array.isArray(proponent.requirements.additionalSpecificExperience)
        ? proponent.requirements.additionalSpecificExperience[index]?.comment || ''
        : ''
    }));

    console.log('🔄 Initializing form with proponent data:', {
      proponentName: proponent.name,
      generalExperience: proponent.requirements.generalExperience,
      specificExperience: proponent.requirements.specificExperience,
      professionalCard: proponent.requirements.professionalCard,
      additionalAmounts: initialAmounts,
      contractorsCount: proponent.contractors?.length || 0
    });

    return {
      proponentId: proponent.id,
      generalExperience: proponent.requirements.generalExperience || false,
      specificExperience: proponent.requirements.specificExperience || false,
      professionalCard: proponent.requirements.professionalCard || false,
      additionalSpecificAmounts: initialAmounts,
      contractors: proponent.contractors || []
    };
  };

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
  // SOLO si no han sido editadas manualmente
  const calculateAdditionalSpecificAmounts = () => {
    if (!processData?.experience.additionalSpecific || !Array.isArray(processData.experience.additionalSpecific)) return;

    const calculatedAmounts = processData.experience.additionalSpecific.map((criteria, criteriaIndex) => {
      // Si este índice ha sido editado manualmente, mantener el valor actual
      if (manuallyEditedAmounts.current.has(criteriaIndex)) {
        return watchedValues.additionalSpecificAmounts?.[criteriaIndex] || {
          name: criteria.name,
          amount: 0,
          comment: ''
        };
      }

      const total = watchedValues.contractors?.reduce((sum, contractor) => {
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

  // Función para marcar un campo como editado manualmente
  const markAsManuallyEdited = (index: number) => {
    manuallyEditedAmounts.current.add(index);
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
    console.log('🔄 Selecting proponent:', proponentId);
    setSelectedProponentId(proponentId);
    // Limpiar el registro de campos editados manualmente al cambiar de proponente
    manuallyEditedAmounts.current.clear();
    
    const proponent = proponents.find(p => p.id === proponentId);
    if (proponent && processData) {
      const initialData = getInitialFormData(proponent);
      console.log('🔄 Resetting form with initial data:', initialData);
      reset(initialData);
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
    const hasIncompleteRequiredContracts = data.contractors.some((contractor, index) => {
      // Si el contrato ya está marcado como no cumple, no validar campos individuales
      if (!contractor.contractComplies) return false;
      
      // Para contratos que deben cumplir, verificar campos requeridos
      const basicFieldsIncomplete = !contractor.contractingEntity?.trim() || 
        !contractor.contractNumber?.trim() || 
        !contractor.object?.trim();
      
      const privateContractIncomplete = contractor.contractType === 'private' && 
        !contractor.privateDocumentsComplete;
      
      console.log(`Contract ${index + 1} required fields validation:`, {
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
    
    nonCompliantContracts.forEach((contractor, index) => {
      if (contractor.nonComplianceReason) {
        subsanationDetails.push(`Contrato #${index + 1}: ${contractor.nonComplianceReason}`);
      } else {
        subsanationDetails.push(`Contrato #${index + 1}: No cumple requisitos`);
      }
    });

    if (hasIncompleteRequiredContracts) {
      subsanationDetails.push("Hay contratos con información incompleta");
    }

    // Actualizar el proponente directamente
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

    console.log('✅ Requirements saved for proponent:', selectedProponent.name);
    
    // NO limpiar la selección para mantener los datos visibles
    // setSelectedProponentId('');
    // reset();
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
            onManualAmountEdit={markAsManuallyEdited}
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
