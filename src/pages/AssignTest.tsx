import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCheck } from "lucide-react";

interface Patient {
  id: string;
  nombre: string;
  codigo_psicologo: string;
}

const AssignTest = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const [testName, setTestName] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Cargar información del test
      const { data: test, error: testError } = await supabase
        .from('tests_psicologicos')
        .select('nombre')
        .eq('id', testId)
        .single();

      if (testError) throw testError;
      setTestName(test.nombre);

      // Cargar pacientes del psicólogo
      const { data: patientsData, error: patientsError } = await supabase
        .rpc('get_psychologist_patients');

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Cargar asignaciones existentes
      const { data: assignments, error: assignmentsError } = await supabase
        .from('asignaciones_tests')
        .select('paciente_id')
        .eq('test_id', testId);

      if (assignmentsError) throw assignmentsError;

      const assigned = new Set(assignments?.map(a => a.paciente_id) || []);
      setSelectedPatients(assigned);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
      navigate('/psicologo/tests');
    } finally {
      setLoading(false);
    }
  };

  const togglePatient = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const handleAssign = async () => {
    if (selectedPatients.size === 0) {
      toast({
        title: "Atención",
        description: "Selecciona al menos un paciente",
        variant: "destructive"
      });
      return;
    }

    setAssigning(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Eliminar asignaciones anteriores
      await supabase
        .from('asignaciones_tests')
        .delete()
        .eq('test_id', testId);

      // Crear nuevas asignaciones
      const assignments = Array.from(selectedPatients).map(patientId => ({
        test_id: testId,
        paciente_id: patientId,
        psicologo_id: user.id
      }));

      const { error } = await supabase
        .from('asignaciones_tests')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Test asignado a ${selectedPatients.size} paciente(s)`
      });

      navigate('/psicologo/tests');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo asignar el test",
        variant: "destructive"
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/psicologo/tests')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Asignar Test</h1>
            <p className="text-sm text-primary-foreground/80">{testName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Cargando pacientes...</p>
            </CardContent>
          </Card>
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No tienes pacientes registrados
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Selecciona los Pacientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id={patient.id}
                      checked={selectedPatients.has(patient.id)}
                      onCheckedChange={() => togglePatient(patient.id)}
                    />
                    <Label
                      htmlFor={patient.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{patient.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {patient.codigo_psicologo}
                      </div>
                    </Label>
                    {selectedPatients.has(patient.id) && (
                      <UserCheck className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={handleAssign}
                disabled={assigning || selectedPatients.size === 0}
                className="flex-1"
              >
                {assigning ? 'Asignando...' : `Asignar a ${selectedPatients.size} Paciente(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/psicologo/tests')}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AssignTest;