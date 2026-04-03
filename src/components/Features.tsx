import { type ElementType } from "react";
import {
  Smartphone,
  Clock,
  Shield,
  MessageCircle,
  Star,
  Leaf,
  Zap,
  Users,
} from "lucide-react";

interface Feature {
  icon: ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Smartphone,
    title: "App & Web",
    description: "Reserva desde cualquier dispositivo. App nativa para iOS y Android.",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    description: "Abiertos todos los días. Elige la hora que mejor te convenga.",
  },
  {
    icon: Shield,
    title: "Garantía de Calidad",
    description: "Si no estás satisfecho, repetimos el servicio sin coste adicional.",
  },
  {
    icon: MessageCircle,
    title: "Chatbot 24/7 Próximamente",
    description: "Resuelve tus dudas al instante con nuestro asistente inteligente.",
  },
  {
    icon: Star,
    title: "Programa de Fidelidad",
    description: "Acumula puntos y obtén lavados gratis y descuentos exclusivos.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Productos biodegradables y sistema de reciclaje de agua.",
  },
  {
    icon: Zap,
    title: "Servicio Express",
    description: "Lavado rápido en 30 minutos para cuando tienes prisa.",
  },
  {
    icon: Users,
    title: "Equipo Profesional",
    description: "Personal formado y especializado en detailing premium.",
  },
];

const Features = () => {
  return (
    <section
      id="caracteristicas"
      aria-labelledby="features-heading"
      className="py-24 bg-gradient-dark text-background"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            ¿Por qué elegirnos?
          </span>
          <h2
            id="features-heading"
            className="font-display text-4xl md:text-5xl font-bold text-background mb-4"
          >
            La experiencia MetroWash
          </h2>
          <p className="text-background/70 text-lg">
            Tecnología, calidad y atención al cliente. Todo lo que necesitas para el cuidado de tu vehículo.
          </p>
        </div>

        {/* Features Grid */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className="group p-6 rounded-2xl bg-background/5 backdrop-blur-sm border border-background/10 hover:bg-background/10 hover:border-secondary/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div
                className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors"
                aria-hidden="true"
              >
                <feature.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2 text-background">
                {feature.title}
              </h3>
              <p className="text-background/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
