
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { UserMenu } from '@/components/UserMenu';
import { useProcessSaving } from '@/hooks/useProcessSaving';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { currentStep, processData, proponents } = useAppStore();
  
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
                    {processData.processName}
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
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
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
            
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep
                      ? 'bg-primary text-white'
                      : step < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
              ))}
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
