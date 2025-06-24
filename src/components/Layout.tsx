
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, CheckSquare, BarChart3, Settings, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '@/components/UserMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentStep, setCurrentStep, resetProcess, processData } = useAppStore();
  const navigate = useNavigate();

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

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/cfad49f5-3e5e-4183-a35a-c449717caf3d.png" 
                  alt="Alcaldía de Manizales" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-foreground">Sistema de Evaluación</h1>
                <p className="text-sm text-muted-foreground">Alcaldía de Manizales</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleDashboard}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
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
