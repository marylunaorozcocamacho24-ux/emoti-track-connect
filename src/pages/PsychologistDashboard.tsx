import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import PatientsTable from "./PatientsTable";

interface Patient {
  id: string;
  nombre: string;
  edad?: number;
  email?: string;
  codigo_psicologo?: string;
  created_at?: string;
  proxima_cita?: string;
  genero?: string;
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

interface DashboardStats {
  totalPacientes: number;
  promedioEmocional: number;
  proximasCitas: Patient[];
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
  const [loading, setLoading] = useState(true);
  const [alertsCount, setAlertsCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    promedioEmocional: 0,
    proximasCitas: []
  });

  useEffect(() => {
    fetchPatients();
    fetchAlertsCount();
  }, []);

  const fetchPatients = async () => {
    try {
      // Use secure function to get only psychologist's patients
      const { data: patientsData, error: patientsError } = await supabase
        .rpc('get_psychologist_patients');

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
            .maybeSingle();

          // Get latest note
          const { data: noteData } = await supabase
            .from('notas')
            .select('contenido, fecha')
            .eq('paciente_id', patient.id)
            .order('fecha', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...patient,
            lastEvaluation: evaluationData,
            lastNote: noteData
          };
        })
      );

      setPatients(patientsWithData);
      calculateStats(patientsWithData);
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

  const calculateStats = (patientsData: Patient[]) => {
    // Calculate emotional average from evaluations
    const evaluationsWithScores = patientsData.filter(p => p.lastEvaluation);
    const totalScore = evaluationsWithScores.reduce((sum, p) => {
      return sum + (p.lastEvaluation?.resultado_numerico || 0);
    }, 0);
    const averageScore = evaluationsWithScores.length > 0 
      ? totalScore / evaluationsWithScores.length 
      : 0;

    // Get upcoming appointments (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingAppointments = patientsData
      .filter(p => {
        if (!p.proxima_cita) return false;
        const appointmentDate = new Date(p.proxima_cita);
        return appointmentDate >= now && appointmentDate <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = new Date(a.proxima_cita!);
        const dateB = new Date(b.proxima_cita!);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5); // Show next 5 appointments

    setStats({
      totalPacientes: patientsData.length,
      promedioEmocional: Math.round(averageScore * 10) / 10,
      proximasCitas: upcomingAppointments
    });
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
            <div className="text-2xl font-bold text-primary">{stats.totalPacientes}</div>
            <div className="text-xs text-muted">Pacientes Activos</div>
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
            <div className="text-2xl font-bold text-accent">
              {stats.promedioEmocional.toFixed(1)}
            </div>
            <div className="text-xs text-muted">Promedio Emocional</div>
          </Card>
        </div>

        {/* Upcoming appointments */}
        {stats.proximasCitas.length > 0 && (
          <Card className="card-soft bg-gradient-to-br from-lavender/10 to-mint/10 border-lavender/30 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Próximas Citas (7 días)
              </h3>
            </div>
            <div className="space-y-2">
              {stats.proximasCitas.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg cursor-pointer hover:bg-card/80 transition-colors"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div>
                    <div className="font-medium text-sm">{patient.nombre}</div>
                    <div className="text-xs text-muted">
                      {new Date(patient.proxima_cita!).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })} - {new Date(patient.proxima_cita!).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {patient.edad} años
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Patients table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              Gestión de Pacientes
            </h2>
            <Button
              onClick={() => navigate('/registro-paciente')}
              className="pill-button bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Paciente
            </Button>
          </div>
          
          <PatientsTable />
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