import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, Calendar, MessageSquare, Search, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Patient {
  id: string;
  nombre: string;
  edad?: number;
  email: string;
  codigo_psicologo?: string;
  created_at?: string;
  lastEvaluation?: {
    tipo_prueba: string;
    resultado_numerico: number;
    fecha: string;
  };
  lastNote?: {
    contenido: string;
    fecha: string;
  };
}

const getEmotionFromScore = (score: number, testType: string) => {
  if (testType === 'PHQ-2' || testType === 'GAD-2') {
    if (score >= 3) return { emoji: '😟', color: 'bg-emotion-anxious', level: 'alto' };
    if (score >= 2) return { emoji: '😐', color: 'bg-emotion-sad', level: 'moderado' };
    return { emoji: '🙂', color: 'bg-emotion-calm', level: 'bajo' };
  }
  // PANAS positive affect
  if (testType === 'PANAS-P') {
    if (score >= 35) return { emoji: '😊', color: 'bg-emotion-happy', level: 'alto' };
    if (score >= 25) return { emoji: '🙂', color: 'bg-emotion-calm', level: 'moderado' };
    return { emoji: '😐', color: 'bg-emotion-sad', level: 'bajo' };
  }
  return { emoji: '🙂', color: 'bg-emotion-calm', level: 'normal' };
};

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    fetchPatients();
    fetchAlertsCount();
  }, []);

  const fetchPatients = async () => {
    try {
      // Fetch patients with their psychologist code
      const { data: patientsData, error: patientsError } = await supabase
        .from('users')
        .select('*')
        .eq('rol', 'paciente');

      if (patientsError) throw patientsError;

      // For each patient, fetch their latest evaluation and note
      const patientsWithData = await Promise.all(
        (patientsData || []).map(async (patient) => {
          // Get latest evaluation
          const { data: evaluationData } = await supabase
            .from('evaluaciones')
            .select('tipo_prueba, resultado_numerico, fecha')
            .eq('paciente_id', patient.id)
            .order('fecha', { ascending: false })
            .limit(1)
            .single();

          // Get latest note
          const { data: noteData } = await supabase
            .from('notas')
            .select('contenido, fecha')
            .eq('paciente_id', patient.id)
            .order('fecha', { ascending: false })
            .limit(1)
            .single();

          return {
            ...patient,
            lastEvaluation: evaluationData,
            lastNote: noteData
          };
        })
      );

      setPatients(patientsWithData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertsCount = async () => {
    try {
      const { count } = await supabase
        .from('alertas')
        .select('*', { count: 'exact' })
        .eq('estado', 'pendiente');
      
      setAlertsCount(count || 0);
    } catch (error) {
      console.error('Error fetching alerts count:', error);
    }
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/paciente-detalle/${patientId}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-primary">{patients.length}</div>
            <div className="text-xs text-muted">Pacientes</div>
          </Card>
          <Card 
            className="card-soft text-center py-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/alertas')}
          >
            <div className="text-2xl font-bold text-destructive flex items-center justify-center gap-1">
              {alertsCount}
              {alertsCount > 0 && <AlertTriangle className="w-4 h-4" />}
            </div>
            <div className="text-xs text-muted">Alertas</div>
          </Card>
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-lavender">
              {patients.filter(p => p.lastEvaluation).length}
            </div>
            <div className="text-xs text-muted">Activos</div>
          </Card>
        </div>

        {/* Patients list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              Pacientes ({filteredPatients.length})
            </h2>
            <Button
              onClick={() => navigate('/agregar-paciente')}
              className="pill-button bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
          
          {loading ? (
            <Card className="card-soft text-center py-8">
              <div className="text-muted">Cargando pacientes...</div>
            </Card>
          ) : filteredPatients.length === 0 ? (
            <Card className="card-soft text-center py-8">
              <div className="text-muted">
                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </div>
            </Card>
          ) : (
            filteredPatients.map((patient) => {
              const emotion = patient.lastEvaluation 
                ? getEmotionFromScore(patient.lastEvaluation.resultado_numerico, patient.lastEvaluation.tipo_prueba)
                : { emoji: '🙂', color: 'bg-muted', level: 'sin_datos' };
              
              return (
                <Card
                  key={patient.id}
                  className="card-soft cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Emotion indicator */}
                    <div className="text-2xl mt-1 flex-shrink-0">
                      {emotion.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-primary truncate">
                            {patient.nombre}
                          </h3>
                          {patient.edad && (
                            <p className="text-xs text-muted">{patient.edad} años</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {emotion.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted mb-3 line-clamp-2">
                        {patient.lastNote?.contenido || 'Sin notas recientes'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {patient.lastEvaluation?.fecha ? 
                            new Date(patient.lastEvaluation.fecha).toLocaleDateString() : 
                            'Sin evaluaciones'
                          }
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Ver detalles
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
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