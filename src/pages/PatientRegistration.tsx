import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    accessCode: '',
    personalNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save patient data (would connect to backend)
    console.log('Patient registration:', formData);
    navigate('/paciente');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4 text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Registro de Paciente</h1>
          <p className="text-muted text-sm">Completa tu perfil para comenzar</p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-md mx-auto">
        <Card className="card-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-primary font-medium">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-primary font-medium">Edad *</Label>
                <Select onValueChange={(value) => handleInputChange('age', value)}>
                  <SelectTrigger className="mt-1 border-soft-pink focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona tu edad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 83 }, (_, i) => i + 18).map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} años</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email" className="text-primary font-medium">Correo electrónico (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="accessCode" className="text-primary font-medium">Código de acceso del psicólogo *</Label>
                <Input
                  id="accessCode"
                  value={formData.accessCode}
                  onChange={(e) => handleInputChange('accessCode', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="Ej: DR001-ABC123"
                  required
                />
                <p className="text-xs text-muted mt-1">Este código te lo proporciona tu psicólogo</p>
              </div>

              <div>
                <Label htmlFor="personalNotes" className="text-primary font-medium">Notas personales (opcional)</Label>
                <Textarea
                  id="personalNotes"
                  value={formData.personalNotes}
                  onChange={(e) => handleInputChange('personalNotes', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50 min-h-20"
                  placeholder="Escribe cualquier información que consideres relevante para tu acompañamiento..."
                />
              </div>
            </div>

            <Button
              type="submit"
              className="pill-button w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
              size="lg"
              disabled={!formData.name || !formData.age || !formData.accessCode}
            >
              Crear mi perfil
            </Button>
          </form>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted leading-relaxed">
            Tus datos están protegidos con cifrado de nivel médico. Solo tu psicólogo asignado tendrá acceso a tu información.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;