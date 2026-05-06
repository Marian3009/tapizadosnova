import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/site/Footer";
import { applySeo } from "@/lib/seo";
import { buildPageGraph, SITE_URL } from "@/lib/orgSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const cookieFaqs = [
  {
    q: "¿Qué son las cookies y para qué se utilizan en este sitio?",
    a: "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo al visitar una web. En tapizadosnova.com solo se emplean cookies técnicas estrictamente necesarias para el correcto funcionamiento del sitio (sesión, preferencias de idioma y seguridad). No se utilizan cookies publicitarias ni de perfilado.",
  },
  {
    q: "¿Necesito aceptar cookies para navegar por la web?",
    a: "No. Las cookies técnicas están exentas del deber de consentimiento conforme al artículo 22.2 de la LSSI-CE y a las directrices de la AEPD, ya que son imprescindibles para que el sitio funcione. No se instalarán cookies analíticas o de marketing sin su consentimiento previo y expreso.",
  },
  {
    q: "¿Cómo puedo gestionar o eliminar las cookies desde mi navegador?",
    a: "Puede configurar, bloquear o eliminar las cookies en cualquier momento desde los ajustes de su navegador. Cada navegador ofrece su propio panel: Chrome (Configuración → Privacidad y seguridad → Cookies), Firefox (Preferencias → Privacidad), Safari (Preferencias → Privacidad) y Edge (Configuración → Cookies y permisos). Tenga en cuenta que desactivar las cookies técnicas puede afectar al funcionamiento del sitio.",
  },
  {
    q: "¿Se transfieren mis datos a terceros mediante cookies?",
    a: "No. Al usarse únicamente cookies técnicas propias, no se realizan transferencias de datos a terceros con fines comerciales o publicitarios. Si en el futuro se incorporasen cookies de terceros, se solicitaría su consentimiento previo y se actualizaría esta política.",
  },
  {
    q: "¿Cuánto tiempo permanecen las cookies en mi dispositivo?",
    a: "Las cookies de sesión se eliminan automáticamente al cerrar el navegador. Las cookies persistentes técnicas, en su caso, tienen una duración máxima de 12 meses, tras la cual se eliminan o se renuevan.",
  },
  {
    q: "¿Cómo puedo retirar mi consentimiento o reclamar?",
    a: "Puede retirar su consentimiento o ejercer sus derechos escribiendo a tapizadosnova@gmail.com. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) si considera que el tratamiento de sus datos no se ajusta a la normativa vigente.",
  },
];


export default function Privacidad() {
  useEffect(() => {
    applySeo({
      title: "Política de Privacidad · Tapizados Nova",
      description:
        "Política de Privacidad de Tapizados Nova conforme al RGPD y la LOPDGDD: responsable, finalidad, legitimación, conservación y derechos del usuario.",
      path: "/privacidad",
      jsonLd: (() => {
        const base = buildPageGraph(
          {
            "@type": "PrivacyPolicy",
            "@id": `${SITE_URL}/privacidad#page`,
            name: "Política de Privacidad",
            inLanguage: "es-ES",
            url: `${SITE_URL}/privacidad`,
            dateModified: "2026-05-01",
            hasPart: { "@id": `${SITE_URL}/privacidad#cookies-faq` },
          },
          [
            { name: "Inicio", path: "/" },
            { name: "Política de Privacidad", path: "/privacidad" },
          ],
        );
        return {
          ...base,
          "@graph": [
            ...base["@graph"],
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}/privacidad#cookies-faq`,
              name: "Preguntas frecuentes sobre cookies",
              inLanguage: "es-ES",
              mainEntity: cookieFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        };
      })(),
    });
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy-deep text-cream py-6 px-6">
        <div className="container-narrow flex items-center justify-between">
          <Link to="/" className="font-display text-2xl text-gold">
            Tapizados <span className="italic font-normal">Nova</span>
          </Link>
          <Link to="/" className="text-sm text-cream/80 hover:text-gold">← Volver al inicio</Link>
        </div>
      </header>

      <main className="container-narrow px-6 py-12 max-w-3xl">
        <h1 className="font-display text-4xl text-navy-deep mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: mayo de 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">1. Responsable del tratamiento</h2>
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018,
              de 5 de diciembre, de Protección de Datos Personales y Garantía de los Derechos
              Digitales (LOPDGDD), le informamos que los datos personales facilitados a través
              de este sitio web serán tratados por:
            </p>
            <ul className="list-disc pl-6 mt-3">
              <li><strong>Titular:</strong> Tapizados Nova</li>
              <li><strong>Domicilio:</strong> Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)</li>
              <li><strong>Correo electrónico:</strong> tapizadosnova@gmail.com</li>
              <li><strong>Teléfono:</strong> +34 611 491 661</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">2. Finalidad del tratamiento</h2>
            <p>Los datos personales recogidos a través de los formularios de contacto, presupuesto o WhatsApp se tratarán para:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Atender consultas, solicitudes de información y presupuestos.</li>
              <li>Gestionar la relación comercial y la prestación del servicio de tapicería.</li>
              <li>Enviar comunicaciones relacionadas con el servicio contratado.</li>
            </ul>
            <p className="mt-3">No se realizan decisiones automatizadas ni elaboración de perfiles.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">3. Legitimación</h2>
            <p>La base legal para el tratamiento de sus datos es:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>El consentimiento del interesado al enviar el formulario (art. 6.1.a RGPD).</li>
              <li>La ejecución de un contrato o aplicación de medidas precontractuales (art. 6.1.b RGPD).</li>
              <li>El cumplimiento de obligaciones legales aplicables al responsable (art. 6.1.c RGPD).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">4. Conservación de los datos</h2>
            <p>
              Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad
              para la que se recabaron y para determinar las posibles responsabilidades derivadas
              de dicha finalidad, conforme a la normativa fiscal y mercantil vigente (en general,
              hasta 6 años).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">5. Destinatarios</h2>
            <p>
              No se cederán datos a terceros, salvo obligación legal. Algunos servicios técnicos
              (alojamiento web, herramientas de mensajería como WhatsApp o correo electrónico)
              pueden actuar como encargados del tratamiento, sujetos a las garantías exigidas
              por el RGPD.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">6. Derechos del interesado</h2>
            <p>Puede ejercer en cualquier momento sus derechos de:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Acceso, rectificación, supresión y oposición.</li>
              <li>Limitación del tratamiento y portabilidad de los datos.</li>
              <li>Retirada del consentimiento prestado.</li>
              <li>Reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.aepd.es</a>).</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, puede dirigirse por escrito a{" "}
              <a href="mailto:tapizadosnova@gmail.com" className="text-primary underline">tapizadosnova@gmail.com</a>,
              acompañando copia del DNI o documento equivalente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">7. Seguridad</h2>
            <p>
              Aplicamos las medidas técnicas y organizativas apropiadas para garantizar un nivel
              de seguridad adecuado al riesgo, evitando la pérdida, alteración o acceso no
              autorizado a los datos personales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">8. Cookies</h2>
            <p>
              Este sitio web utiliza únicamente cookies técnicas necesarias para su correcto
              funcionamiento. No se utilizan cookies de seguimiento publicitario sin el
              consentimiento previo del usuario.
            </p>
          </section>

          <section id="cookies-faq" className="scroll-mt-24">
            <h2 className="font-display text-2xl text-navy-deep mt-10 mb-2">
              9. Preguntas frecuentes sobre cookies
            </h2>
            <p className="mb-4">
              Resolvemos las dudas más habituales sobre el uso y la gestión de cookies en
              este sitio web.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {cookieFaqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-navy-deep">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
