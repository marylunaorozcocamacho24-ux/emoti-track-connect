import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PsychologistSidebar } from "@/components/PsychologistSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, Eye, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Patient {
  id: string;
  nombre: string;
  edad?: number;
  email: string;
  lastSession?: string;
  emotionalState?: string;
  notes?: string;
}

const PsychologistDashboardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessCode, setAccessCode] = useState<string>("");
  const [showCodeDialog, setShowCodeDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);

  const getEmotionColor = (state: string) => {
    switch(state.toLowerCase()) {
      case 'ansiosa':
      case 'ansioso':
        return 'bg-emotion-anxious text-white';
      case 'tranquilo':
      case 'tranquila':
        return 'bg-emotion-happy text-white';
      case 'triste':
        return 'bg-emotion-sad text-white';
      default:
        return 'bg-emotion-neutral text-white';
    }
  };

  const getEmotionEmoji = (state: string) => {
    switch(state.toLowerCase()) {
      case 'ansiosa':
      case 'ansioso':
        return '😰';
      case 'tranquilo':
      case 'tranquila':
        return '😌';
      case 'triste':
        return '😢';
      default:
        return '😐';
    }
  };

  const filteredPatients = patients.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmotionFromScore = (score: number, testType: string) => {
    if (testType === 'PHQ-2' || testType === 'GAD-2') {
      if (score >= 3) return { text: 'Ansioso', color: 'bg-emotion-anxious text-white' };
      if (score >= 2) return { text: 'Moderado', color: 'bg-emotion-sad text-white' };
      return { text: 'Tranquilo', color: 'bg-emotion-calm text-white' };
    }
    if (testType === 'PANAS-P') {
      if (score >= 35) return { text: 'Feliz', color: 'bg-emotion-happy text-white' };
      if (score >= 25) return { text: 'Estable', color: 'bg-emotion-calm text-white' };
      return { text: 'Bajo ánimo', color: 'bg-emotion-sad text-white' };
    }
    return { text: 'Normal', color: 'bg-muted text-foreground' };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch patients for authenticated psychologist
        const { data: patientsData, error: patientsError } = await supabase
          .rpc('get_psychologist_patients');
        if (patientsError) throw patientsError;

        // For each patient, get latest evaluation and a placeholder lastSession (from notas fecha if exists)
        const withDetails: Patient[] = await Promise.all(
          (patientsData || []).map(async (p: any) => {
            const [{ data: evalData }, { data: noteData }] = await Promise.all([
              supabase
                .from('evaluaciones')
                .select('tipo_prueba, resultado_numerico, fecha')
                .eq('paciente_id', p.id)
                .order('fecha', { ascending: false })
                .limit(1)
                .maybeSingle(),
              supabase
                .from('notas')
                .select('fecha')
                .eq('paciente_id', p.id)
                .order('fecha', { ascending: false })
                .limit(1)
                .maybeSingle(),
            ]);

            let emotionalState: string | undefined;
            if (evalData) {
              emotionalState = getEmotionFromScore(
                evalData.resultado_numerico,
                evalData.tipo_prueba
              ).text;
            }

            return {
              id: p.id,
              nombre: p.nombre,
              edad: p.edad,
              email: '',
              lastSession: noteData?.fecha
                ? new Date(noteData.fecha).toLocaleDateString('es-ES')
                : undefined,
              emotionalState,
              notes: '',
            } as Patient;
          })
        );

        setPatients(withDetails);

        // Load psychologist access code to display/share
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('codigo_psicologo')
            .eq('id', user.user.id)
            .maybeSingle();
          if (!profileError && profile?.codigo_psicologo) {
            setAccessCode(profile.codigo_psicologo);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setEditedPatient({ ...patient });
  };

  const handleSaveEdit = () => {
    if (editedPatient) {
      setPatients(patients.map(p => 
        p.id === editedPatient.id ? editedPatient : p
      ));
      setEditingId(null);
      setEditedPatient(null);
      toast({
        title: "Paciente actualizado",
        description: "Los datos se guardaron correctamente"
      });
    }
  };

  const handleDelete = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    toast({
      title: "Paciente eliminado",
      description: "El registro ha sido eliminado"
    });
  };

  const handleAddPatient = () => {
    // Instead of creating a patient record (requires auth account), show the access code to share
    if (accessCode) {
      setShowCodeDialog(true);
    } else {
      toast({ title: 'Código no disponible', description: 'No encontramos tu código. Intenta recargar.' });
    }
  };

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast({ title: 'Código copiado', description: 'Pega el código para compartirlo con tu paciente.' });
    } catch {
      /* ignore */
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PsychologistSidebar />
        
        <main className="flex-1">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Panel de Pacientes</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/psicologo/tests')}
                variant="outline"
                className="border-primary/60 text-primary hover:bg-primary/10 rounded-xl"
              >
                📋 Evaluaciones
              </Button>
              <Button 
                onClick={handleAddPatient}
                className="bg-coral hover:bg-coral/90 text-white rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Search bar */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar paciente por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-primary/20"
                />
              </div>
            </Card>

            {/* Patients table */}
              <Card className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-primary">Nombre</TableHead>
                      <TableHead className="font-bold text-primary">Edad</TableHead>
                      <TableHead className="font-bold text-primary">Última Sesión</TableHead>
                      <TableHead className="font-bold text-primary">Estado Emocional</TableHead>
                      <TableHead className="font-bold text-primary">Notas del Terapeuta</TableHead>
                      <TableHead className="font-bold text-primary text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Cargando pacientes...
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No hay pacientes registrados
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted/5">
                        <TableCell>
                          {editingId === patient.id ? (
                            <Input
                              value={editedPatient?.nombre}
                              onChange={(e) => setEditedPatient({...editedPatient!, nombre: e.target.value})}
                              className="h-9"
                            />
                          ) : (
                            <div className="font-medium">{patient.nombre}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === patient.id ? (
                            <Input
                              type="number"
                              value={editedPatient?.edad}
                              onChange={(e) => setEditedPatient({...editedPatient!, edad: parseInt(e.target.value)})}
                              className="h-9 w-20"
                            />
                          ) : (
                            <div>{patient.edad ? `${patient.edad} años` : '-'}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === patient.id ? (
                            <Input
                              value={editedPatient?.lastSession}
                              onChange={(e) => setEditedPatient({...editedPatient!, lastSession: e.target.value})}
                              className="h-9"
                            />
                          ) : (
                            <div className="text-muted-foreground">{patient.lastSession || '—'}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === patient.id ? (
                            <Input
                              value={editedPatient?.emotionalState}
                              onChange={(e) => setEditedPatient({...editedPatient!, emotionalState: e.target.value})}
                              className="h-9"
                            />
                          ) : (
                            <Badge className={`${getEmotionColor(patient.emotionalState || '')} px-3 py-1`}>
                              {getEmotionEmoji(patient.emotionalState || '')} {patient.emotionalState}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === patient.id ? (
                            <Input
                              value={editedPatient?.notes}
                              onChange={(e) => setEditedPatient({...editedPatient!, notes: e.target.value})}
                              className="h-9"
                            />
                          ) : (
                            <div className="text-sm text-foreground/70 max-w-xs truncate">
                              {patient.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === patient.id ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveEdit}
                                  className="bg-emotion-happy hover:bg-emotion-happy/90 text-white"
                                >
                                  Guardar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditedPatient(null);
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => navigate(`/paciente/${patient.id}`)}
                                  className="hover:bg-primary/10"
                                >
                                  <Eye className="w-4 h-4 text-primary" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleEdit(patient)}
                                  className="hover:bg-accent/10"
                                >
                                  <Edit2 className="w-4 h-4 text-accent" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleDelete(patient.id)}
                                  className="hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Share access code dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comparte tu código con el paciente</DialogTitle>
            <DialogDescription>
              El paciente deberá ingresar este código durante su registro para vincularse contigo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <div className="text-xs text-muted-foreground">Código de acceso</div>
              <div className="text-2xl font-bold tracking-widest">{accessCode}</div>
            </div>
            <Button variant="outline" onClick={copyAccessCode} className="gap-2">
              <Copy className="w-4 h-4" /> Copiar
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate('/registro-paciente')} className="rounded-xl">
              Ir a registro de paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default PsychologistDashboardNew;
