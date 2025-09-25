import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreatePlatform from "./pages/CreatePlatform";
import PlatformView from "./pages/PlatformView";
import RestaurantPlatform from "./pages/RestaurantPlatform";
import AutopecasPlatform from "./pages/AutopecasPlatform";
import SalaoPlatform from "./pages/SalaoPlatform";
import AcademiaPlatform from "./pages/AcademiaPlatform";
import LiveClinicDemo from "./components/platform/LiveClinicDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/dashboard" 
              element={
                <div>
                  <Header />
                  <Dashboard />
                </div>
              } 
            />
            <Route 
              path="/create" 
              element={
                <div>
                  <Header />
                  <CreatePlatform />
                </div>
              } 
            />
            <Route 
              path="/platform/:id" 
              element={
                <div>
                  <Header />
                  <PlatformView />
                </div>
              } 
            />
          <Route path="/restaurant-platform" element={<RestaurantPlatform />} />
          <Route path="/autopeças-platform" element={<AutopecasPlatform />} />
        <Route path="/salao-platform" element={<SalaoPlatform />} />
        <Route path="/academia-platform" element={<AcademiaPlatform />} />
            <Route 
              path="/platforms" 
              element={
                <div>
                  <Header />
                  <Dashboard />
                </div>
              } 
            />
            <Route 
              path="/support" 
              element={
                <div>
                  <Header />
                  <div className="min-h-screen bg-muted/20 py-8">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                      <h1 className="text-3xl font-bold mb-4">Suporte</h1>
                      <p className="text-muted-foreground">Entre em contato conosco para ajuda</p>
                    </div>
                  </div>
                </div>
              } 
            />
            <Route 
              path="/login" 
              element={
                <div className="min-h-screen bg-muted/20 py-8">
                  <div className="max-w-md mx-auto px-4">
                    <div className="bg-white p-8 rounded-lg shadow-card">
                      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                      <p className="text-center text-muted-foreground">Página de login em desenvolvimento</p>
                    </div>
                  </div>
                </div>
              } 
            />
            <Route 
              path="/demo" 
              element={
                <div>
                  <Header />
                  <div className="min-h-screen bg-muted/20 py-8">
                    <LiveClinicDemo />
                  </div>
                </div>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
