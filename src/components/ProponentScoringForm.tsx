
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Plus, Users, AlertTriangle } from 'lucide-react';
import { Proponent } from '@/types';
import { ProponentFormData } from '@/types/forms';
import { toast } from '@/hooks/use-toast';
import { ProponentsList } from '@/components/forms/ProponentsList';
import { ProponentFormContainer } from '@/components/forms/ProponentFormContainer';
import { EmptyProponentsState } from '@/components/forms/EmptyProponentsState';

export const ProponentScoringForm: React.FC = () => {
  const { processData, proponents, addProponent, updateProponent, setCurrentStep } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProponent, setEditingProponent] = useState<string | null>(null);

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

  const handleEditProponent = (proponent: Proponent) => {
    setEditingProponent(proponent.id);
    setShowForm(true);
  };

  const handleAddProponent = (data: ProponentFormData) => {
    const rupComplies = data.isPlural 
      ? data.partners.every(partner => checkRupCompliance(partner.rupRenewalDate))
      : checkRupCompliance(data.rupRenewalDate);

    const totalScore = 
      data.scoring.womanEntrepreneurship +
      data.scoring.mipyme +
      data.scoring.disabled +
      data.scoring.qualityFactor +
      data.scoring.environmentalQuality +
      data.scoring.nationalIndustrySupport;

    const additionalSpecificCriteria = Array.isArray(processData.experience?.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];

    const additionalSpecificExperience = additionalSpecificCriteria.map(criterion => ({
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
    
    toast({
      title: "Proponente agregado",
      description: "El proponente ha sido agregado correctamente",
    });

    setShowForm(false);
    setEditingProponent(null);
  };

  const handleUpdateProponent = (data: ProponentFormData) => {
    if (!editingProponent) return;

    const rupComplies = data.isPlural 
      ? data.partners.every(partner => checkRupCompliance(partner.rupRenewalDate))
      : checkRupCompliance(data.rupRenewalDate);

    const totalScore = 
      data.scoring.womanEntrepreneurship +
      data.scoring.mipyme +
      data.scoring.disabled +
      data.scoring.qualityFactor +
      data.scoring.environmentalQuality +
      data.scoring.nationalIndustrySupport;

    const updatedProponent: Partial<Proponent> = {
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
      totalScore
    };

    updateProponent(editingProponent, updatedProponent);
    
    toast({
      title: "Proponente actualizado",
      description: "Los puntajes han sido actualizados correctamente",
    });

    setShowForm(false);
    setEditingProponent(null);
  };

  const onSubmit = (data: ProponentFormData) => {
    if (editingProponent) {
      handleUpdateProponent(data);
    } else {
      handleAddProponent(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProponent(null);
  };

  const handleShowForm = () => {
    setEditingProponent(null);
    setShowForm(true);
  };

  const getInitialValues = (): Partial<ProponentFormData> | undefined => {
    if (!editingProponent) return undefined;
    
    const proponent = proponents.find(p => p.id === editingProponent);
    if (!proponent) return undefined;

    return {
      name: proponent.name,
      isPlural: proponent.isPlural,
      rupRenewalDate: proponent.rup.renewalDate,
      scoring: proponent.scoring,
      partners: proponent.isPlural && proponent.partners ? proponent.partners.map(partner => ({
        name: partner.name,
        percentage: partner.percentage,
        rupRenewalDate: ''
      })) : []
    };
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
          <Button onClick={handleShowForm}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar proponente
          </Button>
        </div>
      </div>

      <ProponentsList
        proponents={proponents}
        onEditProponent={handleEditProponent}
      />

      {showForm && (
        <ProponentFormContainer
          editingProponent={editingProponent}
          processData={processData}
          checkRupCompliance={checkRupCompliance}
          onSubmit={onSubmit}
          onCancel={handleFormCancel}
          initialValues={getInitialValues()}
          proponents={proponents}
        />
      )}

      {!showForm && proponents.length === 0 && (
        <EmptyProponentsState onAddProponent={handleShowForm} />
      )}
    </div>
  );
};
