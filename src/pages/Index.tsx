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
import FAQ, { DEFAULT_FAQS } from "@/components/site/FAQ";
import Blog from "@/components/site/Blog";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { useReveal } from "@/hooks/use-reveal";
import { useEffect } from "react";
import { applySeo } from "@/lib/seo";
import { organizationJsonLd, ORG_ID, SITE_URL } from "@/lib/orgSchema";

const SERVICES = [
  { name: "Tapizado de sofás", description: "Tapizado completo de sofás de todos los estilos con más de 500 telas disponibles." },
  { name: "Tapizado de sillas y butacas", description: "Restauración y tapizado de sillas de comedor, butacas y sillones." },
  { name: "Cabeceros a medida", description: "Fabricación e instalación de cabeceros tapizados a medida." },
  { name: "Restauración de muebles", description: "Recuperamos muebles antiguos con técnicas artesanales y materiales premium." },
  { name: "Fundas ajustables", description: "Fundas a medida como alternativa económica al tapizado completo." },
];

const REVIEWS = [
  { author: "María G.", rating: 5, text: "Tapizaron mi sofá y quedó como nuevo. Trato excelente y precio justo." },
  { author: "Carlos M.", rating: 5, text: "Restauraron 6 sillas antiguas de mi abuela. Trabajo impecable." },
  { author: "Ana P.", rating: 5, text: "El cabecero que me hicieron a medida es perfecto. 100% recomendables." },
];

const Index = () => {
  useReveal();

  useEffect(() => {
    const title = "Tapizados Nova | Tapicería Artesanal en Barcelona";
    const description =
      "Especialistas en tapizado de sofás, sillas y cabeceros con más de 30 años de experiencia desde 1995. Calidad artesanal y presupuestos sin compromiso.";

    const webSite = {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Tapizados Nova",
      inLanguage: "es-ES",
      publisher: { "@id": ORG_ID },
    };

    const services = SERVICES.map((s, i) => ({
      "@type": "Service",
      "@id": `${SITE_URL}/#service-${i + 1}`,
      name: s.name,
      description: s.description,
      areaServed: ["Rubí", "Barcelona", "Cataluña"],
      provider: { "@id": ORG_ID },
      serviceType: "Tapicería",
    }));

    const reviews = REVIEWS.map((r, i) => ({
      "@type": "Review",
      "@id": `${SITE_URL}/#review-${i + 1}`,
      author: { "@type": "Person", name: r.author },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.text,
      itemReviewed: { "@id": ORG_ID },
    }));

    const aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: REVIEWS.length,
      bestRating: 5,
    };

    const faqPage = {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: DEFAULT_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const orgWithReviews = { ...organizationJsonLd, aggregateRating, review: reviews };

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [orgWithReviews, webSite, ...services, faqPage],
    };

    applySeo({ title, description, path: "/", jsonLd });
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
        <FAQ />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
