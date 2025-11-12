import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart } from "lucide-react";
import brainCharacter from "@/assets/brain-character.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

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
      const validatedData = psychologistSchema.parse(formData);

      // In this flow we do not generate or expose a psychologist access code here.
      // Codes are no longer required for registration.

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

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          nombre: validatedData.name,
          rol: 'psicologo',
          especialidad: validatedData.specialty,
          numero_licencia: validatedData.licenseNumber,
          institucion: validatedData.institution || null
        }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

  toast.success(`¡Registro exitoso! Tu perfil fue creado correctamente.`);
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
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex justify-center">
            <img 
              src={brainCharacter} 
              alt="Brain Character" 
              className="w-24 h-24 object-contain drop-shadow-xl animate-scale-in"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary-foreground">Psicólogo/a</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">Registro Profesional</h1>
          <p className="text-muted-foreground text-sm">Configura tu perfil para comenzar a ayudar</p>
        </div>

        {/* Registration Form */}
        <Card className="card-soft border-2 border-border/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-foreground font-medium">Nombre completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50"
                placeholder="Dr./Dra. Nombre Apellido"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground font-medium">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50"
                placeholder="tu@email.com"
                required
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground font-medium">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50"
                placeholder="Mínimo 6 caracteres"
                required
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="specialty" className="text-foreground font-medium">Especialidad *</Label>
              <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-border/50">
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
              <Label htmlFor="licenseNumber" className="text-foreground font-medium">Número de cédula profesional *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50"
                placeholder="Ej: 1234567"
                required
              />
            </div>

            <div>
              <Label htmlFor="institution" className="text-foreground font-medium">Institución/Clínica (opcional)</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50"
                placeholder="Hospital, clínica o práctica privada"
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-foreground font-medium">Años de experiencia *</Label>
              <Select onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-border/50">
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

            <Button
              type="submit"
              className="w-full h-12 gradient-button mt-6 border-0"
              disabled={loading || !formData.name || !formData.email || !formData.password || !formData.specialty || !formData.licenseNumber || !formData.experience}
            >
              {loading ? "Creando cuenta..." : "Crear perfil profesional"}
            </Button>
          </form>
        </Card>

        {/* Professional Notice */}
        <div className="text-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
          <h3 className="font-semibold text-foreground text-sm mb-2">✓ Verificación profesional</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tu información será verificada para garantizar la seguridad de los pacientes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PsychologistRegistration;
