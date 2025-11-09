import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface Test {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: string;
}

const PsychologistTests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();

    // Set up realtime subscription for tests
    const channel = supabase
      .channel('tests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tests_psicologicos'
        },
        (payload) => {
          console.log('Test change detected:', payload);
          // Refetch tests when any change occurs
          fetchTests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('tests_psicologicos')
        .select('*')
        .or(`psicologo_id.eq.${user.id},psicologo_id.is.null`)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (testId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('tests_psicologicos')
        .update({ activo: !currentActive })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Test ${!currentActive ? 'activado' : 'desactivado'} correctamente`
      });
      
      fetchTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el test",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('¿Estás seguro de eliminar este test? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tests_psicologicos')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Test eliminado correctamente"
      });
      
      fetchTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el test",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/psicologo')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Tests Psicológicos</h1>
              <p className="text-sm text-primary-foreground/80">Gestiona tus evaluaciones</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/psicologo/tests/crear')}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Test
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Cargando tests...</p>
            </CardContent>
          </Card>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No tienes tests creados aún
              </p>
              <Button onClick={() => navigate('/psicologo/tests/crear')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer test
              </Button>
            </CardContent>
          </Card>
        ) : (
          tests.map((test) => (
            <Card key={test.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{test.nombre}</CardTitle>
                      <Badge variant={test.activo ? "default" : "secondary"}>
                        {test.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription>{test.descripcion}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/psicologo/tests/editar/${test.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/psicologo/tests/asignar/${test.id}`)}
                  >
                    Asignar a Pacientes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/psicologo/tests/resultados/${test.id}`)}
                  >
                    Ver Resultados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(test.id, test.activo)}
                  >
                    {test.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <Navigation userType="psychologist" />
    </div>
  );
};

export default PsychologistTests;