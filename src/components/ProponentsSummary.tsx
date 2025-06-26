
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, FileText, Calendar, DollarSign, ArrowLeft, Edit, FileSpreadsheet, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Proponent } from '@/types';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

interface ProponentsSummaryProps {
  onBackToEntry?: () => void;
  onAddMoreProponents?: () => void;
}

export const ProponentsSummary: React.FC<ProponentsSummaryProps> = ({
  onBackToEntry,
  onAddMoreProponents
}) => {
  const { processData, proponents, setCurrentStep } = useAppStore();

  if (!processData) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No hay datos del proceso disponibles</p>
      </div>
    );
  }

  // Ordenar proponentes por puntaje total (mayor a menor)
  const sortedProponents = [...proponents].sort((a, b) => b.totalScore - a.totalScore);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getProcessTypeLabel = (type: string) => {
    const types = {
      'licitacion': 'Licitación Pública',
      'concurso': 'Concurso de Méritos',
      'abreviada': 'Selección Abreviada',
      'minima': 'Mínima Cuantía'
    };
    return types[type as keyof typeof types] || type;
  };

  // Calcular estadísticas
  const totalProponents = proponents.length;
  const averageScore = totalProponents > 0 
    ? proponents.reduce((sum, p) => sum + p.totalScore, 0) / totalProponents 
    : 0;

  const proponentsNeedingSubsanation = proponents.filter(p => p.needsSubsanation).length;

  const handleExportExcel = () => {
    if (processData && proponents.length > 0) {
      exportToExcel(processData, sortedProponents);
    }
  };

  const handleExportPDF = () => {
    if (processData && proponents.length > 0) {
      exportToPDF(processData, sortedProponents);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Resumen de Evaluación</h2>
            <p className="text-muted-foreground">Resultados finales del proceso de selección</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {proponents.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar proponentes
          </Button>
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Editar proceso
          </Button>
        </div>
      </div>

      {/* Información del Proceso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Información del Proceso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número del proceso</p>
              <p className="font-semibold">{processData.processNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de proceso</p>
              <p className="font-semibold">{getProcessTypeLabel(processData.processType)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de cierre</p>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold">
                  {processData.closingDate 
                    ? new Date(processData.closingDate).toLocaleDateString('es-CO')
                    : 'No definida'
                  }
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objeto del proceso</p>
              <p className="font-semibold text-sm">{processData.processObject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor del contrato</p>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold">{formatCurrency(processData.totalContractValue)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salario mínimo</p>
              <p className="font-semibold">{formatCurrency(processData.minimumSalary)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proponentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProponents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntaje Promedio</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Puntaje</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedProponents.length > 0 ? sortedProponents[0].totalScore.toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Subsanación</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proponentsNeedingSubsanation}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Proponentes */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Proponentes</CardTitle>
          <CardDescription>
            Ordenados por puntaje total de mayor a menor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proponents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay proponentes evaluados
              </h3>
              <p className="text-muted-foreground mb-4">
                Agrega proponentes para ver el resumen de evaluación
              </p>
              <Button onClick={() => setCurrentStep(2)}>
                Agregar Proponentes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProponents.map((proponent, index) => (
                <div
                  key={proponent.id}
                  className={`p-4 border rounded-lg ${
                    index === 0 ? 'border-green-200 bg-green-50' : 
                    index === 1 ? 'border-blue-200 bg-blue-50' : 
                    index === 2 ? 'border-orange-200 bg-orange-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-green-500 text-white' :
                        index === 1 ? 'bg-blue-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{proponent.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {proponent.isPlural && (
                            <Badge variant="outline" className="text-xs">
                              Plural ({proponent.partners?.length || 0} socios)
                            </Badge>
                          )}
                          {proponent.needsSubsanation && (
                            <Badge variant="destructive" className="text-xs">
                              Requiere Subsanación
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {proponent.totalScore.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">puntos</div>
                    </div>
                  </div>
                  
                  {/* Desglose de puntajes */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.womanEntrepreneurship.toFixed(2)}</div>
                        <div className="text-muted-foreground">Mujer</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.mipyme.toFixed(2)}</div>
                        <div className="text-muted-foreground">MIPYME</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.disabled.toFixed(2)}</div>
                        <div className="text-muted-foreground">Discap.</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.qualityFactor.toFixed(2)}</div>
                        <div className="text-muted-foreground">Calidad</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.environmentalQuality.toFixed(2)}</div>
                        <div className="text-muted-foreground">Ambiental</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{proponent.scoring.nationalIndustrySupport.toFixed(2)}</div>
                        <div className="text-muted-foreground">Nacional</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Agregar más proponentes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
