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
          
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold text-primary leading-tight">
              🌼 Bienvenido/a a EmotiTrack
            </h1>
            <p className="text-lg text-foreground/80">
              Tu espacio para comprender y acompañar emociones.
            </p>
          </div>
        </div>

        {/* Login options */}
        <Card className="p-8 backdrop-blur-sm bg-card/95 border border-border shadow-2xl animate-fade-in rounded-3xl" style={{ animationDelay: '0.4s' }}>
          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('psychologist')}
              variant="button-primary"
              className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <span className="text-2xl mr-3">👩‍⚕️</span>
              Ingresar como Psicólogo
            </Button>
            
            <Button
              onClick={() => handleLogin('patient')}
              className="w-full h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-secondary hover:bg-secondary/90 text-white"
              size="lg"
            >
              <span className="text-2xl mr-3">🧠</span>
              Ingresar como Paciente
            </Button>
          </div>
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
