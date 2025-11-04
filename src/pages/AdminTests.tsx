import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye, ShieldCheck, Download } from "lucide-react";
import SeedTestsButton from "@/components/SeedTestsButton";
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
import TestDetailDialog from "@/components/TestDetailDialog";

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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);

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

  const handleViewDetails = async (test: Test) => {
    setSelectedTest(test);
    
    // Fetch questions for this test
    try {
      const { data, error } = await supabase
        .from('preguntas_test')
        .select('*')
        .eq('test_id', test.id)
        .order('orden', { ascending: true });

      if (error) throw error;
      setTestQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setTestQuestions([]);
    }
    
    setDetailDialogOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground p-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4 hover:bg-background/10 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Catálogo de Tests Psicológicos</h1>
                <p className="text-sm opacity-90">Gestiona y administra los tests disponibles para psicólogos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <SeedTestsButton onComplete={fetchTests} />
              <Button
                onClick={() => navigate('/psicologo/tests/crear')}
                className="gradient-button border-0 shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tests Disponibles</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los tests psicológicos del sistema
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {tests.length} test{tests.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.length === 0 ? (
            <Card className="col-span-full p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay tests creados todavía</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Comienza creando tu primer test psicológico para el sistema
              </p>
              <Button onClick={() => navigate('/psicologo/tests/crear')} className="gradient-button border-0">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer test
              </Button>
            </Card>
          ) : (
            tests.map((test) => (
              <Card key={test.id} className="p-5 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg text-foreground">{test.nombre}</h3>
                      </div>
                      <Badge variant={test.activo ? "default" : "secondary"} className="mb-3">
                        {test.activo ? '✓ Activo' : '○ Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  {test.descripcion && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {test.descripcion}
                    </p>
                  )}

                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-4">
                      📅 Creado: {new Date(test.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(test)}
                        className="flex-1 min-w-[120px] hover:bg-primary/10 hover:border-primary/50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(test)}
                        className="hover:bg-secondary/10 hover:border-secondary/50"
                      >
                        {test.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/psicologo/tests/editar/${test.id}`)}
                        className="hover:bg-accent/10"
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
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Test Detail Dialog */}
      <TestDetailDialog
        test={selectedTest}
        questions={testQuestions}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

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
