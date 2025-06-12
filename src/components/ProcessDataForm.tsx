
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { BasicProcessInfo } from '@/components/forms/BasicProcessInfo';
import { ScoringCriteriaSection } from '@/components/forms/ScoringCriteriaSection';
import { ExperienceRequirementsSection } from '@/components/forms/ExperienceRequirementsSection';

interface ProcessDataFormData {
  processNumber: string;
  processObject: string;
  closingDate: string;
  totalContractValue: number;
  minimumSalary: number;
  processType: 'licitacion' | 'concurso' | 'abreviada' | 'minima';
  generalExperience: string;
  specificExperience: string;
  classifierCodes: string[];
  additionalSpecific: Array<{
    name: string;
    value: number;
    unit: 'longitud' | 'area_cubierta' | 'area_ejecutada' | 'smlmv';
  }>;
  scoring: {
    womanEntrepreneurship: number;
    mipyme: number;
    disabled: number;
    qualityFactor: number;
    environmentalQuality: number;
    nationalIndustrySupport: number;
  };
}

export const ProcessDataForm: React.FC = () => {
  const { processData, setProcessData, setCurrentStep } = useAppStore();
  
  const { register, handleSubmit, control, formState: { errors }, getValues, setValue, watch } = useForm<ProcessDataFormData>({
    defaultValues: {
      processNumber: processData?.processNumber || '',
      processObject: processData?.processObject || '',
      closingDate: processData?.closingDate || '',
      totalContractValue: processData?.totalContractValue || 0,
      minimumSalary: processData?.minimumSalary || 0,
      processType: processData?.processType || 'licitacion',
      generalExperience: processData?.experience?.general || '',
      specificExperience: processData?.experience?.specific || '',
      classifierCodes: Array.isArray(processData?.experience?.classifierCodes) ? processData.experience.classifierCodes : [''],
      additionalSpecific: Array.isArray(processData?.experience?.additionalSpecific) ? processData.experience.additionalSpecific : [],
      scoring: {
        womanEntrepreneurship: processData?.scoring?.womanEntrepreneurship || 0,
        mipyme: processData?.scoring?.mipyme || 0,
        disabled: processData?.scoring?.disabled || 0,
        qualityFactor: processData?.scoring?.qualityFactor || 0,
        environmentalQuality: processData?.scoring?.environmentalQuality || 0,
        nationalIndustrySupport: processData?.scoring?.nationalIndustrySupport || 0
      }
    }
  });

  // Separate field arrays for different data types
  const {
    fields: classifierCodeFields,
    append: appendClassifierCode,
    remove: removeClassifierCode,
  } = useFieldArray({
    control,
    name: 'classifierCodes',
  });

  const { 
    fields: additionalFields, 
    append: appendAdditional, 
    remove: removeAdditional 
  } = useFieldArray({
    control,
    name: 'additionalSpecific'
  });

  const onSubmit = (data: ProcessDataFormData) => {
    const formattedData = {
      processNumber: data.processNumber,
      processObject: data.processObject,
      closingDate: data.closingDate,
      totalContractValue: data.totalContractValue,
      minimumSalary: data.minimumSalary,
      processType: data.processType,
      scoring: data.scoring,
      experience: {
        general: data.generalExperience,
        specific: data.specificExperience,
        classifierCodes: data.classifierCodes.filter(code => code.trim() !== ''),
        additionalSpecific: data.additionalSpecific
      }
    };

    setProcessData(formattedData);
    setCurrentStep(2);
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Datos del proceso</h2>
          <p className="text-muted-foreground">Ingrese la información básica del proceso de contratación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <BasicProcessInfo 
          register={register}
          errors={errors}
          setValue={setValue}
          defaultProcessType={processData?.processType}
        />

        <ScoringCriteriaSection 
          register={register}
          setValue={setValue}
          watch={watch}
        />

        <ExperienceRequirementsSection
          register={register}
          control={control}
          getValues={getValues}
          setValue={setValue}
          classifierCodeFields={classifierCodeFields}
          appendClassifierCode={appendClassifierCode}
          removeClassifierCode={removeClassifierCode}
          additionalFields={additionalFields}
          appendAdditional={appendAdditional}
          removeAdditional={removeAdditional}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(0)}
          >
            Volver al inicio
          </Button>
          <Button type="submit">
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};
