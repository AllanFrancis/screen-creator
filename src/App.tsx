import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import TrainingPlanPage from "./pages/TrainingPlanPage";
import WorkoutDayPage from "./pages/WorkoutDayPage";
import EvolutionPage from "./pages/EvolutionPage";
import ProfilePage from "./pages/ProfilePage";
import AICoachPage from "./pages/AICoachPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/plano" element={<ProtectedRoute><TrainingPlanPage /></ProtectedRoute>} />
              <Route path="/treino/:dayId" element={<ProtectedRoute><WorkoutDayPage /></ProtectedRoute>} />
              <Route path="/evolucao" element={<ProtectedRoute><EvolutionPage /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
