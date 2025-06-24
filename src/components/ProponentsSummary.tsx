import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store/useAppStore';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { Download, FileSpreadsheet, FileText, AlertTriangle, Edit, Users, CheckSquare, Settings, Info, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useExperienceCalculation } from '@/hooks/useExperienceCalculation';

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

  const checkRequirementsCompliance = (proponent: any) => {
    const requirements = proponent.requirements;
    const additionalSpecific = Array.isArray(processData?.experience.additionalSpecific) 
      ? processData.experience.additionalSpecific 
      : [];

    const compliance = {
      generalExperience: requirements.generalExperience || false,
      specificExperience: requirements.specificExperience || false,
      professionalCard: requirements.professionalCard || false,
      rupComplies: proponent.rup?.complies || false,
      additionalSpecific: additionalSpecific.map((criteria, index) => {
        const reqItem = Array.isArray(requirements.additionalSpecificExperience) 
          ? requirements.additionalSpecificExperience[index]
          : null;
        return {
          name: criteria.name,
          complies: reqItem?.complies || false,
          amount: reqItem?.amount || 0,
          required: criteria.value
        };
      })
    };

    const allBasicRequirementsMet = compliance.generalExperience && 
                                   compliance.specificExperience && 
                                   compliance.professionalCard && 
                                   compliance.rupComplies;

    const allAdditionalRequirementsMet = compliance.additionalSpecific.every(req => req.complies);

    return {
      ...compliance,
      allBasicRequirementsMet,
      allAdditionalRequirementsMet,
      overallCompliance: allBasicRequirementsMet && allAdditionalRequirementsMet
    };
  };

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

      {/* Complete Process Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Información Completa del Proceso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de proceso</p>
                <p className="text-lg font-semibold">{processData.processNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de cierre</p>
                <p className="text-lg font-semibold">{new Date(processData.closingDate).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de proceso</p>
                <p className="text-lg font-semibold capitalize">{processData.processType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor total del contrato</p>
                <p className="text-lg font-semibold">${processData.totalContractValue?.toLocaleString('es-ES') || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salario mínimo vigente</p>
                <p className="text-lg font-semibold">${processData.minimumSalary?.toLocaleString('es-ES') || 'No especificado'}</p>
              </div>
            </div>

            {/* Scoring Criteria */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Distribución de Puntajes</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Emprendimiento Mujer:</span>
                    <span className="font-semibold">{processData.scoring.womanEntrepreneurship} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MIPYME:</span>
                    <span className="font-semibold">{processData.scoring.mipyme} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discapacidad:</span>
                    <span className="font-semibold">{processData.scoring.disabled} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Factor Calidad:</span>
                    <span className="font-semibold">{processData.scoring.qualityFactor} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calidad Ambiental:</span>
                    <span className="font-semibold">{processData.scoring.environmentalQuality} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industria Nacional:</span>
                    <span className="font-semibold">{processData.scoring.nationalIndustrySupport} pts</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total Máximo:</span>
                    <span>{Object.values(processData.scoring).reduce((a, b) => a + b, 0)} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Object of the process */}
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Objeto del proceso</p>
            <p className="text-base leading-relaxed bg-gray-50 p-3 rounded-md">{processData.processObject}</p>
          </div>
        </CardContent>
      </Card>

      {/* Qualifying Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5" />
            <span>Requisitos Habilitantes del Proceso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Experience Requirements */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Experiencia Requerida</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">Experiencia General</p>
                  <p className="text-blue-700 text-lg font-semibold">{processData.experience.general} SMLMV</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-900">Experiencia Específica</p>
                  <p className="text-green-700 text-lg font-semibold">{processData.experience.specific} SMLMV</p>
                </div>
              </div>
            </div>

            {/* Classifier Codes */}
            {processData.experience.classifierCodes && processData.experience.classifierCodes.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Códigos Clasificadores Requeridos</h4>
                <div className="flex flex-wrap gap-2">
                  {processData.experience.classifierCodes.map((code, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Specific Experience */}
            {processData.experience.additionalSpecific && processData.experience.additionalSpecific.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Experiencia Específica Adicional</h4>
                <div className="space-y-3">
                  {processData.experience.additionalSpecific.map((exp, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg">
                      <p className="font-medium text-purple-900">{exp.name}</p>
                      <p className="text-purple-700">
                        <span className="font-semibold">{exp.value}</span> {exp.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {sortedProponents.map((proponent, index) => {
                const compliance = checkRequirementsCompliance(proponent);
                const { getPartnerExperiencePercentage, canPartnerReceiveDisabilityScore } = useExperienceCalculation(proponent);
                
                // Información sobre discapacidad
                const hasDisabilityScore = proponent.scoring.disabled > 0;
                const disabilityContributor = proponent.scoring.disabilityContributor;
                const disabilityContributorMeetsThreshold = disabilityContributor ? canPartnerReceiveDisabilityScore(disabilityContributor) : false;
                
                return (
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
                            {/* Compliance status */}
                            <div className="flex items-center space-x-1">
                              {compliance.overallCompliance ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Cumple requisitos</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">No cumple requisitos</span>
                                </div>
                              )}
                            </div>
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

                    {/* Información específica sobre discapacidad para proponentes plurales */}
                    {proponent.isPlural && hasDisabilityScore && disabilityContributor && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h5 className="text-sm font-semibold mb-2 text-blue-900">Información de Discapacidad</h5>
                        <div className="text-sm text-blue-800">
                          <p className="mb-1">
                            <span className="font-medium">Socio que aporta certificado:</span> {disabilityContributor}
                          </p>
                          <p className="mb-1">
                            <span className="font-medium">Experiencia aportada:</span> {getPartnerExperiencePercentage(disabilityContributor).toFixed(1)}%
                          </p>
                          <div className="flex items-center space-x-2">
                            {disabilityContributorMeetsThreshold ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`font-medium ${disabilityContributorMeetsThreshold ? 'text-green-700' : 'text-red-700'}`}>
                              {disabilityContributorMeetsThreshold ? 'Cumple' : 'No cumple'} el umbral del 40% de experiencia
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Requirements compliance details */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-semibold mb-2 flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Cumplimiento de Requisitos Habilitantes</span>
                      </h5>
                      
                      {/* Basic requirements */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                        <div className={`flex items-center space-x-1 ${compliance.generalExperience ? 'text-green-600' : 'text-red-600'}`}>
                          {compliance.generalExperience ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>Exp. General</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${compliance.specificExperience ? 'text-green-600' : 'text-red-600'}`}>
                          {compliance.specificExperience ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>Exp. Específica</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${compliance.professionalCard ? 'text-green-600' : 'text-red-600'}`}>
                          {compliance.professionalCard ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>Tarj. Profesional</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${compliance.rupComplies ? 'text-green-600' : 'text-red-600'}`}>
                          {compliance.rupComplies ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>RUP Vigente</span>
                        </div>
                      </div>

                      {/* Additional specific requirements */}
                      {compliance.additionalSpecific.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2">Experiencia Específica Adicional:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {compliance.additionalSpecific.map((req, idx) => (
                              <div key={idx} className={`flex items-center justify-between p-2 rounded ${req.complies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <div className="flex items-center space-x-1">
                                  {req.complies ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  <span>{req.name}</span>
                                </div>
                                <span className="text-xs">{req.amount.toFixed(2)} / {req.required}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
