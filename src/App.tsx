import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TrainingPlanPage from "./pages/TrainingPlanPage";
import WorkoutDayPage from "./pages/WorkoutDayPage";
import EvolutionPage from "./pages/EvolutionPage";
import ProfilePage from "./pages/ProfilePage";
import AICoachPage from "./pages/AICoachPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/plano" element={<TrainingPlanPage />} />
          <Route path="/treino/:dayId" element={<WorkoutDayPage />} />
          <Route path="/evolucao" element={<EvolutionPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/ai" element={<AICoachPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
