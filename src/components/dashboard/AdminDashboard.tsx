
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAllProcessData, useAllProponents, useProcessData, useProponents } from '@/hooks/useSupabaseData';
import { useAppStore } from '@/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, TrendingUp, Award, Eye, Play, Plus } from 'lucide-react';
import { ProcessDetailModal } from './ProcessDetailModal';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: allProcessData = [], isLoading: loadingProcesses } = useAllProcessData();
  const { data: allProponents = [], isLoading: loadingProponents } = useAllProponents();
  const { data: myProcessData = [], isLoading: loadingMyProcesses } = useProcessData();
  const { data: myProponents = [], isLoading: loadingMyProponents } = useProponents();
  const { setCurrentStep, resetProcess, setProcessData } = useAppStore();
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNewProcess = () => {
    resetProcess();
    setCurrentStep(1);
    navigate('/app');
  };

  const handleContinueProcess = (process: any) => {
    console.log('🔄 Continuing process:', process);
    
    // Cargar los datos del proceso en el store
    setProcessData({
      processNumber: process.process_number,
      processObject: process.process_name,
      closingDate: process.closing_date,
      totalContractValue: 0,
      minimumSalary: 0,
      processType: 'licitacion',
      scoring: process.scoring_criteria || {},
      experience: process.experience || {}
    });

    // Obtener los proponentes de este proceso
    const processProponents = myProponents.filter(p => p.process_data_id === process.id);
    
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

  if (loadingProcesses || loadingProponents) {
    return (
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
    );
  }

  return (
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
                        <div>
                          <div className="font-semibold">Proceso {process.process_number}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {process.process_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(process.closing_date).toLocaleDateString()}</TableCell>
                      <TableCell>{processProponents.length}</TableCell>
                      <TableCell>{avgScore.toFixed(1)} pts</TableCell>
                      <TableCell>
                        <Badge variant={processProponents.length > 0 ? "default" : "secondary"}>
                          {processProponents.length > 0 ? "Con Evaluaciones" : "Sin Evaluaciones"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
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

      {/* Tabla de procesos recientes de todos los usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Procesos del Sistema</CardTitle>
          <CardDescription>Últimos procesos creados por todos los usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proceso</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha de Cierre</TableHead>
                <TableHead>Proponentes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProcessData.slice(0, 10).map((process) => {
                const proponentCount = allProponents.filter(p => p.process_data_id === process.id).length;
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
                    <TableCell>{process.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>{new Date(process.closing_date).toLocaleDateString()}</TableCell>
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
        </CardContent>
      </Card>

      {/* Process Detail Modal */}
      <ProcessDetailModal
        process={selectedProcess}
        proponents={allProponents}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
