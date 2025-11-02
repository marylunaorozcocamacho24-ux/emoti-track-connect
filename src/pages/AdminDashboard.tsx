import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, ClipboardList, BarChart3, LogOut, ShieldCheck } from "lucide-react";

interface Statistics {
  total_pacientes: number;
  total_psicologos: number;
  total_evaluaciones: number;
  total_tests: number;
  tests_completados: number;
  tests_pendientes: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_statistics')
        .select('*')
        .single();

      if (error) throw error;
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive"
      });
    } else {
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm opacity-90">EmotiTrack</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-background/10 border-background/20 hover:bg-background/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Pacientes</p>
                <p className="text-3xl font-bold text-primary mt-1">{statistics?.total_pacientes || 0}</p>
              </div>
              <Users className="w-10 h-10 text-primary/50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Psicólogos</p>
                <p className="text-3xl font-bold text-secondary mt-1">{statistics?.total_psicologos || 0}</p>
              </div>
              <Users className="w-10 h-10 text-secondary/50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Evaluaciones</p>
                <p className="text-3xl font-bold text-accent mt-1">{statistics?.total_evaluaciones || 0}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-accent/50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tests Totales</p>
                <p className="text-3xl font-bold text-primary mt-1">{statistics?.total_tests || 0}</p>
              </div>
              <ClipboardList className="w-10 h-10 text-primary/50" />
            </div>
          </Card>
        </div>

        {/* Test Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de Tests</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics?.tests_completados || 0}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statistics?.tests_pendientes || 0}</p>
            </div>
          </div>
        </Card>

        {/* Management Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Gestión</h3>
          
          <Button
            onClick={() => navigate('/admin/usuarios')}
            className="w-full justify-start h-auto p-4"
            variant="outline"
          >
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">Gestionar Usuarios</p>
              <p className="text-xs text-muted-foreground">Aprobar, editar o eliminar cuentas de psicólogos</p>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/admin/tests')}
            className="w-full justify-start h-auto p-4"
            variant="outline"
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">Gestionar Tests</p>
              <p className="text-xs text-muted-foreground">Crear, editar o eliminar tests psicológicos</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
