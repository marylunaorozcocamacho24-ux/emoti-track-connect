import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, FileText } from "lucide-react";
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

interface Test {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  psicologo_id: string;
  created_at: string;
}

const AdminTests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests_psicologicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;

    try {
      const { error } = await supabase
        .from('tests_psicologicos')
        .delete()
        .eq('id', testToDelete.id);

      if (error) throw error;

      toast({
        title: "Test eliminado",
        description: "El test ha sido eliminado correctamente",
      });

      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el test",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  const handleToggleActive = async (test: Test) => {
    try {
      const { error } = await supabase
        .from('tests_psicologicos')
        .update({ activo: !test.activo })
        .eq('id', test.id);

      if (error) throw error;

      toast({
        title: "Test actualizado",
        description: `El test ha sido ${!test.activo ? 'activado' : 'desactivado'}`,
      });

      fetchTests();
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el test",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Cargando tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4 hover:bg-background/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestión de Tests</h1>
              <p className="text-sm opacity-90">Crear, editar y administrar tests psicológicos</p>
            </div>
            <Button
              onClick={() => navigate('/psicologo/tests/crear')}
              variant="outline"
              className="bg-background/10 border-background/20 hover:bg-background/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Test
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Tests Disponibles <Badge variant="secondary">{tests.length}</Badge>
          </h2>
        </div>

        <div className="space-y-3">
          {tests.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay tests creados todavía</p>
              <Button onClick={() => navigate('/psicologo/tests/crear')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer test
              </Button>
            </Card>
          ) : (
            tests.map((test) => (
              <Card key={test.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{test.nombre}</h3>
                      <Badge variant={test.activo ? "default" : "secondary"}>
                        {test.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {test.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3">{test.descripcion}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(test.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(test)}
                    >
                      {test.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/psicologo/tests/editar/${test.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTestToDelete(test);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar test?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{testToDelete?.nombre}"? Esta acción no se puede deshacer y eliminará todas las preguntas y asignaciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTest} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTests;
