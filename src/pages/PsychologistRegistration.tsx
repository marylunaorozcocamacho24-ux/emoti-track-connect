import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Input validation schema
const psychologistSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muy largo"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  specialty: z.string().min(1, "La especialidad es requerida"),
  licenseNumber: z.string().trim().min(1, "El número de cédula es requerido").max(50, "Número muy largo"),
  institution: z.string().max(200, "Nombre de institución muy largo").optional(),
  experience: z.string().min(1, "Los años de experiencia son requeridos")
});

const PsychologistRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    licenseNumber: '',
    institution: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = psychologistSchema.parse(formData);

      // Generate unique psychologist code
      const psychologistCode = `PSI-${Date.now().toString(36).toUpperCase()}`;

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nombre: validatedData.name,
            rol: 'psicologo'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // Update additional profile data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          especialidad: validatedData.specialty,
          numero_licencia: validatedData.licenseNumber,
          institucion: validatedData.institution || null,
          codigo_psicologo: psychologistCode
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      toast.success("¡Registro exitoso! Redirigiendo...");
      setTimeout(() => navigate('/psicologo'), 1500);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Por favor corrige los errores en el formulario");
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="email" className="text-primary font-medium">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="tuemail@ejemplo.com"
                  required
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-primary font-medium">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="mt-1 border-soft-pink focus:ring-primary/20 focus:border-primary/50"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
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
              disabled={loading || !formData.name || !formData.email || !formData.password || !formData.specialty || !formData.licenseNumber || !formData.experience}
            >
              {loading ? "Creando cuenta..." : "Crear perfil profesional"}
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