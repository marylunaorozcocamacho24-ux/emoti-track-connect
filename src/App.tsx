import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import PsychologistDashboardNew from "./pages/PsychologistDashboardNew";
import PatientRegistration from "./pages/PatientRegistration";
import PsychologistRegistration from "./pages/PsychologistRegistration";
import DailyEvaluation from "./pages/DailyEvaluation";
import EvaluationResults from "./pages/EvaluationResults";
import PatientHistory from "./pages/PatientHistory";
import PatientProfile from "./pages/PatientProfile";
import PatientProfileDetail from "./pages/PatientProfileDetail";
import AlertsView from "./pages/AlertsView";
import PsychologistSettings from "./pages/PsychologistSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro-paciente" element={<PatientRegistration />} />
          <Route path="/registro-psicologo" element={<PsychologistRegistration />} />
          
          {/* Protected Patient Routes */}
          <Route path="/paciente" element={<ProtectedRoute requiredRole="paciente"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/evaluacion-diaria" element={<ProtectedRoute requiredRole="paciente"><DailyEvaluation /></ProtectedRoute>} />
          <Route path="/resultados" element={<ProtectedRoute requiredRole="paciente"><EvaluationResults /></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute requiredRole="paciente"><PatientHistory /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute requiredRole="paciente"><PatientProfile /></ProtectedRoute>} />
          
          {/* Protected Psychologist Routes */}
          <Route path="/psicologo" element={<ProtectedRoute requiredRole="psicologo"><PsychologistDashboardNew /></ProtectedRoute>} />
          <Route path="/psicologo-old" element={<ProtectedRoute requiredRole="psicologo"><PsychologistDashboard /></ProtectedRoute>} />
          <Route path="/paciente/:patientId" element={<ProtectedRoute requiredRole="psicologo"><PatientProfileDetail /></ProtectedRoute>} />
          <Route path="/alertas" element={<ProtectedRoute requiredRole="psicologo"><AlertsView /></ProtectedRoute>} />
          <Route path="/configuracion-psicologo" element={<ProtectedRoute requiredRole="psicologo"><PsychologistSettings /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
