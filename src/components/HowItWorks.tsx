import { Calendar, Car, CreditCard, Bell } from "lucide-react";
import { type ElementType } from "react";

interface Step {
  icon: ElementType;
  title: string;
  description: string;
  step: string;
}

const steps: Step[] = [
  {
    icon: Calendar,
    title: "Reserva Online",
    description: "Elige el día y hora que mejor te venga desde nuestra app o web.",
    step: "01",
  },
  {
    icon: Car,
    title: "Elige Servicios",
    description: "Selecciona interior, exterior o ambos. Añade extras como ozono o tapicería.",
    step: "02",
  },
  {
    icon: CreditCard,
    title: "Pago Seguro",
    description: "Paga online con Bizum, tarjeta o PayPal. Fácil y sin complicaciones.",
    step: "03",
  },
  {
    icon: Bell,
    title: "Recordatorio",
    description: "Te avisamos antes de tu cita. Deja tu auto y nosotros hacemos el resto.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-heading"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Proceso Simple
          </span>
          <h2
            id="how-heading"
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground text-lg">
            En solo 4 pasos tendrás tu vehículo impecable. Sin colas, sin esperas.
          </p>
        </div>

        {/* Steps */}
        <ol className="grid md:grid-cols-4 gap-8 relative list-none p-0 m-0">
          {/* Connection Line (desktop only) */}
          <div
            className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-border"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
          </div>

          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step Number */}
              <p
                className="absolute -top-4 right-0 text-6xl font-display font-bold text-muted/50 select-none"
                aria-hidden="true"
              >
                {step.step}
              </p>

              {/* Icon */}
              <div
                className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-cta flex items-center justify-center shadow-glow"
                aria-hidden="true"
              >
                <step.icon className="w-10 h-10 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
