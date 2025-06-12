
import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

interface BasicProcessInfoProps {
  register: UseFormRegister<ProcessDataFormData>;
  errors: FieldErrors<ProcessDataFormData>;
  setValue: UseFormSetValue<ProcessDataFormData>;
  defaultProcessType?: string;
}

export const BasicProcessInfo: React.FC<BasicProcessInfoProps> = ({
  register,
  errors,
  setValue,
  defaultProcessType
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información básica</CardTitle>
        <CardDescription>Datos generales del proceso de contratación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="processNumber">Número de proceso</Label>
            <Input id="processNumber" {...register('processNumber', { required: true })} />
            {errors.processNumber && <p className="text-sm text-destructive">Campo requerido</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="processType">Tipo de proceso</Label>
            <Select 
              defaultValue={defaultProcessType || 'licitacion'}
              onValueChange={(value) => setValue('processType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="licitacion">Licitación pública</SelectItem>
                <SelectItem value="concurso">Concurso de méritos</SelectItem>
                <SelectItem value="abreviada">Selección abreviada</SelectItem>
                <SelectItem value="minima">Mínima cuantía</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closingDate">Fecha de cierre</Label>
            <Input id="closingDate" type="date" {...register('closingDate', { required: true })} />
            {errors.closingDate && <p className="text-sm text-destructive">Campo requerido</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalContractValue">Valor total del contrato</Label>
            <Input 
              id="totalContractValue" 
              type="number" 
              step="0.01"
              min="0"
              {...register('totalContractValue', { required: true, valueAsNumber: true })} 
            />
            {errors.totalContractValue && <p className="text-sm text-destructive">Campo requerido</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumSalary">Salario mínimo (SMMLV)</Label>
            <Input 
              id="minimumSalary" 
              type="number" 
              step="0.01"
              min="0"
              {...register('minimumSalary', { required: true, valueAsNumber: true })} 
            />
            {errors.minimumSalary && <p className="text-sm text-destructive">Campo requerido</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="processObject">Objeto del proceso</Label>
          <Textarea 
            id="processObject" 
            {...register('processObject', { required: true })} 
            className="min-h-[100px]"
          />
          {errors.processObject && <p className="text-sm text-destructive">Campo requerido</p>}
        </div>
      </CardContent>
    </Card>
  );
};
