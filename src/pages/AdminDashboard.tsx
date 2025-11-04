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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground p-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm animate-scale-in">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm opacity-90">EmotiTrack</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Pacientes</p>
                <p className="text-4xl font-bold text-primary mt-2">{statistics?.total_pacientes || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Psicólogos</p>
                <p className="text-4xl font-bold text-secondary mt-2">{statistics?.total_psicologos || 0}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <Users className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Evaluaciones</p>
                <p className="text-4xl font-bold text-accent mt-2">{statistics?.total_evaluaciones || 0}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Tests Totales</p>
                <p className="text-4xl font-bold text-primary mt-2">{statistics?.total_tests || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Test Progress */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Estado de Tests</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl border-2 border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Completados</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{statistics?.tests_completados || 0}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
              <p className="text-xs text-muted-foreground font-semibold mb-2">Pendientes</p>
              <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{statistics?.tests_pendientes || 0}</p>
            </div>
          </div>
        </Card>

        {/* Management Actions */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground mb-4">Gestión del Sistema</h3>
          
          <Button
            onClick={() => navigate('/admin/usuarios')}
            className="w-full justify-start h-auto p-5 bg-gradient-to-r from-card to-card/50 hover:from-primary/10 hover:to-primary/5 border-2 hover:border-primary/30 transition-all duration-300"
            variant="outline"
          >
            <div className="p-2 bg-primary/10 rounded-xl mr-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-base text-foreground">Gestionar Usuarios</p>
              <p className="text-xs text-muted-foreground mt-1">Aprobar, editar o eliminar cuentas de psicólogos</p>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/admin/tests')}
            className="w-full justify-start h-auto p-5 bg-gradient-to-r from-card to-card/50 hover:from-secondary/10 hover:to-secondary/5 border-2 hover:border-secondary/30 transition-all duration-300"
            variant="outline"
          >
            <div className="p-2 bg-secondary/10 rounded-xl mr-4">
              <ClipboardList className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-base text-foreground">Catálogo de Tests</p>
              <p className="text-xs text-muted-foreground mt-1">Ver, crear y administrar tests psicológicos del sistema</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
