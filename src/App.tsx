import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import VisualizadorIA from "./pages/VisualizadorIA.tsx";
import NovaTempoLanding from "./pages/novatempo/NovaTempoLanding.tsx";
import NovaTempoPricing from "./pages/novatempo/NovaTempoPricing.tsx";
import NovaTempoApp from "./pages/novatempo/NovaTempoApp.tsx";
import Admin from "./pages/Admin.tsx";
import Privacidad from "./pages/Privacidad.tsx";
import AvisoLegal from "./pages/AvisoLegal.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import BlogConfirm from "./pages/BlogConfirm.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/visualizador-ia" element={<VisualizadorIA />} />
          <Route path="/novatempo" element={<NovaTempoLanding />} />
          <Route path="/novatempo/precios" element={<NovaTempoPricing />} />
          <Route path="/novatempo/app" element={<NovaTempoApp />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/confirmar" element={<BlogConfirm />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
