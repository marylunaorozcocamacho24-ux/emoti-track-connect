import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Combined PHQ-2 + GAD-2 test
const combinedTest = {
  name: 'PHQ-2 + GAD-2',
  title: 'Evaluación Emocional Combinada',
  subtitle: 'Estado de ánimo y ansiedad (últimas 2 semanas)',
  questions: [
    { text: 'Poco interés o placer en hacer cosas', type: 'PHQ-2' },
    { text: 'Se ha sentido decaído(a), deprimido(a) o sin esperanzas', type: 'PHQ-2' },
    { text: 'Se ha sentido nervioso(a), ansioso(a) o muy tenso(a)', type: 'GAD-2' },
    { text: 'No ha podido parar o controlar sus preocupaciones', type: 'GAD-2' }
  ],
  options: [
    { value: '0', label: 'Para nada', score: 0 },
    { value: '1', label: 'Varios días', score: 1 },
    { value: '2', label: 'Más de la mitad de los días', score: 2 },
    { value: '3', label: 'Casi todos los días', score: 3 }
  ]
};

const DailyEvaluation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const test = combinedTest;
  const isLastQuestion = currentQuestion === test.questions.length - 1;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  const handleNext = async () => {
    if (!currentAnswer) return;
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate separate scores for PHQ-2 and GAD-2
      const phq2Score = newAnswers.slice(0, 2).reduce((sum, answer) => {
        return sum + (test.options.find(opt => opt.value === answer)?.score || 0);
      }, 0);

      const gad2Score = newAnswers.slice(2, 4).reduce((sum, answer) => {
        return sum + (test.options.find(opt => opt.value === answer)?.score || 0);
      }, 0);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save PHQ-2
        await supabase.from('evaluaciones').insert({
          paciente_id: user.id,
          tipo_prueba: 'PHQ-2',
          resultado_numerico: phq2Score
        });

        // Save GAD-2
        await supabase.from('evaluaciones').insert({
          paciente_id: user.id,
          tipo_prueba: 'GAD-2',
          resultado_numerico: gad2Score
        });

        toast({
          title: "¡Evaluación completada!",
          description: "Tus resultados han sido guardados"
        });
      }
      
      navigate('/paciente');
    } else {
      setCurrentQuestion(prev => prev + 1);
      setCurrentAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || '');
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/paciente')}
          className="mb-4 text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-success to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">{test.title}</h1>
          <p className="text-muted text-sm mb-1">{test.subtitle}</p>
          <div className="inline-flex items-center gap-2 text-xs text-muted bg-muted/10 px-3 py-1 rounded-full">
            <span className="font-medium">{test.questions[currentQuestion].type}</span>
            <span>•</span>
            <span>Pregunta {currentQuestion + 1} de {test.questions.length}</span>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-3 bg-muted/20" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-md mx-auto">
        <Card className="card-soft mb-6 border-2 border-primary/10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary mb-6 leading-relaxed">
              {test.questions[currentQuestion].text}
            </h2>
            
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {test.options.map((option) => (
                <div 
                  key={option.value} 
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    currentAnswer === option.value 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border/30 hover:border-primary/30 hover:bg-primary/5"
                  )}
                  onClick={() => setCurrentAnswer(option.value)}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="border-primary text-primary"
                  />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 text-base font-medium text-foreground cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 rounded-xl border-primary/30 text-primary hover:bg-primary/5 h-12 font-semibold"
          >
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 bg-success hover:bg-success/90 text-white rounded-xl h-12 font-semibold shadow-md"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Finalizar
              </>
            ) : (
              'Siguiente'
            )}
          </Button>
        </div>

        {/* Test Info */}
        <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
          <p className="text-sm text-foreground/80 text-center leading-relaxed">
            💡 Esta evaluación científica combina <strong>PHQ-2</strong> (depresión) y <strong>GAD-2</strong> (ansiedad) en solo 4 preguntas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyEvaluation;