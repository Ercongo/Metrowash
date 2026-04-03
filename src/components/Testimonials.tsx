import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Terrero",
    role: "Cliente frecuente",
    initials: "CT",
    rating: 5,
    text: "Increíble servicio. Reservé desde la app en 2 minutos y mi coche quedó impecable. El tratamiento de ozono es genial, especialmente teniendo perro.",
  },
  {
    name: "Rafael Cortes",
    role: "Empresario",
    initials: "RC",
    rating: 5,
    text: "Llevo toda mi flota de empresa aquí. La posibilidad de reservar múltiples coches y pagar online me ahorra muchísimo tiempo. Muy recomendable.",
  },
  {
    name: "Ana Martínez",
    role: "Cliente desde 2023",
    initials: "AM",
    rating: 5,
    text: "El mejor lavadero del centro comercial. Mientras hago la compra, me dejan el coche como nuevo. La app de recordatorios es muy útil.",
  },
];

const Testimonials = () => {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-24 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonios
          </span>
          <h2
            id="testimonials-heading"
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground text-lg">
            Más de 500 clientes confían en MetroWash para el cuidado de sus vehículos.
          </p>
        </div>

        {/* Testimonials Grid */}
        <ol className="grid md:grid-cols-3 gap-8 list-none p-0 m-0">
          {testimonials.map((testimonial, index) => (
            <li
              key={testimonial.name}
              className="relative p-8 rounded-2xl bg-card shadow-soft border border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary/20" aria-hidden="true" />

              {/* Rating */}
              <div
                className="flex gap-1 mb-4"
                role="img"
                aria-label={`Valoración: ${testimonial.rating} de 5 estrellas`}
              >
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" aria-hidden="true" />
                ))}
              </div>

              {/* Text */}
              <blockquote className="text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <footer className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground font-bold"
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </div>
                <div>
                  <cite className="font-semibold text-foreground not-italic">{testimonial.name}</cite>
                  <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                </div>
              </footer>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Testimonials;
