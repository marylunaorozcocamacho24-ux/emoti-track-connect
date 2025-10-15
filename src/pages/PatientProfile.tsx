import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Bell, Shield, Settings, LogOut, Edit3 } from "lucide-react";

const PatientProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    psychologistMessages: true
  });
  
  const [profile, setProfile] = useState({
    name: 'Ana García',
    age: '28',
    email: 'ana.garcia@email.com',
    accessCode: 'DR001-ABC123',
    personalNotes: 'Me gusta la meditación y el yoga. Prefiero las sesiones por la mañana.',
    joinDate: '2024-08-15',
    psychologist: 'Dr. María López'
  });

  const handleSave = () => {
    // Save profile changes (would connect to backend)
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-secondary px-4 py-6 rounded-b-3xl shadow-sm">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/paciente')}
            className="mb-4 text-secondary-foreground/80 hover:text-secondary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-foreground">
                Mi Perfil
              </h1>
              <p className="text-secondary-foreground/80 mt-1">
                Configuración y datos personales
              </p>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={isEditing ? "bg-white text-secondary" : "border-white text-white hover:bg-white/10"}
            >
              {isEditing ? (
                <>Guardar</>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Status */}
        <Card className="card-soft">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">{profile.name}</h3>
              <p className="text-sm text-muted">Paciente activo</p>
              <Badge className="bg-emotion-calm text-white text-xs mt-1">
                Conectado con {profile.psychologist}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-background rounded-lg">
              <div className="text-lg font-bold text-primary">45</div>
              <div className="text-xs text-muted">Días activo</div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-lg font-bold text-secondary">42</div>
              <div className="text-xs text-muted">Evaluaciones</div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información personal
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-primary font-medium">Nombre completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-primary font-medium">Edad</Label>
              <Input
                id="age"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-primary font-medium">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <Label htmlFor="accessCode" className="text-primary font-medium">Código de acceso</Label>
              <Input
                id="accessCode"
                value={profile.accessCode}
                disabled
                className="mt-1 bg-muted/20 border-muted/30"
              />
              <p className="text-xs text-muted mt-1">Este código es asignado por tu psicólogo</p>
            </div>

            <div>
              <Label htmlFor="personalNotes" className="text-primary font-medium">Notas personales</Label>
              <Textarea
                id="personalNotes"
                value={profile.personalNotes}
                onChange={(e) => setProfile(prev => ({ ...prev, personalNotes: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50 min-h-20"
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="card-soft">
          <h3 className="font-semibold text-primary mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notificaciones
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Recordatorio diario</div>
                <div className="text-xs text-muted">Evaluación diaria a las 9:00 AM</div>
              </div>
              <Switch
                checked={notifications.dailyReminder}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, dailyReminder: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Reporte semanal</div>
                <div className="text-xs text-muted">Resumen de progreso cada domingo</div>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Mensajes del psicólogo</div>
                <div className="text-xs text-muted">Notificaciones de nuevas sugerencias</div>
              </div>
              <Switch
                checked={notifications.psychologistMessages}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, psychologistMessages: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
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
              <Shield className="w-4 h-4 mr-2" />
              Descargar mis datos
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="card-soft bg-destructive/5 border-destructive/20">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start pill-button border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </Card>
      </div>

      <Navigation userType="patient" />
    </div>
  );
};

export default PatientProfile;