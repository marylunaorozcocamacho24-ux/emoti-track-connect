import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Frown, AlertTriangle, Smile, Brain, TrendingUp, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const emotions = [
  { id: 'happy', label: 'Feliz', icon: Smile, color: 'bg-emotion-happy', emoji: '😊' },
  { id: 'sad', label: 'Triste', icon: Frown, color: 'bg-emotion-sad', emoji: '😢' },
  { id: 'anxious', label: 'Ansioso', icon: AlertTriangle, color: 'bg-emotion-anxious', emoji: '😰' },
  { id: 'calm', label: 'Tranquilo', icon: Heart, color: 'bg-emotion-calm', emoji: '😌' },
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [dailyNote, setDailyNote] = useState('');
  const [userName, setUserName] = useState("Paciente");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchSuggestions();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('nombre')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setUserName(userData.nombre);
      }
    }
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('sugerencias')
        .select('*')
        .eq('paciente_id', user.id)
        .order('fecha', { ascending: false })
        .limit(1);
      
      if (data) {
        setSuggestions(data);
      }
    }
  };

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
  };

  const handleSaveNote = async () => {
    if (!dailyNote.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notas')
      .insert({
        paciente_id: user.id,
        contenido: dailyNote,
        psicologo_id: null
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la nota",
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Nota guardada!",
        description: "Tu nota ha sido registrada exitosamente"
      });
      setDailyNote('');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-primary">Cargando...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with greeting */}
      <div className="bg-gradient-to-br from-primary via-lavender to-secondary px-4 py-8 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white">
            Hola, {userName} 👋
          </h1>
          <p className="text-white/90 mt-2 text-lg">
            ¿Cómo te sientes hoy?
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Emotional tracking section */}
        <Card className="card-soft">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Registro emocional
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {emotions.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => handleEmotionSelect(emotion.id)}
                className={cn(
                  "emotion-icon",
                  emotion.color,
                  selectedEmotion === emotion.id 
                    ? "ring-4 ring-primary/30 scale-105" 
                    : "hover:scale-105"
                )}
              >
                <div className="text-center text-white">
                  <div className="text-2xl mb-1">{emotion.emoji}</div>
                  <div className="text-xs font-medium">{emotion.label}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Evaluation section */}
        <Card className="card-soft bg-gradient-to-br from-lavender/10 to-accent/10 border-lavender/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Evaluación Diaria
            </h2>
            <span className="text-xs bg-primary text-white px-3 py-1 rounded-full">2 min</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Test combinado PHQ-2 + GAD-2: evalúa tu estado de ánimo y nivel de ansiedad en solo 4 preguntas.
            </p>
            
            <Button
              onClick={() => navigate('/evaluacion-diaria')}
              className="w-full h-14 bg-success hover:bg-success/90 text-white rounded-2xl shadow-md hover:shadow-lg transition-all font-semibold text-lg"
            >
              <span className="text-2xl mr-3">📊</span>
              Registrar Evaluación
            </Button>
          </div>
        </Card>

        {/* Progress section */}
        <Card className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Mi Progreso
            </h2>
          </div>
          
          <Button
            onClick={() => navigate('/historial')}
            variant="outline"
            className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5"
          >
            Ver gráficos y evolución
          </Button>
        </Card>

        {/* Personal notes section */}
        <Card className="card-soft">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Mis Notas Personales
          </h2>
          
          <Textarea
            placeholder="Escribe cómo te sientes hoy... 📝"
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            className="min-h-28 border-primary/20 focus:ring-primary/20 focus:border-primary/50 rounded-xl resize-none"
          />
          
          <Button
            onClick={handleSaveNote}
            disabled={!dailyNote.trim()}
            className="mt-4 w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-semibold"
          >
            Guardar Nota
          </Button>
        </Card>

        {/* Personalized suggestions from psychologist */}
        {suggestions.length > 0 && (
          <Card className="card-soft bg-gradient-to-br from-coral/10 to-soft-pink/10 border-coral/30">
            <h2 className="text-lg font-semibold text-primary mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-coral" />
              Sugerencia de tu Psicólogo ✨
            </h2>
            
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed">
                {suggestions[0].mensaje}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-coral/20">
                <span className="text-xs text-muted">
                  {new Date(suggestions[0].fecha).toLocaleDateString('es-ES')}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/perfil')}
                  className="text-primary hover:bg-primary/10 text-xs"
                >
                  Ver todas →
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Navigation userType="patient" />
    </div>
  );
};

export default PatientDashboard;