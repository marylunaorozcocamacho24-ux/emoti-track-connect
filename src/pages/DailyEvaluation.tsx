import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, CheckCircle } from "lucide-react";

// Scientific evaluation tests
const evaluationTests = {
  'PHQ-2': {
    name: 'PHQ-2',
    title: 'Evaluación de Estado de Ánimo',
    subtitle: 'Síntomas depresivos (últimas 2 semanas)',
    questions: [
      'Poco interés o placer en hacer cosas',
      'Se ha sentido decaído(a), deprimido(a) o sin esperanzas'
    ],
    options: [
      { value: '0', label: 'Para nada', score: 0 },
      { value: '1', label: 'Varios días', score: 1 },
      { value: '2', label: 'Más de la mitad de los días', score: 2 },
      { value: '3', label: 'Casi todos los días', score: 3 }
    ]
  },
  'GAD-2': {
    name: 'GAD-2',
    title: 'Evaluación de Ansiedad',
    subtitle: 'Síntomas ansiosos (últimas 2 semanas)',
    questions: [
      'Se ha sentido nervioso(a), ansioso(a) o muy tenso(a)',
      'No ha podido parar o controlar sus preocupaciones'
    ],
    options: [
      { value: '0', label: 'Para nada', score: 0 },
      { value: '1', label: 'Varios días', score: 1 },
      { value: '2', label: 'Más de la mitad de los días', score: 2 },
      { value: '3', label: 'Casi todos los días', score: 3 }
    ]
  },
  'PANAS': {
    name: 'PANAS-corta',
    title: 'Evaluación de Afecto',
    subtitle: 'Cómo se siente en este momento',
    questions: [
      '¿Se siente entusiasmado(a)?',
      '¿Se siente alerta?',
      '¿Se siente determinado(a)?',
      '¿Se siente angustiado(a)?',
      '¿Se siente alterado(a)?'
    ],
    options: [
      { value: '1', label: 'Muy poco o nada', score: 1 },
      { value: '2', label: 'Un poco', score: 2 },
      { value: '3', label: 'Moderadamente', score: 3 },
      { value: '4', label: 'Bastante', score: 4 },
      { value: '5', label: 'Extremadamente', score: 5 }
    ]
  }
};

const DailyEvaluation = () => {
  const navigate = useNavigate();
  const [currentTest] = useState<keyof typeof evaluationTests>('PHQ-2'); // Would rotate daily
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const test = evaluationTests[currentTest];
  const isLastQuestion = currentQuestion === test.questions.length - 1;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  const handleNext = () => {
    if (!currentAnswer) return;
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate score and navigate to results
      const totalScore = newAnswers.reduce((sum, answer, index) => {
        const score = test.options.find(opt => opt.value === answer)?.score || 0;
        return sum + score;
      }, 0);
      
      navigate('/resultados', { 
        state: { 
          testName: currentTest, 
          score: totalScore,
          answers: newAnswers,
          maxScore: test.questions.length * Math.max(...test.options.map(opt => opt.score))
        }
      });
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
          className="mb-4 text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary mb-1">{test.title}</h1>
          <p className="text-muted text-sm">{test.subtitle}</p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted mt-2">
              Pregunta {currentQuestion + 1} de {test.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-md mx-auto">
        <Card className="card-soft mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary mb-4 leading-relaxed">
              {test.questions[currentQuestion]}
            </h2>
            
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {test.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:bg-accent/10 transition-colors">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="border-primary text-primary"
                  />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 text-sm font-medium text-foreground cursor-pointer"
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
            className="pill-button flex-1 border-muted text-muted hover:bg-muted/10"
          >
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="pill-button flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              'Siguiente'
            )}
          </Button>
        </div>

        {/* Test Info */}
        <div className="mt-6 p-4 bg-muted/10 rounded-lg">
          <p className="text-xs text-muted text-center leading-relaxed">
            Esta evaluación toma menos de 1 minuto y ayuda a monitorear tu bienestar emocional de forma científica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyEvaluation;