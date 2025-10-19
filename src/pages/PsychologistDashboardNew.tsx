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
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      nombre: 'Laura Gómez',
      edad: 25,
      email: 'laura.gomez@email.com',
      lastSession: '02/10/25',
      emotionalState: 'Ansiosa',
      notes: 'Presenta síntomas de ansiedad moderada'
    },
    {
      id: '2',
      nombre: 'Mateo Ruiz',
      edad: 30,
      email: 'mateo.ruiz@email.com',
      lastSession: '07/10/25',
      emotionalState: 'Tranquilo',
      notes: 'Muestra progreso significativo'
    },
    {
      id: '3',
      nombre: 'Camila López',
      edad: 19,
      email: 'camila.lopez@email.com',
      lastSession: '09/10/25',
      emotionalState: 'Triste',
      notes: 'Requiere seguimiento cercano'
    }
  ]);
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
    const newPatient: Patient = {
      id: Date.now().toString(),
      nombre: 'Nuevo Paciente',
      edad: 0,
      email: '',
      lastSession: new Date().toLocaleDateString('es-ES'),
      emotionalState: 'Normal',
      notes: ''
    };
    setPatients([...patients, newPatient]);
    setEditingId(newPatient.id);
    setEditedPatient(newPatient);
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
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl"
              >
                📋 Evaluaciones
              </Button>
              <Button 
                onClick={handleAddPatient}
                className="bg-coral hover:bg-coral/90 text-white rounded-xl"
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
                    {filteredPatients.map((patient) => (
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
                            <div>{patient.edad} años</div>
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
                            <div className="text-muted-foreground">{patient.lastSession}</div>
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
    </SidebarProvider>
  );
};

export default PsychologistDashboardNew;
