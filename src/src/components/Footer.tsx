import metrowashLogo from "@/assets/metrowash-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <img 
                src={metrowashLogo} 
                alt="MetroWash Logo" 
                className="h-16 w-auto"
              />
            </a>
            <p className="text-background/60 max-w-md">
              Tu centro de lavado premium en el corazón de METROMAR. 
              Reserva online, paga seguro y disfruta de un vehículo impecable.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Servicios</h4>
            <ul className="space-y-2 text-background/60">
              <li><a href="#" className="hover:text-secondary transition-colors">Lavado Interior</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Lavado Exterior</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Lavado Completo</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Servicios Extras</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-background/60">
              <li><a href="#" className="hover:text-secondary transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {currentYear} MetroWash. Todos los derechos reservados.
          </p>
          <p className="text-background/50 text-sm">
            Daniel Ruiz García
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
