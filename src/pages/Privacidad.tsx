import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/site/Footer";
import { applySeo } from "@/lib/seo";
import { buildPageGraph, SITE_URL } from "@/lib/orgSchema";

export default function Privacidad() {
  useEffect(() => {
    applySeo({
      title: "Política de Privacidad · Tapizados Nova",
      description:
        "Política de Privacidad de Tapizados Nova conforme al RGPD y la LOPDGDD: responsable, finalidad, legitimación, conservación y derechos del usuario.",
      path: "/privacidad",
      jsonLd: buildPageGraph({
        "@type": "PrivacyPolicy",
        "@id": `${SITE_URL}/privacidad#page`,
        name: "Política de Privacidad",
        inLanguage: "es-ES",
        url: `${SITE_URL}/privacidad`,
        dateModified: "2026-05-01",
      }),
    });
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
