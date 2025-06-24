
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store/useAppStore';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { Download, FileSpreadsheet, FileText, AlertTriangle, Edit, Users, CheckSquare, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ProponentsSummary: React.FC = () => {
  const { processData, proponents, setCurrentStep } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  if (!processData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuración requerida</h3>
          <p className="text-muted-foreground mb-4">
            Debe completar los datos de entrada antes de ver el resumen.
          </p>
          <Button onClick={() => setCurrentStep(1)}>Ir a datos de entrada</Button>
        </div>
      </div>
    );
  }

  const handleExportExcel = async () => {
    if (!processData || proponents.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "Agregue al menos un proponente antes de exportar",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToExcel(processData, proponents);
      toast({
        title: "Exportación exitosa",
        description: "El archivo Excel se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!processData || proponents.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "Agregue al menos un proponente antes de exportar",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(processData, proponents);
      toast({
        title: "Exportación exitosa",
        description: "El archivo PDF se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const sortedProponents = [...proponents].sort((a, b) => b.totalScore - a.totalScore);
  const proponentsWithSubsanation = proponents.filter(p => p.needsSubsanation);

  return (
    <div className="p-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resumen de Evaluación</h2>
          <p className="text-muted-foreground">
            Proceso {processData.processNumber} - {proponents.length} proponente{proponents.length !== 1 ? 's' : ''} evaluado{proponents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Datos del proceso</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Editar proponentes</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(3)}
            className="flex items-center space-x-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Verificar requisitos</span>
          </Button>
        </div>
      </div>

      {/* Alerts for subsanation */}
      {proponentsWithSubsanation.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{proponentsWithSubsanation.length}</strong> proponente{proponentsWithSubsanation.length !== 1 ? 's' : ''} 
            {proponentsWithSubsanation.length === 1 ? ' requiere' : ' requieren'} subsanación.
          </AlertDescription>
        </Alert>
      )}

      {/* Process Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de proceso</p>
              <p className="font-semibold">{processData.processNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de cierre</p>
              <p className="font-semibold">{new Date(processData.closingDate).toLocaleDateString()}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Objeto del proceso</p>
              <p className="font-semibold">{processData.processObject}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proponents Ranking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ranking de Proponentes</CardTitle>
            <CardDescription>
              Ordenados por puntaje total de mayor a menor
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting || proponents.length === 0}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting || proponents.length === 0}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {proponents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay proponentes registrados
              </h3>
              <p className="text-muted-foreground mb-4">
                Agregue al menos un proponente para ver el resumen
              </p>
              <Button onClick={() => setCurrentStep(2)}>Agregar proponente</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProponents.map((proponent, index) => (
                <div
                  key={proponent.id}
                  className={`p-4 border rounded-lg ${
                    index === 0 ? 'border-green-200 bg-green-50' : 
                    proponent.needsSubsanation ? 'border-orange-200 bg-orange-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{proponent.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Puntaje: <strong>{proponent.totalScore.toFixed(2)}</strong></span>
                          {proponent.isPlural && (
                            <Badge variant="outline">
                              Plural ({proponent.partners?.length || 0} socios)
                            </Badge>
                          )}
                          {proponent.needsSubsanation && (
                            <Badge variant="destructive">Requiere subsanación</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </Button>
                  </div>
                  
                  {/* Scoring breakdown */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Mujer</p>
                      <p className="font-semibold">{proponent.scoring.womanEntrepreneurship}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">MIPYME</p>
                      <p className="font-semibold">{proponent.scoring.mipyme}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Discapacidad</p>
                      <p className="font-semibold">{proponent.scoring.disabled}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Calidad</p>
                      <p className="font-semibold">{proponent.scoring.qualityFactor}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Ambiental</p>
                      <p className="font-semibold">{proponent.scoring.environmentalQuality}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Nacional</p>
                      <p className="font-semibold">{proponent.scoring.nationalIndustrySupport}</p>
                    </div>
                  </div>

                  {/* Subsanation details */}
                  {proponent.needsSubsanation && proponent.subsanationDetails && (
                    <div className="mt-3 p-3 bg-orange-100 rounded border-l-4 border-orange-400">
                      <p className="text-sm font-semibold text-orange-800 mb-1">Detalles de subsanación:</p>
                      <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                        {proponent.subsanationDetails.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
