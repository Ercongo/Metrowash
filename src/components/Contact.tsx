import { type ElementType } from "react";
import { Button } from "@/components/ui/button";
import { scrollTo } from "@/lib/utils";
import { BUSINESS } from "@/config/business";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Instagram,
  Facebook,
} from "lucide-react";

interface ContactItemProps {
  icon: ElementType;
  label: string;
  children: React.ReactNode;
}

const ContactItem = ({ icon: Icon, label, children }: ContactItemProps) => (
  <div className="flex items-start gap-4">
    <div
      className="flex items-center justify-center bg-secondary/10 rounded-lg w-10 h-10 shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <Icon className="w-6 h-6 text-secondary" />
    </div>
    <div>
      <p className="font-semibold">{label}</p>
      {children}
    </div>
  </div>
);

const Contact = () => {
  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      className="py-24 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* INFO */}
          <div className="animate-fade-in-up">
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
              Contacto
            </span>

            <h2
              id="contact-heading"
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Encuéntranos en el Centro Comercial
            </h2>

            <p className="text-muted-foreground text-lg mb-8">
              Estamos ubicados en el parking del C.C. METROMAR. Fácil acceso y
              mientras lavas tu coche, puedes disfrutar del centro de ocio.
            </p>

            <address className="not-italic space-y-4 mb-8">
              {/* Dirección */}
              <ContactItem icon={MapPin} label="Dirección">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-secondary transition-colors"
                >
                  {BUSINESS.address}
                </a>
              </ContactItem>

              {/* Teléfono + WhatsApp */}
              <ContactItem icon={Phone} label="Teléfono">
                <a
                  href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                  className="block text-muted-foreground text-sm hover:text-secondary transition-colors"
                >
                  {BUSINESS.phone}
                </a>
                <a
                  href={BUSINESS.whatsappInfoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 text-sm hover:underline mt-1"
                  aria-label="Contactar por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </ContactItem>

              {/* Email */}
              <ContactItem icon={Mail} label="Email">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-muted-foreground text-sm hover:text-secondary transition-colors"
                >
                  {BUSINESS.email}
                </a>
              </ContactItem>

              {/* Horario */}
              <ContactItem icon={Clock} label="Horario">
                <p className="text-muted-foreground text-sm">{BUSINESS.hoursText}</p>
              </ContactItem>
            </address>

            {/* Redes Sociales */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/lorennsso"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MetroWash en Instagram (@lorennsso)"
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Instagram className="w-6 h-6" aria-hidden="true" />
              </a>
              <div
                aria-label="Facebook — Próximamente"
                className="relative w-12 h-12 rounded-xl bg-muted flex items-center justify-center opacity-50 cursor-not-allowed"
              >
                <Facebook className="w-6 h-6" aria-hidden="true" />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap pointer-events-none">
                  Próximamente
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="animate-fade-in-up animation-delay-200">
            <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-primary-foreground">
              <h3 className="font-display text-3xl font-bold mb-4">
                ¿Listo para dejar tu coche impecable?
              </h3>

              <p className="text-primary-foreground/80 mb-8">
                Reserva ahora y aprovecha nuestras ofertas especiales para nuevos clientes.
              </p>

              <div className="space-y-4">
                <Button
                  variant="secondary"
                  size="xl"
                  className="w-full bg-background text-foreground hover:bg-background/90"
                  onClick={() => scrollTo("#reservas")}
                >
                  Reservar Primera Cita
                </Button>

                <Button
                  variant="hero-outline"
                  size="lg"
                  className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Volver Arriba
                </Button>
              </div>

              <p className="text-primary-foreground/60 text-sm mt-6 text-center">
                10% de descuento en tu primer lavado
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
