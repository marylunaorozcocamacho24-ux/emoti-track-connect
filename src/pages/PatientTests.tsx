import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface Assignment {
  id: string;
  test_id: string;
  completado: boolean;
  fecha_asignacion: string;
  fecha_completado: string | null;
  tests_psicologicos: {
    nombre: string;
    descripcion: string;
  };
}

const PatientTests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('asignaciones_tests')
        .select(`
          id,
          test_id,
          completado,
          fecha_asignacion,
          fecha_completado,
          tests_psicologicos (
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', user.id)
        .order('fecha_asignacion', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingTests = assignments.filter(a => !a.completado);
  const completedTests = assignments.filter(a => a.completado);
  const completionRate = assignments.length > 0 
    ? Math.round((completedTests.length / assignments.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/paciente')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mis Evaluaciones</h1>
            <p className="text-sm text-primary-foreground/80">
              Tests asignados por tu psicólogo
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Progreso general */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Tu Progreso</CardTitle>
            <CardDescription>
              Has completado {completedTests.length} de {assignments.length} evaluaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {completionRate}% completado
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Cargando evaluaciones...</p>
            </CardContent>
          </Card>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tienes evaluaciones asignadas aún
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tests pendientes */}
            {pendingTests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Pendientes ({pendingTests.length})
                </h2>
                {pendingTests.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {assignment.tests_psicologicos.nombre}
                          </CardTitle>
                          <CardDescription>
                            {assignment.tests_psicologicos.descripcion}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Pendiente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => navigate(`/paciente/tests/responder/${assignment.id}`)}
                        className="w-full"
                      >
                        Responder Ahora
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tests completados */}
            {completedTests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Completados ({completedTests.length})
                </h2>
                {completedTests.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {assignment.tests_psicologicos.nombre}
                          </CardTitle>
                          <CardDescription>
                            Completado el {new Date(assignment.fecha_completado!).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-500">Completado</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/paciente/tests/resultados/${assignment.id}`)}
                        className="w-full"
                      >
                        Ver Resultados
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Navigation userType="patient" />
    </div>
  );
};

export default PatientTests;