import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain } from "lucide-react";
import brainCharacter from "@/assets/brain-character.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  age: z.string().refine((val) => {
    const age = parseInt(val);
    return age >= 13 && age <= 120;
  }, "La edad debe estar entre 13 y 120 años"),
  email: z.string().trim().email("Email inválido").max(255, "Email muy largo"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  accessCode: z.string().trim().min(1, "El código de acceso es requerido").max(50, "Código muy largo"),
  personalNotes: z.string().max(5000, "Las notas son muy largas").optional()
});

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    accessCode: '',
    personalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = patientSchema.parse(formData);

      // Validate psychologist access code using a secure RPC function
      const { data: codeValidData, error: codeValidError } = await supabase
        .rpc('is_valid_psychologist_code', { _code: validatedData.accessCode });
      if (codeValidError) {
        throw new Error('No se pudo validar el código del psicólogo. Intenta más tarde.');
      }
      if (!codeValidData) {
        throw new Error('El código de acceso no es válido. Verifica con tu psicólogo/a.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nombre: validatedData.name,
            rol: 'paciente'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // Server-side link: updates current user's record inside a SECURITY DEFINER function
      const { data: linkOk, error: linkError } = await supabase
        .rpc('link_patient_to_psychologist', { _code: validatedData.accessCode, _age: parseInt(validatedData.age) });
      if (linkError) throw new Error('Error al vincular el código. Intenta nuevamente.');
      if (!linkOk) throw new Error('El código no es válido o no se pudo vincular.');

      if (validatedData.personalNotes) {
        await supabase.from('notas').insert({
          paciente_id: authData.user.id,
          contenido: validatedData.personalNotes
        });
      }

      toast.success("¡Registro exitoso! Redirigiendo...");
      setTimeout(() => navigate('/paciente'), 1500);
      
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
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
            <Brain className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary-foreground">Paciente</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm">Completa tu perfil para comenzar tu viaje emocional</p>
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
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-secondary/50"
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-foreground font-medium">Edad *</Label>
              <Select onValueChange={(value) => handleInputChange('age', value)}>
                <SelectTrigger className="mt-2 h-12 rounded-xl border-2 border-border/50">
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
              <Label htmlFor="email" className="text-foreground font-medium">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-secondary/50"
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
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-secondary/50"
                placeholder="Mínimo 6 caracteres"
                required
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="accessCode" className="text-foreground font-medium">Código de acceso del psicólogo *</Label>
              <Input
                id="accessCode"
                value={formData.accessCode}
                onChange={(e) => handleInputChange('accessCode', e.target.value)}
                className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-secondary/50"
                placeholder="PSI-ABC123"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Este código te lo proporciona tu psicólogo/a</p>
            </div>

            <div>
              <Label htmlFor="personalNotes" className="text-foreground font-medium">Notas personales (opcional)</Label>
              <Textarea
                id="personalNotes"
                value={formData.personalNotes}
                onChange={(e) => handleInputChange('personalNotes', e.target.value)}
                className="mt-2 rounded-xl border-2 border-border/50 focus:border-secondary/50 min-h-24"
                placeholder="Comparte lo que consideres importante para tu acompañamiento..."
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-button mt-6 border-0"
              disabled={loading || !formData.name || !formData.age || !formData.email || !formData.password || !formData.accessCode}
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            </Button>
          </form>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center p-4 bg-accent/10 rounded-2xl border border-accent/20">
          <p className="text-xs text-foreground/70 leading-relaxed">
            🔒 Tus datos están protegidos. Solo tu psicólogo/a asignado tendrá acceso a tu información.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
