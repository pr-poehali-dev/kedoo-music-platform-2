
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
import ViewRelease from "./pages/dashboard/ViewRelease";
import EditRelease from "./pages/dashboard/EditRelease";
import SmartLinks from "./pages/dashboard/SmartLinks";
import Studio from "./pages/dashboard/Studio";
import Tickets from "./pages/dashboard/Tickets";
import Moderation from "./pages/dashboard/Moderation";
import ModerationReleases from "./pages/dashboard/ModerationReleases";
import ModerationSmartlinks from "./pages/dashboard/ModerationSmartlinks";
import ModerationStudio from "./pages/dashboard/ModerationStudio";
import AllTickets from "./pages/dashboard/AllTickets";
import Wallet from "./pages/dashboard/Wallet";
import Stats from "./pages/dashboard/Stats";
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
              <Route path="releases/view/:id" element={<ViewRelease />} />
              <Route path="releases/edit/:id" element={<EditRelease />} />
              <Route path="smartlinks" element={<SmartLinks />} />
              <Route path="studio" element={<Studio />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="stats" element={<Stats />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="moderation/releases" element={<ModerationReleases />} />
              <Route path="moderation/smartlinks" element={<ModerationSmartlinks />} />
              <Route path="moderation/studio" element={<ModerationStudio />} />
              <Route path="tickets/all" element={<AllTickets />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;