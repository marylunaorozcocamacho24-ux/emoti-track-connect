import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Save, X, Search } from "lucide-react";

interface Patient {
  id: string;
  nombre: string;
  edad?: number;
  diagnostico?: string;
  estado_emocional?: string;
  ultima_sesion?: string;
  lastEvaluation?: {
    tipo_prueba: string;
    resultado_numerico: number;
    fecha: string;
  };
}

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

const PatientsTable = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Get psychologist's patients
      const { data: patientsData, error: patientsError } = await supabase
        .rpc('get_psychologist_patients');

      if (patientsError) throw patientsError;

      // For each patient, get their latest evaluation
      const patientsWithEvaluations = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { data: evaluationData } = await supabase
            .from('evaluaciones')
            .select('tipo_prueba, resultado_numerico, fecha')
            .eq('paciente_id', patient.id)
            .order('fecha', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...patient,
            lastEvaluation: evaluationData,
          };
        })
      );

      setPatients(patientsWithEvaluations);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setEditedPatient({
      nombre: patient.nombre,
      edad: patient.edad,
      diagnostico: patient.diagnostico,
    });
  };

  const handleSave = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nombre: editedPatient.nombre,
          edad: editedPatient.edad,
          diagnostico: editedPatient.diagnostico,
        })
        .eq('id', patientId);

      if (error) throw error;

      // Update local state
      setPatients(patients.map(p => 
        p.id === patientId 
          ? { ...p, ...editedPatient }
          : p
      ));

      setEditingId(null);
      setEditedPatient({});

      toast({
        title: "Éxito",
        description: "Paciente actualizado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedPatient({});
  };

  const handleDeleteClick = (patientId: string) => {
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', patientToDelete);

      if (error) throw error;

      setPatients(patients.filter(p => p.id !== patientToDelete));

      toast({
        title: "Éxito",
        description: "Paciente eliminado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Nombre</TableHead>
                  <TableHead className="font-bold">Edad</TableHead>
                  <TableHead className="font-bold">Diagnóstico</TableHead>
                  <TableHead className="font-bold">Estado Emocional</TableHead>
                  <TableHead className="font-bold">Última Sesión</TableHead>
                  <TableHead className="font-bold text-right">Acciones</TableHead>
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
                      {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => {
                    const isEditing = editingId === patient.id;
                    const emotion = patient.lastEvaluation
                      ? getEmotionFromScore(
                          patient.lastEvaluation.resultado_numerico,
                          patient.lastEvaluation.tipo_prueba
                        )
                      : { text: 'Sin datos', color: 'bg-muted text-foreground' };

                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedPatient.nombre || ''}
                              onChange={(e) =>
                                setEditedPatient({ ...editedPatient, nombre: e.target.value })
                              }
                              className="h-9"
                            />
                          ) : (
                            <span className="font-medium">{patient.nombre}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedPatient.edad || ''}
                              onChange={(e) =>
                                setEditedPatient({ ...editedPatient, edad: parseInt(e.target.value) })
                              }
                              className="h-9 w-20"
                            />
                          ) : (
                            <span>{patient.edad || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedPatient.diagnostico || ''}
                              onChange={(e) =>
                                setEditedPatient({ ...editedPatient, diagnostico: e.target.value })
                              }
                              className="h-9"
                              placeholder="Diagnóstico"
                            />
                          ) : (
                            <span className="text-sm">{patient.diagnostico || 'Sin diagnóstico'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={emotion.color}>
                            {emotion.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {patient.lastEvaluation?.fecha
                              ? new Date(patient.lastEvaluation.fecha).toLocaleDateString('es-ES')
                              : 'Sin evaluaciones'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(patient.id)}
                                  className="bg-emotion-happy hover:bg-emotion-happy/90"
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <>
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
                                  onClick={() => handleDeleteClick(patient.id)}
                                  className="hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paciente y todos sus datos relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientsTable;
