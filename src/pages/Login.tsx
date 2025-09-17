import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'patient' | 'psychologist' | null>(null);

  const handleLogin = (userType: 'patient' | 'psychologist') => {
    setSelectedType(userType);
    // Store user type in localStorage for the navigation component
    localStorage.setItem('userType', userType);
    
    if (userType === 'patient') {
      navigate('/paciente');
    } else {
      navigate('/psicologo');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="grid-mobile space-y-8">
        {/* Logo and branding */}
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src={logo} 
              alt="EmotiTrack Logo" 
              className="w-full h-full object-contain rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">EmotiTrack</h1>
          <p className="text-muted text-lg">Tu bienestar emocional importa</p>
        </div>

        {/* Login options */}
        <Card className="card-soft space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-primary mb-2">Selecciona tu perfil</h2>
            <p className="text-muted text-sm">¿Cómo quieres acceder hoy?</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('patient')}
              className="pill-button w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md hover:shadow-lg"
              size="lg"
            >
              <Brain className="w-5 h-5 mr-3" />
              Ingresar como paciente
            </Button>
            
            <Button
              onClick={() => handleLogin('psychologist')}
              className="pill-button w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
              size="lg"
            >
              <Brain className="w-5 h-5 mr-3" />
              Ingresar como psicólogo
            </Button>
          </div>
        </Card>

        {/* Motivational message */}
        <div className="text-center">
          <p className="text-muted text-sm">
            "Cada paso hacia el autoconocimiento es un paso hacia el bienestar"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;