import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, PawPrint, Wind, Sparkles } from "lucide-react";
import serviceInterior from "@/assets/service-interior.jpg";
import serviceExterior from "@/assets/service-exterior.jpg";
import serviceComplete from "@/assets/service-complete.jpg";
import serviceIntegral from "@/assets/service-integral.png";
const services = [
  {
    title: "Lavado Exterior",
    description: "Lavado a mano con productos premium. Carrocería, llantas y cristales impecables.",
    price: "15€",
    duration: "15-25 min",
    image: serviceExterior,
    features: ["Lavado a mano", "Secado con microfibra", "Limpieza de llantas", "Cristales exteriores"],
    popular: false,
  },
  {
    title: "Lavado Completo",
    description: "El tratamiento más completo para dejar tu vehículo como nuevo por dentro y fuera.",
    price: "Suma/ajustada",
    duration: "70-90 min",
    image: serviceComplete,
    features: ["Interior + Exterior", "Tratamiento completo", "Cera protectora", "Perfumado premium"],
    popular: true,
  },
  {
    title: "Lavado Interior",
    description: "Limpieza profunda de asientos, alfombras, tablero y todas las superficies internas.",
    price: "Desde 30€",
    duration: "45-65 min",
    image: serviceInterior,
    features: ["2 plazas: 30€", "5 plazas: 35€", "7 plazas: 40€", "Aspirado completo"],
    popular: false,
  },
  {
    title: "Lavado Integral con Tapicería",
    description: "Con tratamiento especial del textil de asientos (cuero, alcántara o tela), limpieza y desinfección de alfombras y moqueta.",
    price: "Consultar",
    duration: "150-210 min + 30 min secado",
    image: serviceIntegral,
    features: ["Interior o Exterior+Interior", "Tratamiento tapicería (cuero/alcántara/tela)", "Desinfección alfombras", "Limpieza moqueta completa"],
    popular: false,
  },
];

const extras = [
  { icon: PawPrint, name: "Plus pelos de mascota", price: "+10€", duration: "+15-30 min (según nivel)" },
  { icon: Wind, name: "Ozono", price: "+15€", duration: "+15 min" },
  { icon: Sparkles, name: "Desinfección", price: "Desde 25€", duration: "+20 min (aprox.)" },
];

const Services = () => {
  return (
    <section id="servicios" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Nuestros Servicios
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Elige el cuidado perfecto para tu vehículo
          </h2>
          <p className="text-muted-foreground text-lg">
            Desde lavados rápidos hasta tratamientos premium, tenemos la solución ideal para ti.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {services.map((service, index) => (
            <Card
              key={service.title}
              variant="service"
              className={`relative overflow-hidden animate-fade-in-up ${
                service.popular ? "ring-2 ring-secondary md:scale-105 md:-translate-y-2" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {service.popular && (
                <div className="absolute top-4 right-4 z-10 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </div>
              )}
              
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{service.title}</CardTitle>
                  <div className="text-right">
                    <span className="text-secondary font-display font-bold text-xl block">
                      {service.price}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {service.duration}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={service.popular ? "hero" : "outline"}
                  className="w-full"
                  onClick={() => document.querySelector("#reservas")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Reservar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Extras */}
        <div className="bg-card rounded-2xl p-8 shadow-soft">
          <h3 className="font-display text-2xl font-bold text-center mb-2">
            Extras y Recargos
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            Servicios adicionales para un cuidado completo
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {extras.map((extra) => (
              <div
                key={extra.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <extra.icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold block">{extra.name}</span>
                  <span className="text-secondary font-bold">{extra.price}</span>
                  <span className="text-muted-foreground text-xs block">{extra.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
