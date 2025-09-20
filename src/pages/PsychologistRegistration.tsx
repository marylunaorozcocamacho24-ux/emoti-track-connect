import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope } from "lucide-react";

const PsychologistRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    licenseNumber: '',
    institution: '',
    experience: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save psychologist data (would connect to backend)
    console.log('Psychologist registration:', formData);
    navigate('/psicologo');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const specialties = [
    'Psicología Clínica',
    'Psicología Cognitivo-Conductual',
    'Psicología Humanista',
    'Psicoterapia Sistémica',
    'Psicología Infantil',
    'Psicología de Adultos',
    'Neuropsicología',
    'Psicología de la Salud',
    'Otras especialidades'
  ];

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
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Registro Profesional</h1>
          <p className="text-muted text-sm">Configura tu perfil de psicólogo</p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-md mx-auto">
        <Card className="card-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-primary font-medium">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="Dr./Dra. Nombre Apellido"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty" className="text-primary font-medium">Especialidad *</Label>
                <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                  <SelectTrigger className="mt-1 border-soft-pink focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona tu especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="licenseNumber" className="text-primary font-medium">Número de cédula profesional *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="Ej: 1234567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="institution" className="text-primary font-medium">Institución/Clínica</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="Hospital, clínica o práctica privada"
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-primary font-medium">Años de experiencia *</Label>
                <Select onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger className="mt-1 border-soft-pink focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona tu experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 años</SelectItem>
                    <SelectItem value="3-5">3-5 años</SelectItem>
                    <SelectItem value="6-10">6-10 años</SelectItem>
                    <SelectItem value="11-15">11-15 años</SelectItem>
                    <SelectItem value="15+">Más de 15 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="pill-button w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              size="lg"
              disabled={!formData.name || !formData.specialty || !formData.licenseNumber || !formData.experience}
            >
              Crear perfil profesional
            </Button>
          </form>
        </Card>

        {/* Professional Notice */}
        <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
          <h3 className="font-semibold text-primary text-sm mb-2">Verificación profesional</h3>
          <p className="text-xs text-muted leading-relaxed">
            Tu información será verificada antes de activar tu cuenta. Esto garantiza la seguridad y confianza de nuestros pacientes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PsychologistRegistration;