
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
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
              <Route path="releases" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Релизы</h2></div>} />
              <Route path="releases/new" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Создать релиз</h2></div>} />
              <Route path="smartlinks" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">СмартСсылки</h2></div>} />
              <Route path="studio" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Студия</h2></div>} />
              <Route path="tickets" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Тикеты</h2></div>} />
              <Route path="wallet" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Кошелёк</h2></div>} />
              <Route path="stats" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Статистика</h2></div>} />
              <Route path="moderation/*" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Модерация</h2></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;