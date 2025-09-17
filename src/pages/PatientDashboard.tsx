import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Frown, AlertTriangle, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const emotions = [
  { id: 'happy', label: 'Feliz', icon: Smile, color: 'bg-emotion-happy', emoji: '😊' },
  { id: 'sad', label: 'Triste', icon: Frown, color: 'bg-emotion-sad', emoji: '😢' },
  { id: 'anxious', label: 'Ansioso', icon: AlertTriangle, color: 'bg-emotion-anxious', emoji: '😰' },
  { id: 'calm', label: 'Tranquilo', icon: Heart, color: 'bg-emotion-calm', emoji: '😌' },
];

const PatientDashboard = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [dailyNote, setDailyNote] = useState('');
  const userName = "Ana"; // This would come from user context/auth

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
  };

  const handleSaveNote = () => {
    // Save note logic here
    console.log('Saving note:', dailyNote);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with greeting */}
      <div className="bg-accent px-4 py-6 rounded-b-3xl shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-accent-foreground">
            Hola, {userName} 👋
          </h1>
          <p className="text-accent-foreground/80 mt-1">
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

        {/* Daily notes section */}
        <Card className="card-soft">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Notas del día
          </h2>
          
          <Textarea
            placeholder="Escribe cómo te sientes, qué ha pasado hoy, o cualquier pensamiento que quieras registrar..."
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            className="min-h-24 border-soft-pink focus:ring-primary/20 focus:border-primary/50 rounded-xl"
          />
          
          <Button
            onClick={handleSaveNote}
            className="pill-button mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Guardar nota
          </Button>
        </Card>

        {/* Recommendations section */}
        <Card className="card-soft bg-gradient-to-br from-soft-pink/10 to-lavender/10 border-soft-pink/30">
          <h2 className="text-lg font-semibold text-primary mb-3">
            Sugerencia de hoy ✨
          </h2>
          
          <div className="space-y-3">
            <p className="text-primary/90">
              Recuerda practicar la respiración profunda cuando te sientas abrumado. 
              Inhala por 4 segundos, mantén por 4, exhala por 6.
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted">Técnica de relajación</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="pill-button border-primary/30 text-primary hover:bg-primary/10"
              >
                Probar ahora
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Navigation userType="patient" />
    </div>
  );
};

export default PatientDashboard;