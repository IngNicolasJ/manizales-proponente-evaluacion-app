import React from 'react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { ProcessData } from '@/types';
import { RequirementsFormData } from '@/types/forms';

interface ContractFormProps {
  index: number;
  register: UseFormRegister<RequirementsFormData>;
  watchedValues: RequirementsFormData;
  setValue: UseFormSetValue<RequirementsFormData>;
  processData: ProcessData;
  experienceContributorOptions: string[];
  onRemove: () => void;
  onCalculateAdjustedValue: () => void;
  onCalculateAdjustedAdditionalSpecificValues: () => void;
  onClassifierCodeChange: (code: string, checked: boolean) => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  index,
  register,
  watchedValues,
  setValue,
  processData,
  experienceContributorOptions,
  onRemove,
  onCalculateAdjustedValue,
  onCalculateAdjustedAdditionalSpecificValues,
  onClassifierCodeChange
}) => {
  const additionalSpecificCriteria = Array.isArray(processData?.experience.additionalSpecific) 
    ? processData.experience.additionalSpecific 
    : [];

  const contractData = watchedValues.contractors?.[index];

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Contrato #{index + 1}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Consecutivo en RUP</Label>
          <Input {...register(`contractors.${index}.rupConsecutive`)} />
        </div>

        <div className="space-y-2">
          <Label>Experiencia requerida</Label>
          <Select 
            value={contractData?.requiredExperience || 'general'}
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
            value={contractData?.contractType || 'public'}
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

        {contractData?.contractType === 'private' && (
          <div className="space-y-2 col-span-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`privateDocuments_${index}`}
                checked={contractData?.privateDocumentsComplete || false}
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
            value={contractData?.executionForm || 'I'}
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
                onCalculateAdjustedValue();
                onCalculateAdjustedAdditionalSpecificValues();
              }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Integrante que aporta experiencia</Label>
          <Select 
            value={contractData?.experienceContributor || ''}
            onValueChange={(value) => setValue(`contractors.${index}.experienceContributor`, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {experienceContributorOptions.map((option) => (
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
              onChange: () => onCalculateAdjustedValue()
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Valor ajustado por participación</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={contractData?.adjustedValue || 0}
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
                    onChange: () => onCalculateAdjustedAdditionalSpecificValues()
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor ajustado {criteria.name}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={contractData?.adjustedAdditionalSpecificValue?.[criteriaIndex]?.value || 0}
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
                  checked={contractData?.selectedClassifierCodes?.includes(code) || false}
                  onCheckedChange={(checked) => onClassifierCodeChange(code, !!checked)}
                />
                <Label htmlFor={`classifier_${index}_${code}`} className="text-sm">
                  {code}
                </Label>
              </div>
            ))}
          </div>
          <div className="text-sm">
            {contractData?.classifierCodesMatch ? (
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
            checked={contractData?.contractComplies || false}
            onCheckedChange={(checked) => setValue(`contractors.${index}.contractComplies`, !!checked)}
          />
          <Label htmlFor={`contractComplies_${index}`} className="font-medium">
            ¿El contrato cumple con todos los requisitos?
          </Label>
        </div>

        {!contractData?.contractComplies && (
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
  );
};
