
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import UserMenu from '@/components/UserMenu';
import { useProcessSaving } from '@/hooks/useProcessSaving';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { currentStep, processData, proponents, setCurrentStep } = useAppStore();
  const navigate = useNavigate();
  
  // Hook para guardado automático
  useProcessSaving();

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Datos del Proceso';
      case 2:
        return 'Información de Proponentes';
      case 3:
        return 'Requisitos y Experiencia';
      case 4:
        return 'Resumen y Puntuación';
      default:
        return 'Evaluación de Procesos';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return 'Configurar la información básica del proceso de contratación';
      case 2:
        return 'Agregar y gestionar los proponentes del proceso';
      case 3:
        return 'Verificar requisitos habilitantes y experiencia';
      case 4:
        return 'Revisar puntuaciones y generar resultados finales';
      default:
        return 'Sistema de evaluación de procesos de contratación';
    }
  };

  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < 4;

  const handleStepNavigation = (newStep: number) => {
    if (newStep >= 1 && newStep <= 4) {
      setCurrentStep(newStep);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EA</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Evaluador de Alcaldía
                  </h1>
                  <p className="text-xs text-gray-500">
                    Sistema de Evaluación de Procesos
                  </p>
                </div>
              </div>
              
              {processData && (
                <div className="hidden md:flex items-center space-x-2 ml-8">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Proceso {processData.processNumber}
                  </Badge>
                  <span className="text-sm text-gray-500">|</span>
                  <span className="text-sm text-gray-600 max-w-xs truncate">
                    {processData.processObject}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {proponents.length > 0 && (
                <Badge variant="secondary" className="hidden sm:flex">
                  {proponents.length} Proponente{proponents.length !== 1 ? 's' : ''}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator with Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Paso {currentStep}: {getStepTitle(currentStep)}
              </h2>
              <p className="text-sm text-gray-600">
                {getStepDescription(currentStep)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStepNavigation(currentStep - 1)}
                  disabled={!canGoBack}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStepNavigation(currentStep + 1)}
                  disabled={!canGoForward}
                  className="flex items-center space-x-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Step Indicators */}
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => handleStepNavigation(step)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:bg-gray-100 ${
                      step === currentStep
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : step < currentStep
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step < currentStep ? '✓' : step}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-sm">
          {children}
        </Card>
      </main>

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Guardado automático activo</span>
        </div>
      </div>
    </div>
  );
};
