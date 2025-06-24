
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProcessDataForm } from '@/components/ProcessDataForm';
import { ProponentScoringForm } from '@/components/ProponentScoringForm';
import { RequirementsForm } from '@/components/RequirementsForm';
import { ProponentsSummary } from '@/components/ProponentsSummary';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentProcessData } from '@/hooks/useCurrentProcessData';

const Index = () => {
  const { currentStep } = useAppStore();
  
  // Cargar los datos del proceso actual al montar el componente
  useCurrentProcessData();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProcessDataForm />;
      case 2:
        return <ProponentScoringForm />;
      case 3:
        return <RequirementsForm />;
      case 4:
        return <ProponentsSummary />;
      default:
        return <ProcessDataForm />;
    }
  };

  return (
    <Layout>
      {renderCurrentStep()}
    </Layout>
  );
};

export default Index;
