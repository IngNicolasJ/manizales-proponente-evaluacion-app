
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAllProcessData, useAllProponents } from '@/hooks/useSupabaseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, TrendingUp, Award } from 'lucide-react';

const AdminDashboard = () => {
  const { data: allProcessData = [], isLoading: loadingProcesses } = useAllProcessData();
  const { data: allProponents = [], isLoading: loadingProponents } = useAllProponents();

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Resumen general de evaluaciones y usuarios</p>
      </div>

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

      {/* Tabla de procesos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Procesos Recientes</CardTitle>
          <CardDescription>Últimos procesos creados en el sistema</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProcessData.slice(0, 10).map((process) => {
                const proponentCount = allProponents.filter(p => p.process_data_id === process.id).length;
                return (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{process.process_name}</div>
                        <div className="text-sm text-muted-foreground">{process.process_number}</div>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
