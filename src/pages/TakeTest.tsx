import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  orden: number;
  texto: string;
  opciones: string[];
}

interface Answer {
  pregunta_id: string;
  respuesta: string;
  valor_numerico: number;
}

const TakeTest = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const { toast } = useToast();
  const [testName, setTestName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, [assignmentId]);

  const loadTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from('asignaciones_tests')
        .select('test_id, tests_psicologicos(nombre)')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setTestName(assignment.tests_psicologicos.nombre);

      const { data: questionsData, error: questionsError } = await supabase
        .from('preguntas_test')
        .select('*')
        .eq('test_id', assignment.test_id)
        .order('orden');

      if (questionsError) throw questionsError;
      
      const formattedQuestions = (questionsData || []).map(q => ({
        id: q.id,
        orden: q.orden,
        texto: q.texto,
        opciones: Array.isArray(q.opciones) ? q.opciones as string[] : ["1", "2", "3", "4", "5"]
      }));
      
      setQuestions(formattedQuestions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el test",
        variant: "destructive"
      });
      navigate('/paciente/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, {
      pregunta_id: currentQuestion.id,
      respuesta: value,
      valor_numerico: parseInt(value)
    });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size !== questions.length) {
      toast({
        title: "Atención",
        description: "Por favor responde todas las preguntas",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Guardar respuestas
      const respuestas = Array.from(answers.values()).map(answer => ({
        asignacion_id: assignmentId,
        pregunta_id: answer.pregunta_id,
        paciente_id: user.id,
        respuesta: answer.respuesta,
        valor_numerico: answer.valor_numerico
      }));

      const { error: respuestasError } = await supabase
        .from('respuestas_tests')
        .insert(respuestas);

      if (respuestasError) throw respuestasError;

      // Marcar como completado
      const { error: updateError } = await supabase
        .from('asignaciones_tests')
        .update({
          completado: true,
          fecha_completado: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      toast({
        title: "¡Excelente!",
        description: "Tus respuestas han sido guardadas correctamente"
      });

      navigate(`/paciente/tests/resultados/${assignmentId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las respuestas",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando test...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion.id)?.respuesta;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{testName}</h1>
            <p className="text-sm text-primary-foreground/80">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.texto}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
              <div className="space-y-3">
                {currentQuestion.opciones.map((opcion, index) => {
                  const labels = ["Nada", "Poco", "Moderado", "Bastante", "Mucho"];
                  return (
                    <div
                      key={opcion}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleAnswer(opcion)}
                    >
                      <RadioGroupItem value={opcion} id={`option-${opcion}`} />
                      <Label
                        htmlFor={`option-${opcion}`}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {opcion} - {labels[index]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={!currentAnswer || submitting}
            className="flex-1"
          >
            {submitting ? 'Guardando...' : isLastQuestion ? 'Finalizar' : 'Siguiente'}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TakeTest;