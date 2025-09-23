import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Alert {
  id: string;
  paciente_id: string;
  tipo_alerta: string;
  fecha: string;
  estado: 'pendiente' | 'resuelta';
  paciente?: {
    nombre: string;
    edad?: number;
  };
}

const AlertsView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // First, get all alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alertas')
        .select('*')
        .order('fecha', { ascending: false });

      if (alertsError) throw alertsError;

      // Then, for each alert, get the patient information
      const alertsWithPatients = await Promise.all(
        (alertsData || []).map(async (alert) => {
          const { data: patientData } = await supabase
            .from('users')
            .select('nombre, edad')
            .eq('id', alert.paciente_id)
            .single();

          return {
            id: alert.id,
            paciente_id: alert.paciente_id || '',
            tipo_alerta: alert.tipo_alerta || '',
            fecha: alert.fecha || '',
            estado: (alert.estado as 'pendiente' | 'resuelta') || 'pendiente',
            paciente: patientData
          };
        })
      );

      setAlerts(alertsWithPatients);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ estado: 'resuelta' })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta"
      });

      fetchAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive"
      });
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'ansiedad elevada':
      case 'depresion moderada':
      case 'depresion severa':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted" />;
    }
  };

  const getAlertColor = (tipo: string, estado: string) => {
    if (estado === 'resuelta') return 'bg-muted/50';
    
    switch (tipo.toLowerCase()) {
      case 'ansiedad elevada':
      case 'depresion severa':
        return 'bg-destructive/10 border-destructive/30';
      case 'depresion moderada':
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-muted/50';
    }
  };

  const pendingAlerts = alerts.filter(alert => alert.estado === 'pendiente');
  const resolvedAlerts = alerts.filter(alert => alert.estado === 'resuelta');

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
            Alertas
          </h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-destructive">{pendingAlerts.length}</div>
            <div className="text-sm text-muted">Pendientes</div>
          </Card>
          <Card className="card-soft text-center py-4">
            <div className="text-2xl font-bold text-secondary">{resolvedAlerts.length}</div>
            <div className="text-sm text-muted">Resueltas</div>
          </Card>
        </div>

        {loading ? (
          <Card className="card-soft text-center py-8">
            <div className="text-muted">Cargando alertas...</div>
          </Card>
        ) : (
          <>
            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">
                  Alertas Pendientes ({pendingAlerts.length})
                </h2>
                
                {pendingAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`card-soft ${getAlertColor(alert.tipo_alerta, alert.estado)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getAlertIcon(alert.tipo_alerta)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">
                            {alert.paciente?.nombre || 'Paciente desconocido'}
                          </h3>
                          {alert.paciente?.edad && (
                            <p className="text-xs text-muted mb-2">
                              {alert.paciente.edad} años
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {alert.tipo_alerta}
                            </Badge>
                            <span className="text-xs text-muted">
                              {new Date(alert.fecha).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted">
                            {alert.tipo_alerta === 'ansiedad elevada' && 'Puntuaciones altas en GAD-2 durante 3 días consecutivos'}
                            {alert.tipo_alerta === 'depresion moderada' && 'Puntuaciones moderadas en PHQ-2 persistentes'}
                            {alert.tipo_alerta === 'depresion severa' && 'Puntuaciones altas en PHQ-2 que requieren atención inmediata'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/paciente-detalle/${alert.paciente_id}`)}
                          className="pill-button border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsResolved(alert.id)}
                          className="pill-button border-secondary/30 text-secondary hover:bg-secondary/10"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Resolved Alerts */}
            {resolvedAlerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">
                  Alertas Resueltas ({resolvedAlerts.length})
                </h2>
                
                {resolvedAlerts.slice(0, 5).map((alert) => (
                  <Card
                    key={alert.id}
                    className={`card-soft ${getAlertColor(alert.tipo_alerta, alert.estado)}`}
                  >
                    <div className="flex items-start justify-between opacity-70">
                      <div className="flex items-start space-x-3 flex-1">
                        <CheckCircle className="w-5 h-5 text-secondary" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">
                            {alert.paciente?.nombre || 'Paciente desconocido'}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {alert.tipo_alerta}
                            </Badge>
                            <span className="text-xs text-muted">
                              {new Date(alert.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/paciente-detalle/${alert.paciente_id}`)}
                        className="text-muted hover:text-primary"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {alerts.length === 0 && (
              <Card className="card-soft text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No hay alertas
                </h3>
                <p className="text-muted text-sm">
                  Las alertas aparecerán aquí cuando los pacientes tengan evaluaciones que requieran atención.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AlertsView;