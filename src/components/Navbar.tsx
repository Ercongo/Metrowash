import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { scrollTo } from "@/lib/utils";
import metrowashLogo from "@/assets/metrowash-logo.png";

const navLinks = [
  { name: "Inicio", href: "#inicio" },
  { name: "Cómo Funciona", href: "#como-funciona" },
  { name: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollTo(href);
    setIsMobileMenuOpen(false);
  };

  const handleBookingClick = () => {
    scrollTo("#reservas");
    setIsMobileMenuOpen(false);
  };

  return (
    <header role="banner">
      <nav
        aria-label="Navegación principal"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-lg shadow-soft py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Ir al inicio de MetroWash"
            className="flex items-center gap-2 group"
          >
            <img
              src={metrowashLogo}
              alt="MetroWash"
              className="h-12 w-auto transition-transform group-hover:scale-105"
            />
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="text-foreground/80 hover:text-primary font-medium transition-colors relative group"
                >
                  {link.name}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="hero" size="lg" onClick={handleBookingClick}>
              Reservar Ahora
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg shadow-elevated border-t border-border animate-fade-in-up"
          >
            <ul className="container mx-auto px-4 py-6 flex flex-col gap-4 list-none m-0">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-foreground/80 hover:text-primary font-medium py-2 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li className="mt-4">
                <Button variant="hero" size="lg" className="w-full" onClick={handleBookingClick}>
                  Reservar Ahora
                </Button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
