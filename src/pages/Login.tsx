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
  const [mode, setMode] = useState<'select' | 'login'>('select');
  const [userType, setUserType] = useState<'paciente' | 'psicologo' | 'administrador' | null>(null);
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

  const handleSelectType = (type: 'paciente' | 'psicologo' | 'administrador') => {
    setUserType(type);
    setMode('login');
  };

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

      // Verify user has correct role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', userType)
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        throw new Error("No tienes acceso con este tipo de usuario. Por favor verifica que te hayas registrado correctamente.");
      }

      toast.success("¡Inicio de sesión exitoso!");
      
      // Use replace to avoid history issues
      if (userType === 'paciente') {
        navigate('/paciente', { replace: true });
      } else if (userType === 'psicologo') {
        navigate('/psicologo', { replace: true });
      } else if (userType === 'administrador') {
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (userType === 'paciente') {
      navigate('/registro-paciente');
    } else {
      navigate('/registro-psicologo');
    }
  };

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

        {/* Login/Select mode */}
        <Card className="p-8 backdrop-blur-xl bg-card/80 border-2 border-border/50 shadow-2xl animate-fade-in rounded-3xl" style={{ animationDelay: '0.4s' }}>
          {mode === 'select' ? (
            <div className="space-y-4">
              <Button
                onClick={() => handleSelectType('administrador')}
                className="w-full h-16 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white border-0"
                size="lg"
              >
                <Shield className="w-6 h-6 mr-3" />
                Administrador
              </Button>

              <Button
                onClick={() => handleSelectType('psicologo')}
                className="w-full h-16 text-base font-semibold rounded-2xl gradient-button border-0"
                size="lg"
              >
                <Heart className="w-6 h-6 mr-3" />
                Psicólogo/a
              </Button>
              
              <Button
                onClick={() => handleSelectType('paciente')}
                className="w-full h-16 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0"
                size="lg"
              >
                <Brain className="w-6 h-6 mr-3" />
                Paciente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode('select')}
                className="mb-2 text-muted-foreground hover:text-primary"
              >
                ← Volver
              </Button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-3">
                  {userType === 'paciente' && <Brain className="w-5 h-5 text-secondary" />}
                  {userType === 'psicologo' && <Heart className="w-5 h-5 text-primary" />}
                  {userType === 'administrador' && <Shield className="w-5 h-5 text-purple-500" />}
                  <span className="text-sm font-semibold text-foreground">
                    {userType === 'paciente' 
                      ? 'Paciente' 
                      : userType === 'psicologo'
                      ? 'Psicólogo/a'
                      : 'Administrador'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Iniciar Sesión
                </h2>
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

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="text-primary hover:underline font-semibold"
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>
              </div>
            </form>
          )}
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
