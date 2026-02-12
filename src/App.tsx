
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import Releases from "./pages/dashboard/Releases";
import CreateRelease from "./pages/dashboard/CreateRelease";
import SmartLinks from "./pages/dashboard/SmartLinks";
import Studio from "./pages/dashboard/Studio";
import Tickets from "./pages/dashboard/Tickets";
import Moderation from "./pages/dashboard/Moderation";
import ModerationReleases from "./pages/dashboard/ModerationReleases";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/releases" replace />} />
              <Route path="releases" element={<Releases />} />
              <Route path="releases/new" element={<CreateRelease />} />
              <Route path="smartlinks" element={<SmartLinks />} />
              <Route path="studio" element={<Studio />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="wallet" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Кошелёк</h2></div>} />
              <Route path="stats" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Статистика</h2></div>} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="moderation/releases" element={<ModerationReleases />} />
              <Route path="moderation/smartlinks" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Модерация смартлинков</h2></div>} />
              <Route path="moderation/studio" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Модерация студии</h2></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;