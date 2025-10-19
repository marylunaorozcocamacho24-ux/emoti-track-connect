import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Navigation } from "@/components/Navigation";
import EMIAssistant from "@/components/EMIAssistant";
import PsychologistSuggestions from "@/components/PsychologistSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, Heart, Brain, Zap, MessageCircle } from "lucide-react";

interface EmotionalTest {
  ansiedad: number;
  animo: number;
  estres: number;
}

const PatientDashboardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [showEMI, setShowEMI] = useState(false);
  const [emotionalState, setEmotionalState] = useState<string | undefined>();
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<EmotionalTest>({
    ansiedad: 5,
    animo: 5,
    estres: 5,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/");
      return;
    }

    setUser(session.user);

    const { data: userData } = await supabase
      .from("users")
      .select("nombre")
      .eq("id", session.user.id)
      .single();

    if (userData) {
      setUserName(userData.nombre);
    }
  };

  const handleTestChange = (field: keyof EmotionalTest, value: number[]) => {
    setTestResults(prev => ({ ...prev, [field]: value[0] }));
  };

  const calculateEmotionalState = () => {
    const avg = (testResults.ansiedad + (10 - testResults.animo) + testResults.estres) / 3;
    
    if (avg >= 7) return "stress";
    if (avg >= 5) return "sad";
    if (avg >= 3) return "calm";
    return "balanced";
  };

  const getBackgroundClass = () => {
    if (!testCompleted) return "";
    const state = calculateEmotionalState();
    return `emotion-bg-${state}`;
  };

  const getEmotionalColor = () => {
    if (!testCompleted) return "var(--muted)";
    const state = calculateEmotionalState();
    const colors = {
      stress: "var(--coral)",
      sad: "var(--pink-pastel)",
      calm: "var(--muted)",
      balanced: "var(--secondary)"
    };
    return colors[state as keyof typeof colors];
  };

  const getEmotionalMessage = () => {
    const state = calculateEmotionalState();
    const messages = {
      stress: "Detectamos altos niveles de estrés. Te recomendamos hablar con tu psicólogo y usar EMI para ejercicios de calma.",
      sad: "Parece que hoy no te sientes del todo bien. Recuerda que estamos aquí para apoyarte.",
      calm: "Tu estado emocional está en calma. ¡Sigue cuidándote!",
      balanced: "¡Excelente! Tu estado emocional está equilibrado."
    };
    return messages[state as keyof typeof messages];
  };

  const handleSubmitTest = async () => {
    if (!user) return;

    const puntajeTotal = Math.round((testResults.ansiedad + (10 - testResults.animo) + testResults.estres) / 3);
    const state = calculateEmotionalState();

    try {
      const { error } = await supabase.from("evaluaciones").insert({
        paciente_id: user.id,
        tipo_prueba: "test_emocional_diario",
        resultado_numerico: puntajeTotal,
        observacion: `Ansiedad: ${testResults.ansiedad}, Ánimo: ${testResults.animo}, Estrés: ${testResults.estres}`,
      });

      if (error) throw error;

      setTestCompleted(true);

      // Si hay alto nivel de ansiedad/estrés, activar EMI
      if (puntajeTotal >= 7) {
        setEmotionalState("high-anxiety");
        setTimeout(() => setShowEMI(true), 1000);
      }

      toast({
        title: "¡Resultados guardados correctamente!",
        description: "Tu psicólogo podrá ver tu evaluación emocional",
      });
    } catch (error) {
      console.error("Error saving test:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-all duration-1000 ${getBackgroundClass()}`}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Header */}
        <Card className="card-soft">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              ¡Hola{userName && `, ${userName}`}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {testCompleted ? getEmotionalMessage() : "¿Cómo te sientes hoy?"}
            </p>
          </div>
        </Card>

        {!testCompleted ? (
          <>
            {/* Emotional Test */}
            <Card className="card-soft space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">Test Emocional Rápido</h2>
                <p className="text-muted-foreground">
                  Evalúa cómo te sientes hoy (1 = Muy bajo, 10 = Muy alto)
                </p>
              </div>

              {/* Ansiedad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emotion-anxious" />
                    <span className="font-medium">Nivel de Ansiedad</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{testResults.ansiedad}</span>
                </div>
                <Slider
                  value={[testResults.ansiedad]}
                  onValueChange={(v) => handleTestChange("ansiedad", v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Ánimo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emotion-happy" />
                    <span className="font-medium">Nivel de Ánimo</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{testResults.animo}</span>
                </div>
                <Slider
                  value={[testResults.animo]}
                  onValueChange={(v) => handleTestChange("animo", v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Estrés */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-coral" />
                    <span className="font-medium">Nivel de Estrés</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{testResults.estres}</span>
                </div>
                <Slider
                  value={[testResults.estres]}
                  onValueChange={(v) => handleTestChange("estres", v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleSubmitTest}
                className="w-full pill-button bg-secondary hover:bg-secondary/90 text-white"
                size="lg"
              >
                Completar Test
              </Button>
            </Card>
          </>
        ) : (
          <>
            {/* Results Display */}
            <Card className="card-soft">
              <div className="text-center space-y-4">
                <div 
                  className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl"
                  style={{ backgroundColor: getEmotionalColor() }}
                >
                  {calculateEmotionalState() === "balanced" && <Smile className="w-20 h-20 text-white" />}
                  {calculateEmotionalState() === "calm" && <Meh className="w-20 h-20 text-white" />}
                  {calculateEmotionalState() === "sad" && <Frown className="w-20 h-20 text-white" />}
                  {calculateEmotionalState() === "stress" && <Frown className="w-20 h-20 text-white" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-primary">Estado Emocional</h3>
                  <p className="text-muted-foreground">{getEmotionalMessage()}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emotion-anxious">{testResults.ansiedad}</div>
                    <div className="text-sm text-muted-foreground">Ansiedad</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emotion-happy">{testResults.animo}</div>
                    <div className="text-sm text-muted-foreground">Ánimo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral">{testResults.estres}</div>
                    <div className="text-sm text-muted-foreground">Estrés</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* EMI Access Button */}
            <Button
              onClick={() => setShowEMI(true)}
              className="w-full pill-button bg-pink-pastel hover:bg-pink-pastel/90 text-white"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Hablar con EMI (Asistente Emocional)
            </Button>

            {/* Psychologist Suggestions */}
            <PsychologistSuggestions />

            {/* Evaluaciones Psicológicas Button */}
            <Card className="card-soft border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center space-y-4">
                <div className="text-4xl">📋</div>
                <h3 className="text-xl font-bold text-primary">Evaluaciones Psicológicas</h3>
                <p className="text-muted-foreground">
                  Responde los tests asignados por tu psicólogo y consulta tus resultados
                </p>
                <Button
                  onClick={() => navigate('/paciente/tests')}
                  className="w-full pill-button bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Ver Mis Evaluaciones
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      <Navigation userType="patient" />
      <EMIAssistant 
        isOpen={showEMI} 
        onClose={() => setShowEMI(false)} 
        emotionalState={emotionalState}
      />
    </div>
  );
};

export default PatientDashboardNew;
