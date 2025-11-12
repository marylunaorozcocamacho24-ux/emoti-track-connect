import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoNuevo from "@/assets/logo-nuevo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Heart } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
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

      // Check if email is verified (skip check in development for easier testing)
      const requireEmailConfirmation = process.env.NODE_ENV !== 'development';
      if (requireEmailConfirmation && !data.user.email_confirmed_at) {
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
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-primary/5">
      {/* Left Section - Branding & Welcoming */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
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

        <div className="relative z-10 max-w-md text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center animate-fade-in">
            <img 
              src={logoNuevo} 
              alt="EmotiTrack Logo" 
              className="w-48 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              EmotiTrack
            </h1>
            <p className="text-xl font-semibold text-foreground">
              Tu bienestar emocional empieza aquí
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Conecta con psicólogos especializados, monitorea tu salud mental y accede a herramientas personalizadas para tu bienestar emocional.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-primary">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Apoyo especializado</p>
                <p className="text-sm text-muted-foreground">Conexión con psicólogos profesionales</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-secondary">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Seguimiento continuo</p>
                <p className="text-sm text-muted-foreground">Monitorea tu progreso emocional</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-accent">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Privacidad garantizada</p>
                <p className="text-sm text-muted-foreground">Tu información siempre protegida</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <img 
              src={logoNuevo} 
              alt="EmotiTrack" 
              className="w-24 h-auto object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-foreground">EmotiTrack</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="mb-6 space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Bienvenido</h2>
              <p className="text-sm text-muted-foreground">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold text-sm">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-lg border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50 text-foreground placeholder:text-muted-foreground/60"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-lg border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50 text-foreground placeholder:text-muted-foreground/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white border-0 mt-6"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Inicia sesión"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-card/80 text-muted-foreground">O</span>
              </div>
            </div>

            {/* Registration Links */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleRegisterPatient}
                variant="outline"
                className="w-full h-11 rounded-lg border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 font-semibold text-primary transition-all duration-200"
              >
                Registrarse como paciente
              </Button>
              <Button
                type="button"
                onClick={handleRegisterPsych}
                variant="outline"
                className="w-full h-11 rounded-lg border-2 border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 font-semibold text-secondary transition-all duration-200"
              >
                Registrarse como psicólogo
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>🌼 Versión Beta · Tu salud mental es nuestra prioridad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
