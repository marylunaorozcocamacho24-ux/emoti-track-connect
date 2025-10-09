import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Bell, Shield, Settings, LogOut, Mail, Building, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PsychologistSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newPatientAlerts: true,
    criticalAlerts: true,
    dailyReport: false,
    weeklyReport: true,
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
  };

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
            Configuración
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary flex items-center">
              <User className="w-5 h-5 mr-2" />
              Perfil Profesional
            </h3>
            <Button variant="outline" size="sm" className="pill-button">
              Editar
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted">Nombre</Label>
              <p className="text-primary">Dr. Juan Pérez</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-muted">Especialidad</Label>
              <p className="text-primary">Psicología Clínica</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-muted">Número de Licencia</Label>
              <p className="text-primary">PSI-12345</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-muted">Institución</Label>
              <p className="text-primary">Hospital Central</p>
            </div>
          </div>
        </Card>

        {/* Notifications Settings */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notificaciones
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">Alertas de nuevos pacientes</p>
                <p className="text-xs text-muted">Notificar cuando se registre un nuevo paciente</p>
              </div>
              <Switch
                checked={notifications.newPatientAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, newPatientAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">Alertas críticas</p>
                <p className="text-xs text-muted">Notificar valores críticos en pacientes</p>
              </div>
              <Switch
                checked={notifications.criticalAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, criticalAlerts: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">Reporte diario</p>
                <p className="text-xs text-muted">Resumen diario de actividad</p>
              </div>
              <Switch
                checked={notifications.dailyReport}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, dailyReport: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">Reporte semanal</p>
                <p className="text-xs text-muted">Resumen semanal de pacientes</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, weeklyReport: checked})
                }
              />
            </div>
          </div>
        </Card>

        {/* Reminder Settings */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Recordatorios
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-primary">
                Frecuencia de recordatorios a pacientes
              </Label>
              <p className="text-xs text-muted mb-2">
                Establece la frecuencia predeterminada para nuevos pacientes
              </p>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-primary">
                <option value="daily">Diario</option>
                <option value="2days">Cada 2 días</option>
                <option value="weekly">Semanal</option>
                <option value="custom">Personalizado por paciente</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacidad y seguridad
          </h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start pill-button border-muted text-muted hover:bg-muted/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Cambiar contraseña
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start pill-button border-muted text-muted hover:bg-muted/10"
            >
              <Mail className="w-4 h-4 mr-2" />
              Cambiar correo electrónico
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start pill-button border-muted text-muted hover:bg-muted/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Términos y condiciones
            </Button>
          </div>
        </Card>

        {/* Logout Button */}
        <Card className="card-soft bg-destructive/5 border-destructive/20">
          <Button 
            variant="destructive" 
            className="w-full pill-button"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </Card>
      </div>

      <Navigation userType="psychologist" />
    </div>
  );
};

export default PsychologistSettings;
