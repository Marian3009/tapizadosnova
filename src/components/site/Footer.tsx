export default function Footer() {
  return (
    <footer className="bg-navy-deep text-cream/80 pt-16 pb-8 px-6">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-gold/15">
          <div className="md:col-span-2">
            <div className="font-display text-3xl text-gold mb-4">
              Tapizados <span className="italic font-normal">Nova</span>
            </div>
            <p className="text-cream/70 max-w-md leading-relaxed">
              Decoración Textil. Tapicería artesanal de calidad premium en Rubí, Barcelona desde 2003.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg text-gold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              {["Inicio","Servicios","Galería","Presupuesto","Contacto"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace("í","i").replace("ó","o")}`} className="hover:text-gold transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-gold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>Calle Bilbao N1, 1ª planta</li>
              <li>08191 Rubí (Barcelona)</li>
              <li><a href="tel:+34611491661" className="hover:text-gold">+34 611 491 661</a></li>
              <li><a href="mailto:tapizadosnova@gmail.com" className="hover:text-gold">tapizadosnova@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-cream/50">
          <div>© 2024 Tapizados Nova · <a href="#" className="hover:text-gold">Política de Privacidad</a> · <a href="#" className="hover:text-gold">Aviso Legal</a></div>
          <div>Tapicería artesanal en Rubí, Barcelona desde 2003</div>
        </div>
      </div>
    </footer>
  );
}
