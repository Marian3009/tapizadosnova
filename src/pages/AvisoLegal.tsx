import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/site/Footer";

export default function AvisoLegal() {
  useEffect(() => {
    document.title = "Aviso Legal · Tapizados Nova";
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
        <h1 className="font-display text-4xl text-navy-deep mb-2">Aviso Legal</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: mayo de 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">1. Datos identificativos</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
              de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes
              datos del titular del sitio web:
            </p>
            <ul className="list-disc pl-6 mt-3">
              <li><strong>Denominación:</strong> Tapizados Nova</li>
              <li><strong>Domicilio:</strong> Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)</li>
              <li><strong>Correo electrónico:</strong> tapizadosnova@gmail.com</li>
              <li><strong>Teléfono:</strong> +34 611 491 661</li>
              <li><strong>Actividad:</strong> Servicios de tapicería artesanal y decoración textil.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">2. Objeto</h2>
            <p>
              El presente aviso legal regula el uso del sitio web. La navegación por el mismo
              atribuye la condición de usuario e implica la aceptación plena y sin reservas de
              todas las disposiciones incluidas en este aviso legal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">3. Condiciones de uso</h2>
            <p>
              El usuario se compromete a hacer un uso adecuado de los contenidos y servicios
              ofrecidos a través del sitio web y a no emplearlos para incurrir en actividades
              ilícitas, lesivas de derechos o intereses de terceros, o que de cualquier forma
              puedan dañar, inutilizar o sobrecargar el sitio web.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">4. Propiedad intelectual e industrial</h2>
            <p>
              Todos los contenidos del sitio web (textos, fotografías, gráficos, imágenes, iconos,
              tecnología, software, así como su diseño gráfico y códigos fuente), constituyen una
              obra cuya propiedad pertenece a Tapizados Nova, sin que puedan entenderse cedidos al
              usuario ninguno de los derechos de explotación reconocidos por la normativa vigente
              en materia de propiedad intelectual.
            </p>
            <p className="mt-3">
              Las marcas, nombres comerciales o signos distintivos son titularidad de Tapizados
              Nova, sin que el acceso al sitio web pueda atribuir ningún derecho sobre ellos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">5. Exclusión de garantías y responsabilidad</h2>
            <p>
              Tapizados Nova no se hace responsable, en ningún caso, de los daños y perjuicios
              de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u
              omisiones en los contenidos, falta de disponibilidad del sitio web o la transmisión
              de virus o programas maliciosos en los contenidos, a pesar de haber adoptado todas
              las medidas tecnológicas necesarias para evitarlo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">6. Modificaciones</h2>
            <p>
              Tapizados Nova se reserva el derecho de efectuar sin previo aviso las modificaciones
              que considere oportunas en su sitio web, pudiendo cambiar, suprimir o añadir tanto
              los contenidos y servicios que se presten a través de la misma como la forma en la
              que estos aparezcan presentados o localizados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">7. Enlaces</h2>
            <p>
              En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacia
              otros sitios de Internet, Tapizados Nova no ejercerá ningún tipo de control sobre
              dichos sitios y contenidos, ni asumirá responsabilidad alguna por los daños
              derivados del uso de los mismos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-navy-deep mt-8 mb-3">8. Legislación aplicable y jurisdicción</h2>
            <p>
              La relación entre Tapizados Nova y el usuario se regirá por la normativa española
              vigente. Para la resolución de cualquier controversia, las partes se someten a los
              Juzgados y Tribunales del domicilio del usuario, conforme a la normativa de
              consumidores y usuarios aplicable.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
