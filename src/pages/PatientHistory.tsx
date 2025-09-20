import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Calendar, FileText, Award } from "lucide-react";

// Mock historical data
const mockData = {
  weeklyScores: [
    { date: '2024-09-14', test: 'PHQ-2', score: 2, maxScore: 6, level: 'Bajo' },
    { date: '2024-09-15', test: 'GAD-2', score: 4, maxScore: 6, level: 'Alto' },
    { date: '2024-09-16', test: 'PANAS', score: 18, maxScore: 25, level: 'Alto' },
    { date: '2024-09-17', test: 'PHQ-2', score: 1, maxScore: 6, level: 'Bajo' },
    { date: '2024-09-18', test: 'GAD-2', score: 2, maxScore: 6, level: 'Moderado' },
    { date: '2024-09-19', test: 'PANAS', score: 20, maxScore: 25, level: 'Alto' },
    { date: '2024-09-20', test: 'PHQ-2', score: 1, maxScore: 6, level: 'Bajo' },
  ],
  notes: [
    { date: '2024-09-20', note: 'Me siento mucho mejor después de la sesión con mi psicólogo. Las técnicas de respiración me están ayudando.' },
    { date: '2024-09-19', note: 'Día productivo en el trabajo. Me siento más enfocada y menos ansiosa.' },
    { date: '2024-09-18', note: 'Algo de ansiedad por la reunión de mañana, pero logré controlarlo con ejercicios de relajación.' },
  ],
  achievements: [
    { title: '7 días consecutivos', description: 'Registro diario completo', icon: '🏆', earned: true },
    { title: 'Mejora notable', description: 'Reducción del 40% en ansiedad', icon: '📈', earned: true },
    { title: 'Constancia', description: '30 días de seguimiento', icon: '⭐', earned: false },
  ]
};

const PatientHistory = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'bg-emotion-happy text-white';
      case 'Moderado': return 'bg-emotion-calm text-white';
      case 'Bajo': return 'bg-emotion-sad text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-accent px-4 py-6 rounded-b-3xl shadow-sm">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/paciente')}
            className="mb-4 text-accent-foreground/80 hover:text-accent-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-2xl font-bold text-accent-foreground">
            Mi Progreso
          </h1>
          <p className="text-accent-foreground/80 mt-1">
            Historial y evolución emocional
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="week">Esta semana</TabsTrigger>
            <TabsTrigger value="month">Este mes</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-6">
            {/* Weekly Chart */}
            <Card className="card-soft">
              <h3 className="font-semibold text-primary mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Evaluaciones de la semana
              </h3>
              
              <div className="space-y-3">
                {mockData.weeklyScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/30">
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-muted">
                        {new Date(score.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {score.test}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-primary">
                        {score.score}/{score.maxScore}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${getLevelColor(score.level)}`}>
                        {score.level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Notes */}
            <Card className="card-soft">
              <h3 className="font-semibold text-primary mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Mis notas recientes
              </h3>
              
              <div className="space-y-4">
                {mockData.notes.map((entry, index) => (
                  <div key={index} className="p-4 bg-background rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-muted flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(entry.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.note}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="card-soft bg-gradient-to-br from-lavender/10 to-soft-pink/10 border-lavender/30">
              <h3 className="font-semibold text-primary mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Logros
              </h3>
              
              <div className="space-y-3">
                {mockData.achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${achievement.earned ? 'bg-white border border-lavender/30' : 'bg-muted/20 border border-muted/30'}`}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${achievement.earned ? 'text-primary' : 'text-muted'}`}>
                        {achievement.title}
                      </div>
                      <div className={`text-xs ${achievement.earned ? 'text-muted' : 'text-muted/60'}`}>
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-lavender text-white text-xs">
                        Conseguido
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="month" className="space-y-6">
            <Card className="card-soft text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="font-semibold text-primary mb-2">Vista mensual</h3>
              <p className="text-sm text-muted mb-4">
                Análisis detallado disponible próximamente
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="pill-button border-primary/30 text-primary hover:bg-primary/10"
              >
                Generar reporte mensual
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation userType="patient" />
    </div>
  );
};

export default PatientHistory;