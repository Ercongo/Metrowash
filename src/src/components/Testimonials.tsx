import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Terrero",
    role: "Cliente frecuente",
    avatar: "MG",
    rating: 5,
    text: "Increíble servicio. Reservé desde la app en 2 minutos y mi coche quedó impecable. El tratamiento de ozono es genial, especialmente teniendo perro.",
  },
  {
    name: "Rafael Cortes",
    role: "Empresario",
    avatar: "CR",
    rating: 5,
    text: "Llevo toda mi flota de empresa aquí. La posibilidad de reservar múltiples coches y pagar online me ahorra muchísimo tiempo. Muy recomendable.",
  },
  {
    name: "Ana Martínez",
    role: "Cliente desde 2023",
    avatar: "AM",
    rating: 5,
    text: "El mejor lavadero del centro comercial. Mientras hago la compra, me dejan el coche como nuevo. La app de recordatorios es muy útil.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonios
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground text-lg">
            Más de 500 clientes confían en MetroWash para el cuidado de sus vehículos.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-8 rounded-2xl bg-card shadow-soft border border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
