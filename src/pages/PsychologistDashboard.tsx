import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock patient data
const patients = [
  {
    id: 1,
    name: "Ana García",
    lastEmotion: "calm",
    lastNote: "Me siento más tranquila después de la meditación matutina",
    lastSession: "2024-09-15",
    emotionColor: "bg-emotion-calm",
    trend: "up"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    lastEmotion: "anxious",
    lastNote: "Trabajo muy estresante esta semana, me cuesta concentrarme",
    lastSession: "2024-09-14",
    emotionColor: "bg-emotion-anxious",
    trend: "down"
  },
  {
    id: 3,
    name: "María López",
    lastEmotion: "happy",
    lastNote: "Gran día con la familia, me siento agradecida",
    lastSession: "2024-09-13",
    emotionColor: "bg-emotion-happy",
    trend: "up"
  },
  {
    id: 4,
    name: "Roberto Silva",
    lastEmotion: "sad",
    lastNote: "Día difícil en el trabajo, me siento desanimado",
    lastSession: "2024-09-12",
    emotionColor: "bg-emotion-sad",
    trend: "stable"
  }
];

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const handlePatientClick = (patientId: number) => {
    setSelectedPatient(patientId);
    navigate(`/paciente-detalle/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-4 py-6 rounded-b-3xl shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              Panel Principal
            </h1>
            <p className="text-primary-foreground/80 mt-1">
              {patients.length} pacientes activos
            </p>
          </div>
          <Button
            size="sm"
            className="pill-button bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-primary">{patients.length}</div>
            <div className="text-xs text-muted">Pacientes</div>
          </Card>
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-secondary">12</div>
            <div className="text-xs text-muted">Sesiones</div>
          </Card>
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-lavender">85%</div>
            <div className="text-xs text-muted">Progreso</div>
          </Card>
        </div>

        {/* Patients list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Pacientes recientes
          </h2>
          
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="card-soft cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className="flex items-start space-x-4">
                {/* Emotion indicator */}
                <div className={`w-4 h-4 rounded-full ${patient.emotionColor} mt-1 flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary truncate">
                      {patient.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp 
                        className={`w-4 h-4 ${
                          patient.trend === 'up' ? 'text-emotion-calm' : 
                          patient.trend === 'down' ? 'text-emotion-anxious' : 
                          'text-muted'
                        }`} 
                      />
                      <Badge variant="outline" className="text-xs">
                        {patient.lastEmotion}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted mb-3 line-clamp-2">
                    {patient.lastNote}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {patient.lastSession}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Ver detalles
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card className="card-soft bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
          <h3 className="font-semibold text-primary mb-3">Acciones rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="pill-button border-primary/30 text-primary hover:bg-primary/10"
            >
              Nueva nota
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="pill-button border-secondary/30 text-secondary hover:bg-secondary/10"
            >
              Programar cita
            </Button>
          </div>
        </Card>
      </div>

      <Navigation userType="psychologist" />
    </div>
  );
};

export default PsychologistDashboard;