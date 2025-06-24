
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProcessData, useProponents, useUserStats } from '@/hooks/useSupabaseData';
import { useAppStore } from '@/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Award, Eye, Play, Plus, Globe, Trash2 } from 'lucide-react';
import { ProcessDetailModal } from './ProcessDetailModal';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useProcessManagement } from '@/hooks/useProcessManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UserDashboard = () => {
  const { data: processData = [], isLoading: loadingProcesses, refetch: refetchProcesses } = useProcessData();
  const { data: proponentsData = [], isLoading: loadingProponents } = useProponents();
  const { data: userStats, isLoading: loadingStats } = useUserStats();
  const { setCurrentStep, resetProcess, setProcessData } = useAppStore();
  const { deleteProcess, loading: managementLoading } = useProcessManagement();
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<any>(null);
  const navigate = useNavigate();

  const handleNewProcess = () => {
    resetProcess();
    setCurrentStep(1);
    navigate('/app');
  };

  const handleContinueProcess = (process: any) => {
    console.log('🔄 Continuing process:', process);
    
    // IMPORTANTE: Establecer el process_id ANTES de cargar los datos
    localStorage.setItem('current_process_id', process.id);
    
    // Cargar los datos del proceso en el store con valores reales
    setProcessData({
      processNumber: process.process_number,
      processObject: process.process_name,
      closingDate: process.closing_date,
      totalContractValue: Number(process.total_contract_value) || 0,
      minimumSalary: Number(process.minimum_salary) || 0,
      processType: 'licitacion',
      scoring: process.scoring_criteria || {},
      experience: process.experience || {}
    });

    // Obtener los proponentes de este proceso
    const processProponents = proponentsData.filter(p => p.process_data_id === process.id);
    
    // Si hay proponentes, ir al paso 4 (resumen), si no, ir al paso 2 (agregar proponentes)
    if (processProponents.length > 0) {
      setCurrentStep(4);
    } else {
      setCurrentStep(2);
    }
    
    navigate('/app');
  };

  const handleViewProcess = (process: any) => {
    setSelectedProcess(process);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (process: any) => {
    setProcessToDelete(process);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    const success = await deleteProcess(processToDelete.id, processToDelete.process_number);
    if (success) {
      refetchProcesses();
    }
    
    setDeleteDialogOpen(false);
    setProcessToDelete(null);
  };

  // Función para formatear valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Separar procesos propios de compartidos
  const ownProcesses = processData.filter(p => !p.is_shared);
  const sharedProcesses = processData.filter(p => p.is_shared);

  // Datos para el gráfico de puntajes por proceso
  const processScoreData = processData.map(process => {
    const processProponents = proponentsData.filter(p => p.process_data_id === process.id);
    const avgScore = processProponents.length 
      ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
      : 0;
    
    return {
      proceso: process.process_number,
      puntaje: Math.round(avgScore * 10) / 10
    };
  });

  // Distribución de puntajes
  const scoreDistribution = [
    { name: '0-25', value: proponentsData.filter(p => Number(p.total_score) <= 25).length },
    { name: '26-50', value: proponentsData.filter(p => Number(p.total_score) > 25 && Number(p.total_score) <= 50).length },
    { name: '51-75', value: proponentsData.filter(p => Number(p.total_score) > 50 && Number(p.total_score) <= 75).length },
    { name: '76-100', value: proponentsData.filter(p => Number(p.total_score) > 75).length }
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  if (loadingProcesses || loadingProponents || loadingStats) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tus evaluaciones y procesos</p>
          </div>
          <Button onClick={handleNewProcess} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Proceso</span>
          </Button>
        </div>

        {/* Estadísticas del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Procesos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalProcesses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Procesos creados por ti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proponentes Evaluados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalProponents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de evaluaciones realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntaje Promedio</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.avgScore || 0}</div>
              <p className="text-xs text-muted-foreground">
                Promedio de puntuaciones otorgadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mis Procesos */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Procesos</CardTitle>
            <CardDescription>Procesos que has creado</CardDescription>
          </CardHeader>
          <CardContent>
            {ownProcesses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No tienes procesos creados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando tu primer proceso de evaluación
                </p>
                <Button onClick={handleNewProcess}>Crear Primer Proceso</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proceso</TableHead>
                    <TableHead>Fecha de Cierre</TableHead>
                    <TableHead>Valor del Contrato</TableHead>
                    <TableHead>Proponentes</TableHead>
                    <TableHead>Puntaje Promedio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownProcesses.map((process) => {
                    const processProponents = proponentsData.filter(p => p.process_data_id === process.id);
                    const avgScore = processProponents.length 
                      ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
                      : 0;
                    
                    return (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">Proceso {process.process_number}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {process.process_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {process.closing_date 
                            ? new Date(process.closing_date).toLocaleDateString('es-CO')
                            : 'No definida'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {process.total_contract_value 
                              ? formatCurrency(Number(process.total_contract_value))
                              : 'No definido'
                            }
                          </div>
                        </TableCell>
                        <TableCell>{processProponents.length}</TableCell>
                        <TableCell>{avgScore.toFixed(1)} pts</TableCell>
                        <TableCell>
                          <Badge variant={processProponents.length > 0 ? "default" : "secondary"}>
                            {processProponents.length > 0 ? "Con Evaluaciones" : "Sin Evaluaciones"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleContinueProcess(process)}
                              className="flex items-center space-x-1"
                            >
                              <Play className="w-4 h-4" />
                              <span>Continuar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProcess(process)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Ver</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(process)}
                              disabled={managementLoading}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Procesos Compartidos Conmigo */}
        {sharedProcesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Procesos Compartidos Conmigo</span>
              </CardTitle>
              <CardDescription>Procesos en los que tienes acceso para evaluación</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proceso</TableHead>
                    <TableHead>Fecha de Cierre</TableHead>
                    <TableHead>Valor del Contrato</TableHead>
                    <TableHead>Mis Evaluaciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedProcesses.map((process) => {
                    const myEvaluations = proponentsData.filter(p => p.process_data_id === process.id);
                    
                    return (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="font-semibold">Proceso {process.process_number}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {process.process_name}
                              </div>
                            </div>
                            <Globe className="w-4 h-4 text-blue-500" title="Proceso compartido" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {process.closing_date 
                            ? new Date(process.closing_date).toLocaleDateString('es-CO')
                            : 'No definida'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {process.total_contract_value 
                              ? formatCurrency(Number(process.total_contract_value))
                              : 'No definido'
                            }
                          </div>
                        </TableCell>
                        <TableCell>{myEvaluations.length}</TableCell>
                        <TableCell>
                          <Badge variant={myEvaluations.length > 0 ? "default" : "secondary"}>
                            {myEvaluations.length > 0 ? "Con Mis Evaluaciones" : "Sin Evaluar"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleContinueProcess(process)}
                              className="flex items-center space-x-1"
                            >
                              <Play className="w-4 h-4" />
                              <span>{myEvaluations.length > 0 ? 'Continuar' : 'Evaluar'}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProcess(process)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Ver</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Gráficos - solo mostrar si hay datos */}
        {processData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Puntajes por Proceso</CardTitle>
                <CardDescription>Puntaje promedio de cada proceso</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="proceso" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="puntaje" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Puntajes</CardTitle>
                <CardDescription>Rangos de puntuación de tus evaluaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Process Detail Modal */}
        <ProcessDetailModal
          process={selectedProcess}
          proponents={proponentsData}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar proceso?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente el proceso "{processToDelete?.process_number}" 
                y todos los proponentes asociados. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default UserDashboard;
