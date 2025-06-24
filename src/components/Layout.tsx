
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Users, CheckSquare, BarChart3, Settings, RotateCcw } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentStep, setCurrentStep, resetProcess, processData } = useAppStore();

  const steps = [
    { id: 1, title: 'Datos de entrada', icon: Settings },
    { id: 2, title: 'Puntaje', icon: BarChart3 },
    { id: 3, title: 'Requisitos habilitantes', icon: CheckSquare },
    { id: 4, title: 'Resumen de proponentes', icon: FileText }
  ];

  const handleStepClick = (stepId: number) => {
    if (stepId === 1 || (processData && stepId <= 4)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Alcaldía de Manizales</h1>
                <p className="text-sm text-muted-foreground">Sistema de Evaluación de Proponentes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={resetProcess}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar proceso</span>
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDisabled = step.id > 1 && !processData;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : isDisabled 
                        ? 'text-muted-foreground cursor-not-allowed opacity-50'
                        : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{step.title}</span>
                  <span className="sm:hidden">{step.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="animate-fade-in">
          {children}
        </Card>
      </main>
    </div>
  );
};
