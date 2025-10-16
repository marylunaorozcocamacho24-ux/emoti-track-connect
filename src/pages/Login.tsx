import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/emotitrack-logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'login'>('select');
  const [userType, setUserType] = useState<'paciente' | 'psicologo' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check user role and redirect
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.role === 'paciente') {
              navigate('/paciente');
            } else if (data?.role === 'psicologo') {
              navigate('/psicologo');
            }
          });
      }
    });
  }, [navigate]);

  const handleSelectType = (type: 'paciente' | 'psicologo') => {
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

      // Verify user has correct role
      const { data: roleData, error: roleError } = await supabase
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
      
      if (userType === 'paciente') {
        navigate('/paciente');
      } else {
        navigate('/psicologo');
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

  // Floating emoji animation
  const emojis = ['😊', '😟', '😌', '😠', '😲'];
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Floating emoji background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            {emojis[i % emojis.length]}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and branding */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={logo} 
                alt="EmotiTrack Logo" 
                className="w-32 h-32 object-contain animate-scale-in"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold text-primary leading-tight">
              🌼 Bienvenido/a a EmotiTrack
            </h1>
            <p className="text-lg text-foreground/80">
              Tu espacio para comprender y acompañar emociones.
            </p>
          </div>
        </div>

        {/* Login/Select mode */}
        <Card className="p-8 backdrop-blur-sm bg-card/95 border border-border shadow-2xl animate-fade-in rounded-3xl" style={{ animationDelay: '0.4s' }}>
          {mode === 'select' ? (
            <div className="space-y-4">
              <Button
                onClick={() => handleSelectType('psicologo')}
                variant="button-primary"
                className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <span className="text-2xl mr-3">👩‍⚕️</span>
                Ingresar como Psicólogo
              </Button>
              
              <Button
                onClick={() => handleSelectType('paciente')}
                className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-secondary hover:bg-secondary/90 text-white"
                size="lg"
              >
                <span className="text-2xl mr-3">🧠</span>
                Ingresar como Paciente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode('select')}
                className="mb-4"
              >
                ← Volver
              </Button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {userType === 'paciente' ? '🧠 Inicio de Sesión Paciente' : '👩‍⚕️ Inicio de Sesión Psicólogo'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="text-primary hover:underline font-medium"
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
          <p className="text-foreground/50 text-xs">
            Versión Beta · Desarrollado con IA para la innovación en salud mental.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
