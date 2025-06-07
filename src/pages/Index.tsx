
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProcessDataForm } from '@/components/ProcessDataForm';
import { ProponentScoringForm } from '@/components/ProponentScoringForm';
import { RequirementsForm } from '@/components/RequirementsForm';
import { ProponentsSummary } from '@/components/ProponentsSummary';
import { useAppStore } from '@/store/useAppStore';

const Index = () => {
  const { currentStep } = useAppStore();

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
