import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Edit, Trash2, AlertTriangle, CheckCircle, FileX, Eye, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Proponent } from '@/types';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';

export const ProponentsSummary: React.FC = () => {
  const { proponents, deleteProponent, processData, setCurrentStep } = useAppStore();
  const [selectedProponentForDetails, setSelectedProponentForDetails] = useState<Proponent | null>(null);

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

  const handleExportPDF = () => {
    try {
      exportToPDF(processData, proponents);
      toast({
        title: "Exportación a PDF",
        description: "El archivo PDF se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo generar el archivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(processData, proponents);
      toast({
        title: "Exportación a Excel",
        description: "El archivo Excel se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  const handleEditProponent = (proponentId: string) => {
    setCurrentStep(2);
    toast({
      title: "Editar proponente",
      description: "Redirigiendo a la vista de evaluación...",
    });
  };

  const handleDeleteProponent = (proponentId: string, proponentName: string) => {
    deleteProponent(proponentId);
    toast({
      title: "Proponente eliminado",
      description: `${proponentName} ha sido eliminado del proceso.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (proponent: any) => {
    if (proponent.needsSubsanation) {
      return <Badge variant="destructive">SUBSANAR</Badge>;
    }
    return <Badge variant="default" className="bg-success text-success-foreground">CUMPLE</Badge>;
  };

  const getComplianceBadge = (complies: boolean) => {
    return complies ? (
      <div className="flex items-center space-x-1">
        <CheckCircle className="w-4 h-4 text-success" />
        <span className="text-success font-medium">Sí</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-destructive font-medium">No</span>
      </div>
    );
  };

  const maxScore = Object.values(processData.scoring).reduce((a, b) => a + b, 0);

  const ComplianceDetailsDialog: React.FC<{ proponent: Proponent }> = ({ proponent }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="w-4 h-4 mr-2" />
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de cumplimiento - {proponent.name}</DialogTitle>
          <DialogDescription>
            Información detallada sobre el cumplimiento de requisitos habilitantes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Estado general */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Estado general</h4>
              {getStatusBadge(proponent)}
            </div>
            {proponent.needsSubsanation && proponent.subsanationDetails && (
              <div className="mt-3">
                <h5 className="font-medium text-destructive mb-2">Motivos de subsanación:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {proponent.subsanationDetails.map((detail, index) => (
                    <li key={index} className="text-sm text-destructive">{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Requisitos habilitantes */}
          <div className="space-y-4">
            <h4 className="font-semibold">Requisitos habilitantes</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Experiencia general</span>
                  {getComplianceBadge(proponent.requirements.generalExperience)}
                </div>
                {!proponent.requirements.generalExperience && (
                  <p className="text-sm text-destructive mt-1">No cumple con la experiencia general requerida</p>
                )}
              </div>

              <div className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Experiencia específica</span>
                  {getComplianceBadge(proponent.requirements.specificExperience)}
                </div>
                {!proponent.requirements.specificExperience && (
                  <p className="text-sm text-destructive mt-1">No cumple con la experiencia específica requerida</p>
                )}
              </div>

              <div className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tarjeta profesional</span>
                  {getComplianceBadge(proponent.requirements.professionalCard)}
                </div>
                {!proponent.requirements.professionalCard && (
                  <p className="text-sm text-destructive mt-1">No aporta tarjeta profesional del ingeniero</p>
                )}
              </div>

              <div className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">RUP vigente</span>
                  {getComplianceBadge(proponent.rup.complies)}
                </div>
                {!proponent.rup.complies && (
                  <p className="text-sm text-destructive mt-1">RUP no se encuentra vigente</p>
                )}
              </div>
            </div>

            {/* Experiencia específica adicional */}
            {Array.isArray(proponent.requirements.additionalSpecificExperience) && 
             proponent.requirements.additionalSpecificExperience.map((experience, index) => {
              const processExperience = processData.experience.additionalSpecific[index];
              return (
                <div key={index} className="p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{experience.name}</span>
                    {getComplianceBadge(experience.complies)}
                  </div>
                  <div className="text-sm">
                    <p>Cantidad aportada: <span className="font-medium">{experience.amount}</span></p>
                    <p>Cantidad requerida: <span className="font-medium">{processExperience?.value || 0}</span></p>
                    {experience.comment && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-destructive font-medium">Comentario:</p>
                        <p className="text-destructive">{experience.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contratos aportados */}
          {proponent.contractors && proponent.contractors.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Contratos aportados</h4>
              <div className="space-y-3">
                {proponent.contractors.map((contractor, index) => (
                  <div key={index} className="p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Contrato #{contractor.order}</span>
                      {getComplianceBadge(contractor.contractComplies)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Entidad contratante:</span>
                        <span className="ml-1 font-medium">{contractor.contractingEntity || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">No. contrato:</span>
                        <span className="ml-1 font-medium">{contractor.contractNumber || 'No especificado'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Objeto:</span>
                        <span className="ml-1 font-medium">{contractor.object || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="ml-1 font-medium">{contractor.contractType === 'public' ? 'Público' : 'Privado'}</span>
                      </div>
                      {contractor.contractType === 'private' && (
                        <div>
                          <span className="text-muted-foreground">Documentos privados:</span>
                          <span className="ml-1 font-medium">
                            {contractor.privateDocumentsComplete ? 'Completos' : 'Incompletos'}
                          </span>
                        </div>
                      )}
                    </div>
                    {!contractor.contractComplies && contractor.nonComplianceReason && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded">
                        <p className="text-destructive font-medium text-sm">Motivo de incumplimiento:</p>
                        <p className="text-destructive text-sm">{contractor.nonComplianceReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const ScoringDetailsDialog: React.FC<{ proponent: Proponent }> = ({ proponent }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de puntaje - {proponent.name}</DialogTitle>
          <DialogDescription>
            Criterios y puntajes otorgados al proponente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Emprendimiento mujer</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.womanEntrepreneurship.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.womanEntrepreneurship.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.womanEntrepreneurship && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.womanEntrepreneurship}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">MIPYME</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.mipyme.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.mipyme.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.mipyme && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.mipyme}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Discapacitado</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.disabled.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.disabled.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.disabled && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.disabled}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Factor de calidad</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.qualityFactor.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.qualityFactor.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.qualityFactor && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.qualityFactor}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Factor de calidad ambiental</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.environmentalQuality.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.environmentalQuality.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.environmentalQuality && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.environmentalQuality}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Apoyo a la industria nacional</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje obtenido:</span>
                <span className="font-medium">{proponent.scoring.nationalIndustrySupport.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Puntaje máximo:</span>
                <span className="text-sm">{processData.scoring.nationalIndustrySupport.toFixed(2)}</span>
              </div>
              {proponent.scoring.comments.nationalIndustrySupport && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Comentario:</strong> {proponent.scoring.comments.nationalIndustrySupport}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total obtenido:</span>
              <span>{proponent.totalScore.toFixed(2)} / {maxScore.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Resumen de proponentes</h2>
            <p className="text-muted-foreground">Vista consolidada del proceso de evaluación</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Información del proceso */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número del proceso</p>
              <p className="font-medium">{processData.processNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de cierre</p>
              <p className="font-medium">{new Date(processData.closingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor del contrato</p>
              <p className="font-medium">${processData.totalContractValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Puntaje máximo</p>
              <p className="font-medium">{maxScore.toFixed(2)} puntos</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Objeto del proceso</p>
            <p className="font-medium">{processData.processObject}</p>
          </div>
        </CardContent>
      </Card>

      {proponents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin proponentes registrados</h3>
              <p className="text-muted-foreground mb-4">
                No hay proponentes registrados en este proceso de evaluación.
              </p>
              <Button onClick={() => setCurrentStep(2)}>
                Registrar primer proponente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Evaluación de proponentes</CardTitle>
            <CardDescription>
              Resumen consolidado de {proponents.length} proponente(s) evaluado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proponente</TableHead>
                    <TableHead className="text-center">Puntaje Total</TableHead>
                    <TableHead className="text-center">Exp. General</TableHead>
                    <TableHead className="text-center">Exp. Específica</TableHead>
                    <TableHead className="text-center">Exp. Esp. Adicional</TableHead>
                    <TableHead className="text-center">Tarjeta Profesional</TableHead>
                    <TableHead className="text-center">RUP Vigente</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proponents.map((proponent) => {
                    const additionalComplies = Array.isArray(proponent.requirements.additionalSpecificExperience) 
                      ? proponent.requirements.additionalSpecificExperience.every(exp => exp.complies)
                      : true;
                    return (
                      <TableRow key={proponent.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{proponent.name}</div>
                            {proponent.isPlural && (
                              <div className="text-sm text-muted-foreground">
                                Proponente plural ({proponent.partners?.length || 0} socios)
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="font-bold text-lg">{proponent.totalScore.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">/ {maxScore.toFixed(2)}</span>
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((proponent.totalScore / maxScore) * 100, 100)}%` }}
                              />
                            </div>
                            <ScoringDetailsDialog proponent={proponent} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getComplianceBadge(proponent.requirements.generalExperience)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getComplianceBadge(proponent.requirements.specificExperience)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getComplianceBadge(additionalComplies)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getComplianceBadge(proponent.requirements.professionalCard)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getComplianceBadge(proponent.rup.complies)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center space-y-1">
                            {getStatusBadge(proponent)}
                            <ComplianceDetailsDialog proponent={proponent} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProponent(proponent.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProponent(proponent.id, proponent.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas del proceso */}
      {proponents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {proponents.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Proponentes evaluados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {proponents.filter(p => !p.needsSubsanation).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cumplen requisitos
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {proponents.filter(p => p.needsSubsanation).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Necesitan subsanación
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
