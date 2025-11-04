import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import brainCharacter from "@/assets/brain-character-new.png";
import emotitrackLogo from "@/assets/emotitrack-logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Heart, Shield } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  // Single login: no need to select user type
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in - only once on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (data?.role === 'paciente') {
          navigate('/paciente', { replace: true });
        } else if (data?.role === 'psicologo') {
          navigate('/psicologo', { replace: true });
        } else if (data?.role === 'administrador') {
          navigate('/admin', { replace: true });
        }
      }
    };
    
    checkSession();
  }, []); // Only run once on mount

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        toast.error("Por favor verifica tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
        setLoading(false);
        return;
      }

      // Fetch role and route automatically (priority: admin > psicologo > paciente)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      if (rolesError) throw rolesError;

      const roleList = (roles || []).map(r => r.role);
      let destination: string | null = null;
      if (roleList.includes('administrador')) destination = '/admin';
      else if (roleList.includes('psicologo')) destination = '/psicologo';
      else if (roleList.includes('paciente')) destination = '/paciente';

      if (!destination) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta no tiene un rol asignado. Contacta al administrador.');
      }

      toast.success("¡Inicio de sesión exitoso!");
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = () => navigate('/registro-paciente');
  const handleRegisterPsych = () => navigate('/registro-psicologo');

  const floatingEmojis = ['🌸', '🌼', '💙', '💜', '✨', '🦋', '🌈', '💗'];
  
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          >
            {floatingEmojis[i % floatingEmojis.length]}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo and branding */}
        <div className="text-center space-y-6">
          {/* EmotiTrack Logo */}
          <div className="flex justify-center mb-2">
            <img 
              src={emotitrackLogo} 
              alt="EmotiTrack Logo" 
              className="w-32 h-auto object-contain"
            />
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative animate-scale-in">
              <img 
                src={brainCharacter} 
                alt="EmotiTrack Brain Character" 
                className="w-40 h-40 object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl -z-10 animate-pulse" />
              
              {/* Chat bubble */}
              <div className="absolute -right-8 top-8 bg-white rounded-2xl rounded-br-sm px-4 py-3 shadow-lg border-2 border-primary/20 animate-fade-in max-w-[200px]" style={{ animationDelay: '0.5s' }}>
                <p className="text-sm font-medium text-foreground leading-snug">
                  ¡Bienvenido(a)! Prepárate para iniciar tu recorrido emocional.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              EmotiTrack
            </h1>
            <p className="text-xl font-medium text-foreground/90">
              Tu bienestar emocional empieza aquí
            </p>
            <p className="text-sm text-muted-foreground">
              Bienvenido a tu recorrido emocional
            </p>
          </div>
        </div>

        {/* Single Login Card */}
        <Card className="p-8 backdrop-blur-xl bg-card/80 border-2 border-border/50 shadow-2xl animate-fade-in rounded-3xl" style={{ animationDelay: '0.4s' }}>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-3">
                <Shield className="w-5 h-5 text-purple-500" />
                <Heart className="w-5 h-5 text-primary" />
                <Brain className="w-5 h-5 text-secondary" />
                <span className="text-sm font-semibold text-foreground">Inicio de sesión</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Ingresa a tu cuenta</h2>
              <p className="text-sm text-muted-foreground">El sistema te llevará a tu panel según tu rol</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground font-medium">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50 bg-background/50"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 h-12 rounded-xl border-2 border-border/50 focus:border-primary/50 bg-background/50"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 gradient-button mt-6 border-0"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Continuar"}
              </Button>

              <div className="text-center pt-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  ¿Eres paciente?{' '}
                  <button
                    type="button"
                    onClick={handleRegisterPatient}
                    className="text-primary hover:underline font-semibold"
                  >
                    Regístrate aquí
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  ¿Eres psicólogo/a?{' '}
                  <button
                    type="button"
                    onClick={handleRegisterPsych}
                    className="text-primary hover:underline font-semibold"
                  >
                    Crea tu perfil
                  </button>
                </p>
              </div>
            </div>
          </form>
        </Card>

        {/* Footer text */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-muted-foreground text-xs">
            🌼 Versión Beta · Cuidando tu salud mental con tecnología
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
