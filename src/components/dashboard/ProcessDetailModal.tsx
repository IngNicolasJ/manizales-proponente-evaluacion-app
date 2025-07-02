
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, DollarSign, Users, Award } from 'lucide-react';
import { formatLocalDate } from '@/utils/dateUtils';

interface ProcessDetailModalProps {
  process: any;
  proponents: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessDetailModal: React.FC<ProcessDetailModalProps> = ({
  process,
  proponents,
  isOpen,
  onClose
}) => {
  if (!process) return null;

  const processProponents = proponents.filter(p => p.process_data_id === process.id);
  const avgScore = processProponents.length 
    ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Proceso {process.process_number}</span>
          </DialogTitle>
          <DialogDescription>
            Información completa del proceso de evaluación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica del proceso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Proceso</label>
                  <p className="text-lg font-semibold">{process.process_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Objeto del Proceso</label>
                  <p>{process.process_name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Cierre</label>
                    <p>{formatLocalDate(process.closing_date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor Total del Contrato</label>
                    <p>{process.total_contract_value ? formatCurrency(Number(process.total_contract_value)) : 'No definido'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salario Mínimo</label>
                    <p>{process.minimum_salary ? formatCurrency(Number(process.minimum_salary)) : 'No definido'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criterios de puntuación */}
          {process.scoring_criteria && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Criterios de Puntuación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Mujer Empresaria</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.womanEntrepreneurship || 0} pts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">MIPYME</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.mipyme || 0} pts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Discapacitado</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.disabled || 0} pts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Factor Calidad</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.qualityFactor || 0} pts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Calidad Ambiental</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.environmentalQuality || 0} pts</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Industria Nacional</p>
                    <p className="text-lg font-semibold">{process.scoring_criteria.nationalIndustrySupport || 0} pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiencia requerida */}
          {process.experience && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experiencia Requerida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {process.experience.general && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experiencia General</label>
                    <p>{process.experience.general}</p>
                  </div>
                )}
                {process.experience.specific && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experiencia Específica</label>
                    <p>{process.experience.specific}</p>
                  </div>
                )}
                {process.experience.additionalSpecific && process.experience.additionalSpecific.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experiencia Específica Adicional</label>
                    <div className="space-y-2 mt-2">
                      {process.experience.additionalSpecific.map((exp: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{exp.name}</span>
                          <Badge variant="outline">{exp.value} {exp.unit}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Estadísticas de proponentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Proponentes Evaluados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Proponentes</p>
                  <p className="text-2xl font-bold">{processProponents.length}</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Puntaje Promedio</p>
                  <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Mejor Puntaje</p>
                  <p className="text-2xl font-bold">
                    {processProponents.length > 0 
                      ? Math.max(...processProponents.map(p => Number(p.total_score))).toFixed(1)
                      : '0'
                    }
                  </p>
                </div>
              </div>

              {processProponents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Lista de Proponentes</h4>
                  <div className="space-y-2">
                    {processProponents.map((proponent) => (
                      <div key={proponent.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{proponent.number ? `${proponent.number}. ${proponent.name}` : proponent.name}</span>
                          {proponent.is_plural && (
                            <Badge variant="secondary" className="ml-2">Plural</Badge>
                          )}
                          {proponent.needs_subsanation && (
                            <Badge variant="destructive" className="ml-2">Subsanación</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{Number(proponent.total_score).toFixed(1)} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
