import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import metrowashLogo from "@/assets/metrowash-logo.png";
import { BUSINESS } from "@/config/business";

interface LegalLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  breadcrumb?: string; // short page name for breadcrumb, defaults to title
  children: React.ReactNode;
}

const LegalLayout = ({ title, description, lastUpdated, breadcrumb, children }: LegalLayoutProps) => {
  const currentYear = new Date().getFullYear();
  const pageLabel = breadcrumb ?? title;

  return (
    <>
      {/* Skip to content - WCAG 2.4.1 */}
      <a
        href="#legal-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium"
      >
        Saltar al contenido
      </a>

      {/* Header */}
      <header role="banner" className="bg-foreground text-background py-4 border-b border-background/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" aria-label="Volver a MetroWash inicio">
            <img src={metrowashLogo} alt="MetroWash" className="h-10 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-background/70 hover:text-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Hero legal */}
      <div className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* WCAG 2.4.8 AAA — Breadcrumb: location within site */}
          <nav aria-label="Ruta de navegación" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-background/40 list-none p-0 m-0">
              <li>
                <Link to="/" className="hover:text-secondary transition-colors underline underline-offset-2">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <span aria-current="page" className="text-background/70">{pageLabel}</span>
              </li>
            </ol>
          </nav>
          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2">
            Información Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
          <p className="text-background/60 text-lg">{description}</p>
          <p className="text-background/40 text-sm mt-4">
            Última actualización: <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        </div>
      </div>

      {/* Main content */}
      <main id="legal-content" className="bg-background py-12" tabIndex={-1}>
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-slate max-w-none">{children}</article>
        </div>
      </main>

      {/* Footer minimal */}
      <footer role="contentinfo" className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>© {currentYear} {BUSINESS.name}. Todos los derechos reservados.</p>
          <nav aria-label="Páginas legales">
            <ul className="flex gap-4 list-none p-0 m-0">
              <li><Link to="/privacidad" className="hover:text-secondary transition-colors">Privacidad</Link></li>
              <li><Link to="/terminos" className="hover:text-secondary transition-colors">Términos</Link></li>
              <li><Link to="/cookies" className="hover:text-secondary transition-colors">Cookies</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default LegalLayout;
