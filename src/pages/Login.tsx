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
      navigate('/registro-paciente');
    } else {
      navigate('/registro-psicologo');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="grid-mobile space-y-8">
        {/* Emotional faces and branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-6 mb-6">
            <div className="w-16 h-16 bg-emotion-happy rounded-full flex items-center justify-center text-2xl">
              😊
            </div>
            <div className="w-16 h-16 bg-emotion-sad rounded-full flex items-center justify-center text-2xl">
              😟
            </div>
            <div className="w-16 h-16 bg-emotion-calm rounded-full flex items-center justify-center text-2xl">
              😌
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">EmotiTrack</h1>
          <p className="text-foreground text-center max-w-sm mx-auto leading-relaxed">
            Hola 👋 Bienvenido a EmotiTrack, un espacio para entender y acompañar tus emociones.
          </p>
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
              className="pill-button w-full bg-sky-blue hover:bg-sky-blue/90 text-primary shadow-lg hover:shadow-xl rounded-3xl border border-primary/10"
              size="lg"
            >
              <span className="text-lg mr-3">🙂</span>
              Ingresar como paciente
            </Button>
            
            <Button
              onClick={() => handleLogin('psychologist')}
              className="pill-button w-full bg-soft-pink hover:bg-soft-pink/90 text-white shadow-md hover:shadow-lg rounded-2xl"
              size="lg"
            >
              <span className="text-lg mr-3">🧑‍⚕️</span>
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