
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, BarChart3, Settings, ArrowRight, Star, Shield, Clock } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Settings,
      title: "Configuración del proceso",
      description: "Configure los parámetros básicos del proceso de contratación, incluyendo puntajes y requisitos de experiencia."
    },
    {
      icon: BarChart3,
      title: "Evaluación de puntajes",
      description: "Evalúe y puntúe a los proponentes según los criterios establecidos en el pliego de condiciones."
    },
    {
      icon: CheckSquare,
      title: "Verificación de requisitos",
      description: "Verifique el cumplimiento de requisitos habilitantes y experiencia de cada proponente."
    },
    {
      icon: FileText,
      title: "Resumen consolidado",
      description: "Obtenga un resumen completo de la evaluación con opciones de exportación a PDF y Excel."
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Evaluación precisa",
      description: "Sistema automatizado que reduce errores humanos en el proceso de evaluación"
    },
    {
      icon: Shield,
      title: "Transparencia total",
      description: "Registro detallado de todos los criterios y decisiones de evaluación"
    },
    {
      icon: Clock,
      title: "Ahorro de tiempo",
      description: "Automatiza cálculos y genera reportes instantáneos"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/cfad49f5-3e5e-4183-a35a-c449717caf3d.png" 
                  alt="Alcaldía de Manizales" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-foreground">Sistema de Evaluación</h1>
                <p className="text-sm text-muted-foreground">Alcaldía de Manizales</p>
              </div>
            </div>
            <Link to="/app">
              <Button className="flex items-center space-x-2">
                <span>Acceder al sistema</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              Sistema de evaluación oficial
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Sistema de Evaluación de 
              <span className="text-primary"> Proponentes</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Herramienta oficial de la Alcaldía de Manizales para evaluar proponentes en procesos de contratación pública. 
              Garantiza transparencia, precisión y cumplimiento normativo en cada evaluación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button size="lg" className="w-full sm:w-auto">
                  Comenzar evaluación
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver documentación
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Funcionalidades del sistema
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un flujo completo de evaluación que cubre todos los aspectos requeridos para la evaluación de proponentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Beneficios del sistema
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimice sus procesos de evaluación con herramientas diseñadas para la eficiencia y transparencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Proceso de evaluación
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Siga estos pasos simples para completar la evaluación de proponentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Configurar proceso", description: "Ingrese los datos básicos del proceso de contratación" },
              { step: 2, title: "Evaluar proponentes", description: "Asigne puntajes según los criterios establecidos" },
              { step: 3, title: "Verificar requisitos", description: "Valide el cumplimiento de requisitos habilitantes" },
              { step: 4, title: "Generar reporte", description: "Obtenga el resumen final y exporte los resultados" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                ¿Listo para comenzar?
              </CardTitle>
              <CardDescription className="text-lg mb-8">
                Acceda al sistema de evaluación y optimice su proceso de contratación pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/app">
                <Button size="lg" className="text-lg px-8 py-4">
                  Acceder al sistema
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/cfad49f5-3e5e-4183-a35a-c449717caf3d.png" 
                alt="Alcaldía de Manizales" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-semibold">Alcaldía de Manizales</span>
            </div>
            <p className="text-muted-foreground">
              Sistema de Evaluación de Proponentes - Transparencia en la contratación pública
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
