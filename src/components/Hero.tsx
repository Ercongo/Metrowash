import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import { scrollTo } from "@/lib/utils";
import heroImage from "@/assets/hero-carwash.jpg";

const BUBBLES = [
  { left: "15%", size: 20, delay: "0s", duration: "8s" },
  { left: "30%", size: 30, delay: "1.5s", duration: "10s" },
  { left: "45%", size: 40, delay: "3s", duration: "12s" },
  { left: "60%", size: 50, delay: "4.5s", duration: "14s" },
  { left: "75%", size: 60, delay: "6s", duration: "16s" },
  { left: "90%", size: 70, delay: "7.5s", duration: "18s" },
];

const Hero = () => {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Decorative Water Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {BUBBLES.map((bubble, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-secondary" aria-hidden="true" />
            <span className="text-secondary font-medium text-sm">
              Centro Comercial • Lavado Premium
            </span>
          </div>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background mb-6 animate-fade-in-up animation-delay-100"
          >
            Tu Vehículo merece el{" "}
            <span className="relative">
              <span className="gradient-text">mejor cuidado</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 10C50 2 100 2 150 6C200 10 250 4 298 8"
                  stroke="hsla(197, 70%, 80%, 1.00)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="text-background/80 text-lg md:text-xl mb-8 max-w-xl animate-fade-in-up animation-delay-200">
            Reserva online, elige tus servicios y recibe tu vehículo impecable.
            Limpieza interior, exterior, ozono y más. Todo desde tu móvil.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
            <Button
              variant="hero"
              size="xl"
              className="group"
              onClick={() => scrollTo("#reservas")}
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              Reservar Cita
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <Button
              variant="hero-outline"
              size="xl"
              onClick={() => scrollTo("#servicios")}
            >
              Ver Servicios
            </Button>
          </div>

          {/* Stats */}
          <dl className="flex flex-wrap gap-8 mt-12 animate-fade-in-up animation-delay-400">
            {[
              { number: "500+", label: "Clientes Satisfechos" },
              { number: "4.9★", label: "Valoración Media" },
              { number: "24h", label: "Reserva Online" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <dt className="text-3xl font-display font-bold text-secondary">
                  {stat.number}
                </dt>
                <dd className="text-background/60 text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 border-background/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-secondary rounded-full animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
