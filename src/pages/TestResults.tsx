import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionWithAnswer {
  pregunta: string;
  respuesta: number;
}

interface ResultData {
  testName: string;
  fechaCompletado: string;
  promedio: number;
  respuestas: QuestionWithAnswer[];
  observaciones: string | null;
}

const TestResults = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const { toast } = useToast();
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [assignmentId]);

  const loadResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from('asignaciones_tests')
        .select(`
          fecha_completado,
          observaciones_psicologo,
          tests_psicologicos (nombre)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      const { data: respuestas, error: respuestasError } = await supabase
        .from('respuestas_tests')
        .select(`
          valor_numerico,
          preguntas_test (texto)
        `)
        .eq('asignacion_id', assignmentId)
        .order('pregunta_id');

      if (respuestasError) throw respuestasError;

      const respuestasFormateadas: QuestionWithAnswer[] = respuestas.map(r => ({
        pregunta: r.preguntas_test.texto,
        respuesta: r.valor_numerico || 0
      }));

      const suma = respuestasFormateadas.reduce((acc, r) => acc + r.respuesta, 0);
      const promedio = respuestasFormateadas.length > 0 
        ? suma / respuestasFormateadas.length 
        : 0;

      setResults({
        testName: assignment.tests_psicologicos.nombre,
        fechaCompletado: assignment.fecha_completado || '',
        promedio,
        respuestas: respuestasFormateadas,
        observaciones: assignment.observaciones_psicologo
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados",
        variant: "destructive"
      });
      navigate('/paciente/tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando resultados...</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const getInterpretation = (promedio: number) => {
    if (promedio <= 1.5) return { label: "Bajo", color: "bg-green-500" };
    if (promedio <= 2.5) return { label: "Leve", color: "bg-blue-500" };
    if (promedio <= 3.5) return { label: "Moderado", color: "bg-yellow-500" };
    if (promedio <= 4.5) return { label: "Alto", color: "bg-orange-500" };
    return { label: "Muy Alto", color: "bg-red-500" };
  };

  const interpretation = getInterpretation(results.promedio);
  const percentage = (results.promedio / 5) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/paciente/tests')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resultados</h1>
            <p className="text-sm text-primary-foreground/80">{results.testName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Resumen general */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Puntuación Promedio</CardTitle>
                <CardDescription>
                  Completado el {new Date(results.fechaCompletado).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={interpretation.color}>
                {interpretation.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-primary">
                {results.promedio.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">de 5.0</div>
            </div>
            <Progress value={percentage} className="h-4" />
          </CardContent>
        </Card>

        {/* Observaciones del psicólogo */}
        {results.observaciones && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Observaciones del Psicólogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{results.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {/* Respuestas detalladas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Respuestas Detalladas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.respuestas.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium flex-1">{item.pregunta}</p>
                  <Badge variant="outline">{item.respuesta}/5</Badge>
                </div>
                <Progress value={(item.respuesta / 5) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Nota sobre IA */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            🤖 Pronto: Análisis potenciado por IA con recomendaciones personalizadas
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TestResults;