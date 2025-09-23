import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Send, Download, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PatientData {
  id: string;
  nombre: string;
  edad?: number;
  genero?: string;
  email: string;
}

interface Evaluation {
  id: string;
  tipo_prueba: string;
  resultado_numerico: number;
  fecha: string;
  observacion?: string;
}

interface Note {
  id: string;
  contenido: string;
  fecha: string;
  psicologo_id?: string;
}

const PatientProfileDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient basic data
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch evaluations
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('paciente_id', patientId)
        .order('fecha', { ascending: false });

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('notas')
        .select('*')
        .eq('paciente_id', patientId)
        .order('fecha', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del paciente",
        variant: "destructive"
      });
      navigate('/psicologo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !patientId) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('notas')
        .insert({
          contenido: newNote,
          paciente_id: patientId,
          psicologo_id: userData.user?.id
        });

      if (error) throw error;

      toast({
        title: "Nota guardada",
        description: "La nota clínica se ha guardado exitosamente"
      });
      
      setNewNote("");
      fetchPatientData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la nota",
        variant: "destructive"
      });
    }
  };

  const handleSendSuggestion = async () => {
    if (!newSuggestion.trim() || !patientId) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('sugerencias')
        .insert({
          mensaje: newSuggestion,
          paciente_id: patientId,
          psicologo_id: userData.user?.id
        });

      if (error) throw error;

      toast({
        title: "Sugerencia enviada",
        description: "La sugerencia se ha enviado al paciente"
      });
      
      setNewSuggestion("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la sugerencia",
        variant: "destructive"
      });
    }
  };

  const getChartData = (testType: string) => {
    const filteredEvaluations = evaluations
      .filter(e => e.tipo_prueba === testType)
      .reverse();

    return {
      labels: filteredEvaluations.map(e => new Date(e.fecha).toLocaleDateString()),
      datasets: [
        {
          label: testType,
          data: filteredEvaluations.map(e => e.resultado_numerico),
          borderColor: testType === 'PHQ-2' ? '#ca5050' : testType === 'GAD-2' ? '#7094b4' : '#51acb8',
          backgroundColor: testType === 'PHQ-2' ? '#ca505020' : testType === 'GAD-2' ? '#7094b420' : '#51acb820',
          tension: 0.4
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted">Cargando perfil del paciente...</div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted">Paciente no encontrado</div>
          <Button onClick={() => navigate('/psicologo')} className="mt-4">
            Volver al dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-4 py-6 rounded-b-3xl shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/psicologo')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground">
            Perfil del Paciente
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Patient Basic Info */}
        <Card className="card-soft">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">👤</div>
            <h2 className="text-2xl font-bold text-primary">{patient.nombre}</h2>
            <div className="flex justify-center gap-4 mt-2 text-sm text-muted">
              {patient.edad && <span>{patient.edad} años</span>}
              {patient.genero && <span>{patient.genero}</span>}
            </div>
          </div>
        </Card>

        {/* Statistics Tabs */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4">Estadísticas</h3>
          <Tabs defaultValue="evolution" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="evolution">Evolución</TabsTrigger>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="evolution" className="space-y-4">
              {['PHQ-2', 'GAD-2', 'PANAS-P'].map(testType => {
                const hasData = evaluations.some(e => e.tipo_prueba === testType);
                return (
                  <div key={testType}>
                    <h4 className="font-medium text-primary mb-2">{testType}</h4>
                    {hasData ? (
                      <div className="h-48">
                        <Line 
                          data={getChartData(testType)} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: { beginAtZero: true }
                            }
                          }} 
                        />
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center text-muted text-sm">
                        No hay datos para {testType}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{evaluations.length}</div>
                  <div className="text-xs text-muted">Evaluaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{notes.length}</div>
                  <div className="text-xs text-muted">Notas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lavender">
                    {evaluations.length > 0 ? 
                      Math.round(evaluations.reduce((acc, e) => acc + e.resultado_numerico, 0) / evaluations.length) : 
                      0
                    }
                  </div>
                  <div className="text-xs text-muted">Promedio</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Clinical Notes */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4">Notas Clínicas</h3>
          
          <div className="space-y-3 mb-4">
            <Textarea
              placeholder="Escribir nueva nota clínica..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-20"
            />
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
              className="pill-button bg-primary hover:bg-primary/90 text-primary-foreground w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Nota
            </Button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {notes.map((note) => (
              <Card key={note.id} className="bg-muted/50 p-3">
                <p className="text-sm mb-2">{note.contenido}</p>
                <div className="flex items-center text-xs text-muted">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(note.fecha).toLocaleDateString()}
                </div>
              </Card>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-4 text-muted text-sm">
                No hay notas clínicas registradas
              </div>
            )}
          </div>
        </Card>

        {/* Send Suggestions */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4">Enviar Sugerencia</h3>
          
          <div className="space-y-3">
            <Textarea
              placeholder="Escribe una sugerencia para el paciente..."
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              className="min-h-20"
            />
            <Button
              onClick={handleSendSuggestion}
              disabled={!newSuggestion.trim()}
              className="pill-button bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Sugerencia
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfileDetail;