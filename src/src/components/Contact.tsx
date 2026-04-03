import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Instagram,
  Facebook,
} from "lucide-react";

const Contact = () => {
  return (
    <section id="contacto" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* INFO */}
          <div className="animate-fade-in-up">
            <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
              Contacto
            </span>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Encuéntranos en el Centro Comercial
            </h2>

            <p className="text-muted-foreground text-lg mb-8">
              Estamos ubicados en el parking del C.C. METROMAR. Fácil acceso y
              mientras lavas tu coche, puedes disfrutar del centro de ocio.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-4 mb-8">

              {/* DIRECCIÓN */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Avenida+de+los+Descubrimientos+s%2Fn,+S%C3%B3tano+-1,+Aparcamiento+CC+Metromar,+41927+Mairena+del+Aljarafe,+Sevilla"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <div className="flex items-center justify-center bg-secondary/10 rounded-lg w-10 h-10">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold">Dirección</div>
                  <div className="text-muted-foreground text-sm">
                    Avenida de los Descubrimientos s/n, Sótano -1,
                    Aparcamiento CC Metromar, 41927 Mairena del Aljarafe (Sevilla)
                  </div>
                </div>
              </a>

              {/* TELÉFONO + WHATSAPP */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center bg-secondary/10 rounded-lg w-10 h-10">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>

                <div>
                  <div className="font-semibold">Teléfono</div>

                  {/* Llamada */}
                  <a
                    href="tel:+34600123456"
                    className="block text-muted-foreground text-sm hover:text-secondary transition-colors"
                  >
                    +34 600 123 456
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/34600123456?text=Hola%20quiero%20información%20sobre%20los%20servicios%20de%20MetroWash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 text-sm hover:underline mt-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <a
                    href="mailto:info@metrowash.es"
                    className="text-muted-foreground text-sm hover:text-secondary transition-colors"
                  >
                    info@metrowash.es
                  </a>
                </div>
              </div>

              {/* HORARIO */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold">Horario</div>
                  <div className="text-muted-foreground text-sm">
                    Lunes a Sábado: 10:00 – 21:00
                  </div>
                </div>
              </div>
            </div>

            {/* REDES SOCIALES */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
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
                  onClick={() =>
                    document.querySelector("#reservas")?.scrollIntoView({ behavior: "smooth" })
                  }
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
