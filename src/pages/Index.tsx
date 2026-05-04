import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import Calculator from "@/components/site/Calculator";
import Gallery from "@/components/site/Gallery";
import WhyUs from "@/components/site/WhyUs";
import Process from "@/components/site/Process";
import Testimonials from "@/components/site/Testimonials";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import { useReveal } from "@/hooks/use-reveal";
import { useEffect } from "react";

const Index = () => {
  useReveal();

  useEffect(() => {
    document.title = "Tapizados Nova · Tapicería artesanal en Rubí, Barcelona";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Tapicería profesional en Rubí, Barcelona. Tapizado de sofás, sillas, cabeceros y restauración. Más de 20 años de experiencia. Presupuesto gratuito.");
    document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Calculator />
        <Gallery />
        <WhyUs />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
