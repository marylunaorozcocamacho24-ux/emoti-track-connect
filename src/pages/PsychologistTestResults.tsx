import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, TrendingUp } from "lucide-react";

interface PatientResult {
  id: string;
  paciente_id: string;
  completado: boolean;
  fecha_completado: string | null;
  observaciones_psicologo: string | null;
  promedio: number;
  users: {
    nombre: string;
  };
  respuestas: Array<{
    pregunta: string;
    respuesta: number;
  }>;
}

const PsychologistTestResults = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const [testName, setTestName] = useState("");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingObservations, setEditingObservations] = useState<Map<string, string>>(new Map());
  const [savingObservations, setSavingObservations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadResults();
  }, [testId]);

  const loadResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data: test, error: testError } = await supabase
        .from('tests_psicologicos')
        .select('nombre')
        .eq('id', testId)
        .single();

      if (testError) throw testError;
      setTestName(test.nombre);

      const { data: assignments, error: assignmentsError } = await supabase
        .from('asignaciones_tests')
        .select('*')
        .eq('test_id', testId)
        .eq('psicologo_id', user.id)
        .eq('completado', true);

      if (assignmentsError) throw assignmentsError;

      const resultsWithDetails = await Promise.all(
        (assignments || []).map(async (assignment) => {
          // Obtener nombre del paciente
          const { data: patientData } = await supabase
            .from('users')
            .select('nombre')
            .eq('id', assignment.paciente_id)
            .single();

          const { data: respuestas, error: respuestasError } = await supabase
            .from('respuestas_tests')
            .select(`
              valor_numerico,
              preguntas_test (texto)
            `)
            .eq('asignacion_id', assignment.id);

          if (respuestasError) throw respuestasError;

          const respuestasFormateadas = respuestas.map(r => ({
            pregunta: r.preguntas_test.texto,
            respuesta: r.valor_numerico || 0
          }));

          const suma = respuestasFormateadas.reduce((acc, r) => acc + r.respuesta, 0);
          const promedio = respuestasFormateadas.length > 0 ? suma / respuestasFormateadas.length : 0;

          return {
            id: assignment.id,
            paciente_id: assignment.paciente_id,
            completado: assignment.completado,
            fecha_completado: assignment.fecha_completado,
            observaciones_psicologo: assignment.observaciones_psicologo,
            promedio,
            users: { nombre: patientData?.nombre || 'Paciente' },
            respuestas: respuestasFormateadas
          };
        })
      );

      setResults(resultsWithDetails);
      
      const initialObservations = new Map();
      resultsWithDetails.forEach(result => {
        initialObservations.set(result.id, result.observaciones_psicologo || '');
      });
      setEditingObservations(initialObservations);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados",
        variant: "destructive"
      });
      navigate('/psicologo/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObservations = async (assignmentId: string) => {
    const observations = editingObservations.get(assignmentId) || '';
    
    setSavingObservations(new Set([...savingObservations, assignmentId]));

    try {
      const { error } = await supabase
        .from('asignaciones_tests')
        .update({ observaciones_psicologo: observations })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Guardado",
        description: "Observaciones actualizadas correctamente"
      });

      // Actualizar en estado local
      setResults(results.map(r => 
        r.id === assignmentId 
          ? { ...r, observaciones_psicologo: observations }
          : r
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las observaciones",
        variant: "destructive"
      });
    } finally {
      setSavingObservations(new Set([...savingObservations].filter(id => id !== assignmentId)));
    }
  };

  const getInterpretation = (promedio: number) => {
    if (promedio <= 1.5) return { label: "Bajo", color: "bg-green-500" };
    if (promedio <= 2.5) return { label: "Leve", color: "bg-blue-500" };
    if (promedio <= 3.5) return { label: "Moderado", color: "bg-yellow-500" };
    if (promedio <= 4.5) return { label: "Alto", color: "bg-orange-500" };
    return { label: "Muy Alto", color: "bg-red-500" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/psicologo/tests')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resultados de Pacientes</h1>
            <p className="text-sm text-primary-foreground/80">{testName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aún no hay pacientes que hayan completado este test
              </p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => {
            const interpretation = getInterpretation(result.promedio);
            const percentage = (result.promedio / 5) * 100;
            const isSaving = savingObservations.has(result.id);

            return (
              <Card key={result.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{result.users.nombre}</CardTitle>
                        <CardDescription>
                          Completado el {new Date(result.fecha_completado!).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={interpretation.color}>
                      {interpretation.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Puntuación general */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Puntuación Promedio</span>
                      <span className="text-2xl font-bold text-primary">
                        {result.promedio.toFixed(1)}/5.0
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>

                  {/* Respuestas detalladas */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Respuestas Detalladas</h4>
                    </div>
                    <div className="space-y-3">
                      {result.respuestas.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm flex-1">{item.pregunta}</p>
                            <Badge variant="outline">{item.respuesta}/5</Badge>
                          </div>
                          <Progress value={(item.respuesta / 5) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observaciones del psicólogo */}
                  <div className="space-y-3">
                    <Label htmlFor={`obs-${result.id}`} className="text-base font-semibold">
                      Observaciones Clínicas
                    </Label>
                    <Textarea
                      id={`obs-${result.id}`}
                      value={editingObservations.get(result.id) || ''}
                      onChange={(e) => {
                        const newMap = new Map(editingObservations);
                        newMap.set(result.id, e.target.value);
                        setEditingObservations(newMap);
                      }}
                      placeholder="Escribe tus observaciones sobre los resultados del paciente..."
                      rows={4}
                      className="resize-none"
                    />
                    <Button
                      onClick={() => handleSaveObservations(result.id)}
                      disabled={isSaving}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Guardando...' : 'Guardar Observaciones'}
                    </Button>
                  </div>

                  {/* Nota sobre IA */}
                  <div className="bg-muted/30 p-3 rounded-lg text-center text-sm text-muted-foreground border-2 border-dashed">
                    🤖 Próximamente: Análisis automático con IA y sugerencias de intervención
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
};

export default PsychologistTestResults;