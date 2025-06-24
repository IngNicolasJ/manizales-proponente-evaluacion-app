
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProcessData, useProponents, useUserStats } from '@/hooks/useSupabaseData';
import { useAppStore } from '@/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Users, TrendingUp, Plus } from 'lucide-react';

const UserDashboard = () => {
  const { data: processData = [], isLoading: loadingProcesses } = useProcessData();
  const { data: proponents = [], isLoading: loadingProponents } = useProponents();
  const { data: userStats } = useUserStats();
  const { setCurrentStep, resetProcess } = useAppStore();

  const handleNewProcess = () => {
    resetProcess();
    setCurrentStep(1);
  };

  // Datos para el gráfico de puntajes por proceso
  const processScoreData = processData.map(process => {
    const processProponents = proponents.filter(p => p.process_data_id === process.id);
    const avgScore = processProponents.length 
      ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
      : 0;
    
    return {
      proceso: process.process_number,
      puntaje: Math.round(avgScore * 100) / 100,
      proponentes: processProponents.length
    };
  });

  if (loadingProcesses || loadingProponents) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
          <p className="text-muted-foreground">Resumen de mis evaluaciones de procesos</p>
        </div>
        <Button onClick={handleNewProcess} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo Proceso</span>
        </Button>
      </div>

      {/* Métricas del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Procesos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalProcesses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Procesos que he creado
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.avgScore || 0}</div>
            <p className="text-xs text-muted-foreground">
              Promedio de mis evaluaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de puntajes por proceso */}
      {processScoreData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Puntajes por Proceso</CardTitle>
            <CardDescription>Puntaje promedio de proponentes por proceso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="proceso" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'puntaje' ? `${value} puntos` : `${value} proponentes`,
                    name === 'puntaje' ? 'Puntaje Promedio' : 'Proponentes'
                  ]}
                />
                <Bar dataKey="puntaje" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabla de mis procesos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Procesos</CardTitle>
          <CardDescription>Lista de todos los procesos que he creado</CardDescription>
        </CardHeader>
        <CardContent>
          {processData.length === 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {processData.map((process) => {
                  const processProponents = proponents.filter(p => p.process_data_id === process.id);
                  const avgScore = processProponents.length 
                    ? processProponents.reduce((sum, p) => sum + Number(p.total_score), 0) / processProponents.length 
                    : 0;
                  
                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{process.process_name}</div>
                          <div className="text-sm text-muted-foreground">{process.process_number}</div>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
