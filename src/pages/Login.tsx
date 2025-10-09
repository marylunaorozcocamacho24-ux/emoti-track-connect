import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/assets/emotitrack-logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'patient' | 'psychologist' | null>(null);

  const handleLogin = (userType: 'patient' | 'psychologist') => {
    setSelectedType(userType);
    localStorage.setItem('userType', userType);
    
    if (userType === 'patient') {
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
          
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ¡Bienvenido a EmotiTrack!
            </h1>
            <p className="text-lg text-muted-foreground">
              Tu bienestar emocional comienza con un clic.
            </p>
          </div>
        </div>

        {/* Login options */}
        <Card className="p-8 backdrop-blur-sm bg-card/80 border-2 border-primary/20 shadow-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-primary mb-2">Selecciona tu perfil</h2>
            <p className="text-muted-foreground text-sm">¿Cómo quieres acceder hoy?</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('patient')}
              className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-secondary hover:bg-secondary/90"
              size="lg"
            >
              <span className="text-2xl mr-3">🙂</span>
              Entrar como Paciente
            </Button>
            
            <Button
              onClick={() => handleLogin('psychologist')}
              className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-success hover:bg-success/90"
              size="lg"
            >
              <span className="text-2xl mr-3">🧑‍⚕️</span>
              Entrar como Psicólogo
            </Button>
          </div>
        </Card>

        {/* Motivational message */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-muted-foreground text-sm italic">
            "Tu bienestar emocional es importante para nosotros"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
