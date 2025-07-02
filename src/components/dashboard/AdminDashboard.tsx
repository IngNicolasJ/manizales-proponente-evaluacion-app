
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllProcessData, useAllProponents, useProcessData, useProponents } from '@/hooks/useSupabaseData';
import { useAppStore } from '@/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, TrendingUp, Award, Eye, Play, Plus, Trash2, Share2, Globe, Filter } from 'lucide-react';
import { ProcessDetailModal } from './ProcessDetailModal';
import { ProcessShareModal } from './ProcessShareModal';
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
import { formatLocalDate } from '@/utils/dateUtils';

const AdminDashboard = () => {
  const { data: allProcessData = [], isLoading: loadingProcesses, refetch: refetchAllProcesses } = useAllProcessData();
  const { data: allProponents = [], isLoading: loadingProponents } = useAllProponents();
  const { data: myProcessData = [], isLoading: loadingMyProcesses, refetch: refetchMyProcesses } = useProcessData();
  const { data: myProponents = [], isLoading: loadingMyProponents } = useProponents();
  const { setCurrentStep, resetProcess, setProcessData } = useAppStore();
  const { deleteProcess, markProcessAsShared, loading: managementLoading } = useProcessManagement();
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string>('todos');
  const navigate = useNavigate();

  const handleNewProcess = () => {
    resetProcess();
    setCurrentStep(1);
    navigate('/app');
  };

  const handleContinueProcess = (process: any) => {
    console.log('🔄 Continuing process:', process);
    
    localStorage.setItem('current_process_id', process.id);
    console.log('📝 Process ID establecido en localStorage:', process.id);
    
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

    const processProponents = myProponents.filter(p => p.process_data_id === process.id);
    
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

  const handleShareProcess = (process: any) => {
    setSelectedProcess(process);
    setIsShareModalOpen(true);
  };

  const handleDeleteClick = (process: any) => {
    setProcessToDelete(process);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!processToDelete) return;

    const success = await deleteProcess(processToDelete.id, processToDelete.process_number);
    if (success) {
      refetchMyProcesses();
      refetchAllProcesses();
    }
    
    setDeleteDialogOpen(false);
    setProcessToDelete(null);
  };

  const handleToggleSharing = async (process: any) => {
    const success = await markProcessAsShared(process.id, !process.is_shared);
    if (success) {
      refetchMyProcesses();
      refetchAllProcesses();
    }
  };

  // Obtener lista única de usuarios
  const uniqueUsers = Array.from(
    new Set(allProcessData.map(p => p.profiles?.email).filter(Boolean))
  ).map(email => {
    const process = allProcessData.find(p => p.profiles?.email === email);
    return {
      email,
      name: process?.profiles?.full_name || email?.split('@')[0] || 'Usuario desconocido'
    };
  });

  // Filtrar procesos según el usuario seleccionado
  const filteredProcesses = selectedUser === 'todos' 
    ? allProcessData 
    : allProcessData.filter(p => p.profiles?.email === selectedUser);

  // Calcular estadísticas generales
  const totalUsers = new Set(allProcessData.map(p => p.user_id)).size;
  const totalProcesses = allProcessData.length;
  const totalProponents = allProponents.length;
  const avgScore = allProponents.length 
    ? allProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / allProponents.length 
    : 0;

  // Datos para gráficos
  const userActivityData = allProcessData.reduce((acc, process) => {
    const userEmail = process.profiles?.email || 'Usuario desconocido';
    acc[userEmail] = (acc[userEmail] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(userActivityData).map(([email, count]) => ({
    usuario: email.split('@')[0],
    procesos: count
  }));

  const scoreDistribution = [
    { name: '0-25', value: allProponents.filter(p => Number(p.total_score) <= 25).length },
    { name: '26-50', value: allProponents.filter(p => Number(p.total_score) > 25 && Number(p.total_score) <= 50).length },
    { name: '51-75', value: allProponents.filter(p => Number(p.total_score) > 50 && Number(p.total_score) <= 75).length },
    { name: '76-100', value: allProponents.filter(p => Number(p.total_score) > 75).length }
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loadingProcesses || loadingProponents) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Resumen general de evaluaciones y usuarios</p>
          </div>
          <Button onClick={handleNewProcess} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Proceso</span>
          </Button>
        </div>

        {/* Mis Procesos como Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Procesos</CardTitle>
            <CardDescription>Procesos que he creado como administrador</CardDescription>
          </CardHeader>
          <CardContent>
            {myProcessData.length === 0 ? (
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
                    <TableHead>Valor Contrato</TableHead>
                    <TableHead>Proponentes</TableHead>
                    <TableHead>Puntaje Promedio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myProcessData.map((process) => {
                    const processProponents = myProponents.filter(p => p.process_data_id === process.id);
                    const avgScore = processProponents.length 
                      ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
                      : 0;
                    
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
                            {process.is_shared && (
                              <Globe className="w-4 h-4 text-blue-500" aria-label="Proceso compartido" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatLocalDate(process.closing_date)}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(process.total_contract_value) || 0)}
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
                              onClick={() => handleToggleSharing(process)}
                              disabled={managementLoading}
                              className="flex items-center space-x-1"
                            >
                              <Globe className="w-4 h-4" />
                              <span>{process.is_shared ? 'Privado' : 'Compartir'}</span>
                            </Button>
                            {process.is_shared && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShareProcess(process)}
                                className="flex items-center space-x-1"
                              >
                                <Share2 className="w-4 h-4" />
                                <span>Gestionar</span>
                              </Button>
                            )}
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

        {/* Métricas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios que han creado evaluaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Procesos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProcesses}</div>
              <p className="text-xs text-muted-foreground">
                Procesos registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proponentes</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProponents}</div>
              <p className="text-xs text-muted-foreground">
                Proponentes evaluados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntaje Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Promedio general de puntuaciones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad por Usuario</CardTitle>
              <CardDescription>Número de procesos creados por cada usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="usuario" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="procesos" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Puntajes</CardTitle>
              <CardDescription>Rangos de puntuación de proponentes</CardDescription>
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

        {/* Tabla de procesos del sistema con filtro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Todos los Procesos del Sistema</span>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los usuarios</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user.email} value={user.email || ''}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedUser === 'todos' 
                ? 'Mostrando todos los procesos del sistema' 
                : `Mostrando procesos de ${uniqueUsers.find(u => u.email === selectedUser)?.name}`
              } ({filteredProcesses.length} procesos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proceso</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha de Cierre</TableHead>
                  <TableHead>Valor del Contrato</TableHead>
                  <TableHead>Proponentes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.slice(0, 15).map((process) => {
                  const proponentCount = allProponents.filter(p => p.process_data_id === process.id).length;
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
                          {process.is_shared && (
                            <Globe className="w-4 h-4 text-blue-500" aria-label="Proceso compartido" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {process.profiles?.full_name || process.profiles?.email?.split('@')[0] || 'N/A'}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {process.profiles?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatLocalDate(process.closing_date)}</TableCell>
                      <TableCell>
                        {process.total_contract_value 
                          ? formatCurrency(Number(process.total_contract_value))
                          : 'No definido'
                        }
                      </TableCell>
                      <TableCell>{proponentCount}</TableCell>
                      <TableCell>
                        <Badge variant={proponentCount > 0 ? "default" : "secondary"}>
                          {proponentCount > 0 ? "Con Evaluaciones" : "Sin Evaluaciones"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProcess(process)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredProcesses.length > 15 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Mostrando 15 de {filteredProcesses.length} procesos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Detail Modal */}
        <ProcessDetailModal
          process={selectedProcess}
          proponents={allProponents}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />

        {/* Process Share Modal */}
        <ProcessShareModal
          process={selectedProcess}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onUpdate={() => {
            refetchMyProcesses();
            refetchAllProcesses();
          }}
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

export default AdminDashboard;
