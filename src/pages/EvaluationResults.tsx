import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, Brain, Lightbulb, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface EvaluationResult {
  testName: string;
  score: number;
  maxScore: number;
  answers: string[];
}

const EvaluationResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  const result = location.state as EvaluationResult;
  
  if (!result) {
    navigate('/paciente');
    return null;
  }

  const { testName, score, maxScore } = result;
  const percentage = (score / maxScore) * 100;

  // Scientific interpretation and suggestions
  const getInterpretation = () => {
    if (testName === 'PHQ-2') {
      if (score >= 3) return {
        level: 'Alto',
        color: 'bg-emotion-anxious',
        textColor: 'text-emotion-anxious',
        description: 'Posibles síntomas depresivos detectados',
        suggestion: 'Es importante hablar con tu psicólogo sobre cómo te has sentido últimamente. Mientras tanto, intenta mantener una rutina diaria y realiza actividades que antes disfrutabas, aunque sea por períodos cortos.'
      };
      if (score >= 1) return {
        level: 'Moderado',
        color: 'bg-emotion-sad',
        textColor: 'text-emotion-sad',
        description: 'Algunos síntomas presentes',
        suggestion: 'Nota algunas señales que vale la pena atender. Considera practicar técnicas de relajación y asegúrate de mantener conexiones sociales positivas.'
      };
      return {
        level: 'Bajo',
        color: 'bg-emotion-calm',
        textColor: 'text-emotion-calm',
        description: 'Estado de ánimo estable',
        suggestion: 'Excelente. Continúa con las actividades que te hacen sentir bien y mantén tus hábitos saludables.'
      };
    }
    
    if (testName === 'GAD-2') {
      if (score >= 3) return {
        level: 'Alto',
        color: 'bg-emotion-anxious',
        textColor: 'text-emotion-anxious',
        description: 'Niveles elevados de ansiedad',
        suggestion: 'Los síntomas de ansiedad pueden ser muy manejables con las técnicas adecuadas. Practica la respiración diafragmática: inhala por 4 segundos, mantén por 4, exhala por 6. Repite este ciclo 5 veces cuando te sientas ansioso.'
      };
      if (score >= 1) return {
        level: 'Moderado',
        color: 'bg-emotion-sad',
        textColor: 'text-emotion-sad',
        description: 'Ansiedad presente',
        suggestion: 'Es normal sentir ansiedad ocasional. Identifica qué situaciones la desencadenan y practica técnicas de relajación muscular progresiva.'
      };
      return {
        level: 'Bajo',
        color: 'bg-emotion-calm',
        textColor: 'text-emotion-calm',
        description: 'Ansiedad mínima',
        suggestion: 'Buen manejo del estrés. Sigue utilizando las estrategias que te funcionan para mantener la calma.'
      };
    }

    // PANAS
    const positiveScore = score; // Simplified for demo
    if (positiveScore >= 15) return {
      level: 'Alto',
      color: 'bg-emotion-happy',
      textColor: 'text-emotion-happy',
      description: 'Afecto positivo elevado',
      suggestion: 'Fantástico estado emocional. Tu energía positiva es un recurso valioso. Considera compartir actividades que te generen bienestar con otros.'
    };
    if (positiveScore >= 10) return {
      level: 'Moderado',
      color: 'bg-emotion-calm',
      textColor: 'text-emotion-calm',
      description: 'Afecto equilibrado',
      suggestion: 'Balance saludable. Busca pequeñas actividades que aumenten tu bienestar: escuchar música, caminar en la naturaleza, o conectar con seres queridos.'
    };
    return {
      level: 'Bajo',
      color: 'bg-emotion-sad',
      textColor: 'text-emotion-sad',
      description: 'Afecto positivo disminuido',
      suggestion: 'Es comprensible pasar por momentos así. Intenta realizar una actividad pequeña y agradable hoy, como tomar un baño relajante o llamar a un amigo.'
    };
  };

  const interpretation = getInterpretation();

  useEffect(() => {
    // Show suggestion after a brief delay for better UX
    const timer = setTimeout(() => setShowSuggestion(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6 text-center">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">Resultados de Hoy</h1>
        <p className="text-muted text-sm">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Score Card */}
        <Card className="card-soft text-center">
          <div className="mb-4">
            <Badge variant="outline" className="mb-3">
              {testName}
            </Badge>
            <div className="space-y-4">
              <div className="relative">
                <div className="text-4xl font-bold text-primary mb-2">
                  {score}/{maxScore}
                </div>
                <Progress value={percentage} className="h-3 mb-2" />
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${interpretation.color} text-white`}>
                <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
                {interpretation.level}
              </div>
              
              <p className="text-muted text-sm">
                {interpretation.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Scientific Suggestion */}
        {showSuggestion && (
          <Card className="card-soft bg-gradient-to-br from-lavender/10 to-soft-pink/10 border-lavender/30">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-2">Sugerencia personalizada</h3>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {interpretation.suggestion}
                </p>
                <Badge variant="outline" className="text-xs">
                  Basado en evidencia científica
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Acciones recomendadas
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start pill-button border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => navigate('/tecnicas-relajacion')}
            >
              <span className="mr-2">🧘‍♀️</span>
              Practicar técnica de respiración
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start pill-button border-secondary/30 text-secondary hover:bg-secondary/10"
              onClick={() => navigate('/notas-diarias')}
            >
              <span className="mr-2">📝</span>
              Escribir en mi diario emocional
            </Button>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/historial')}
            className="pill-button flex-1 border-muted text-muted hover:bg-muted/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Ver historial
          </Button>
          
          <Button
            onClick={() => navigate('/paciente')}
            className="pill-button flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Home className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </div>

        {/* Next evaluation reminder */}
        <div className="text-center p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-muted">
            💚 Próxima evaluación mañana a las 9:00 AM
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResults;