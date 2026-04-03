import { scrollTo } from "@/lib/utils";
import { BUSINESS } from "@/config/business";
import metrowashLogo from "@/assets/metrowash-logo.png";

const serviceLinks = [
  { label: "Lavado Interior", section: "#servicios" },
  { label: "Lavado Exterior", section: "#servicios" },
  { label: "Lavado Completo", section: "#servicios" },
  { label: "Servicios Extras", section: "#servicios" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Ir al inicio"
              className="flex items-center gap-2 mb-4"
            >
              <img src={metrowashLogo} alt="MetroWash" className="h-16 w-auto" />
            </button>
            <p className="text-background/60 max-w-md">
              Tu centro de lavado premium en el corazón de METROMAR.
              Reserva online, paga seguro y disfruta de un vehículo impecable.
            </p>
          </div>

          {/* Servicios */}
          <nav aria-label="Servicios">
            <h2 className="font-display font-bold mb-4 text-background">Servicios</h2>
            <ul className="space-y-2 text-background/60 list-none p-0 m-0">
              {serviceLinks.map(({ label, section }) => (
                <li key={label}>
                  <button
                    onClick={() => scrollTo(section)}
                    className="hover:text-secondary transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="font-display font-bold mb-4 text-background">Legal</h2>
            <ul className="space-y-2 text-background/60 list-none p-0 m-0">
              <li>
                <a href="/privacidad" className="hover:text-secondary transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/terminos" className="hover:text-secondary transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-secondary transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {currentYear} {BUSINESS.name}. Todos los derechos reservados.
          </p>
          <p className="text-background/50 text-sm">Daniel Ruiz García</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
