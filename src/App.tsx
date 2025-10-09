import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/paciente" element={<PatientDashboard />} />
          <Route path="/psicologo" element={<PsychologistDashboardNew />} />
          <Route path="/psicologo-old" element={<PsychologistDashboard />} />
          <Route path="/registro-paciente" element={<PatientRegistration />} />
          <Route path="/registro-psicologo" element={<PsychologistRegistration />} />
          <Route path="/evaluacion-diaria" element={<DailyEvaluation />} />
          <Route path="/resultados" element={<EvaluationResults />} />
          <Route path="/historial" element={<PatientHistory />} />
          <Route path="/perfil" element={<PatientProfile />} />
          <Route path="/paciente/:patientId" element={<PatientProfileDetail />} />
          <Route path="/alertas" element={<AlertsView />} />
          <Route path="/configuracion-psicologo" element={<PsychologistSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
