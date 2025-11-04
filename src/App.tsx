import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import PatientDashboardNew from "./pages/PatientDashboardNew";
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
import PsychologistTests from "./pages/PsychologistTests";
import CreateEditTest from "./pages/CreateEditTest";
import AssignTest from "./pages/AssignTest";
import PatientTests from "./pages/PatientTests";
import TakeTest from "./pages/TakeTest";
import TestResults from "./pages/TestResults";
import PsychologistTestResults from "./pages/PsychologistTestResults";
import PsychologistTemplates from "./pages/PsychologistTemplates";
import PsychologistMessaging from "./pages/PsychologistMessaging";
import PsychologistAgenda from "./pages/PsychologistAgenda";
import PsychologistReports from "./pages/PsychologistReports";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTests from "./pages/AdminTests";

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
          <Route path="/paciente" element={<ProtectedRoute requiredRole="paciente"><PatientDashboardNew /></ProtectedRoute>} />
          <Route path="/evaluacion-diaria" element={<ProtectedRoute requiredRole="paciente"><DailyEvaluation /></ProtectedRoute>} />
          <Route path="/resultados" element={<ProtectedRoute requiredRole="paciente"><EvaluationResults /></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute requiredRole="paciente"><PatientHistory /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute requiredRole="paciente"><PatientProfile /></ProtectedRoute>} />
          <Route path="/paciente/tests" element={<ProtectedRoute requiredRole="paciente"><PatientTests /></ProtectedRoute>} />
          <Route path="/paciente/tests/responder/:assignmentId" element={<ProtectedRoute requiredRole="paciente"><TakeTest /></ProtectedRoute>} />
          <Route path="/paciente/tests/resultados/:assignmentId" element={<ProtectedRoute requiredRole="paciente"><TestResults /></ProtectedRoute>} />
          
          {/* Protected Psychologist Routes */}
          <Route path="/psicologo" element={<ProtectedRoute requiredRole="psicologo"><PsychologistDashboardNew /></ProtectedRoute>} />
          <Route path="/psicologo/plantillas" element={<ProtectedRoute requiredRole="psicologo"><PsychologistTemplates /></ProtectedRoute>} />
          <Route path="/psicologo-old" element={<ProtectedRoute requiredRole="psicologo"><PsychologistDashboard /></ProtectedRoute>} />
          <Route path="/paciente/:patientId" element={<ProtectedRoute requiredRole="psicologo"><PatientProfileDetail /></ProtectedRoute>} />
          <Route path="/alertas" element={<ProtectedRoute requiredRole="psicologo"><AlertsView /></ProtectedRoute>} />
          <Route path="/configuracion-psicologo" element={<ProtectedRoute requiredRole="psicologo"><PsychologistSettings /></ProtectedRoute>} />
          <Route path="/psicologo/tests" element={<ProtectedRoute requiredRole="psicologo"><PsychologistTests /></ProtectedRoute>} />
          <Route path="/psicologo/tests/crear" element={<ProtectedRoute requiredRole="psicologo"><CreateEditTest /></ProtectedRoute>} />
          <Route path="/psicologo/tests/editar/:testId" element={<ProtectedRoute requiredRole="psicologo"><CreateEditTest /></ProtectedRoute>} />
          <Route path="/psicologo/tests/asignar/:testId" element={<ProtectedRoute requiredRole="psicologo"><AssignTest /></ProtectedRoute>} />
          <Route path="/psicologo/tests/resultados/:testId" element={<ProtectedRoute requiredRole="psicologo"><PsychologistTestResults /></ProtectedRoute>} />
          <Route path="/psicologo/mensajeria" element={<ProtectedRoute requiredRole="psicologo"><PsychologistMessaging /></ProtectedRoute>} />
          <Route path="/psicologo/agenda" element={<ProtectedRoute requiredRole="psicologo"><PsychologistAgenda /></ProtectedRoute>} />
          <Route path="/psicologo/reportes" element={<ProtectedRoute requiredRole="psicologo"><PsychologistReports /></ProtectedRoute>} />
          
          {/* Protected Administrator Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="administrador"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute requiredRole="administrador"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute requiredRole="administrador"><AdminTests /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
