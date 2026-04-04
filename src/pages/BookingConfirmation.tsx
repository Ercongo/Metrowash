import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle, Calendar, Clock, Car, MapPin,
  Phone, Share2, Home, CalendarPlus,
} from "lucide-react";

// ── Datos que vienen por query string desde el formulario ──────────────────
// /reserva-confirmada?nombre=Juan&fecha=2026-04-10&hora=15:00&servicio=Lavado+Completo&total=45&vehiculo=VW+Golf
const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const [shared, setShared] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const nombre   = searchParams.get("nombre")   || "Cliente";
  const fecha    = searchParams.get("fecha")     || "";
  const hora     = searchParams.get("hora")      || "";
  const servicio = searchParams.get("servicio")  || "Lavado";
  const total    = searchParams.get("total")     || "0";
  const vehiculo = searchParams.get("vehiculo")  || "";

  const fechaFormateada = fecha
    ? format(parseISO(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : "";

  // Enlace Google Calendar
  const calendarTitle  = encodeURIComponent(`Lavado MetroWash — ${servicio}`);
  const calendarStart  = fecha && hora ? fecha.replace(/-/g, "") + "T" + hora.replace(":", "") + "00" : "";
  const calendarEnd    = calendarStart.slice(0, -6) + String(Number(hora.split(":")[1] || 0) + 30).padStart(2, "0") + "00";
  const calendarNotes  = encodeURIComponent(`MetroWash — ${servicio}\nVehículo: ${vehiculo}\nTotal: ${total}€\nDirección: ${BUSINESS.address}`);
  const calendarUrl    = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${calendarStart}/${calendarEnd}&details=${calendarNotes}&location=${encodeURIComponent(BUSINESS.address)}`;

  // Compartir nativo (Web Share API)
  const handleShare = async () => {
    const text = `✅ He reservado en MetroWash:\n📅 ${fechaFormateada}\n⏰ ${hora}\n🚗 ${servicio}\n📍 ${BUSINESS.address}`;
    if (navigator.share) {
      await navigator.share({ title: "Mi reserva en MetroWash", text, url: "https://metrowash.vercel.app" });
      setShared(true);
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  // Cuenta atrás para volver al inicio (solo si hay datos)
  useEffect(() => {
    if (!fecha) return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); navigate("/"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fecha, navigate]);

  // Si no hay datos (acceso directo a la URL), redirigir
  if (!fecha) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="border-0 shadow-lg max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No hay datos de reserva.</p>
            <Button onClick={() => navigate("/")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">

        {/* Cabecera de éxito */}
        <div className="text-center space-y-3 py-6">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-600" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            ¡Reserva confirmada!
          </h1>
          <p className="text-muted-foreground text-base">
            Hola <strong>{nombre.split(" ")[0]}</strong>, tu cita está registrada correctamente.
          </p>
        </div>

        {/* Tarjeta de detalles */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />
          <CardContent className="p-6 space-y-4">

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fecha</p>
                <p className="font-semibold text-foreground capitalize">{fechaFormateada}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hora</p>
                <p className="font-semibold text-foreground">{hora}</p>
              </div>
            </div>

            {vehiculo && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Vehículo</p>
                  <p className="font-semibold text-foreground">{vehiculo}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dónde</p>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-secondary underline-offset-4 hover:underline text-sm"
                >
                  {BUSINESS.address}
                </a>
              </div>
            </div>

            {/* Total */}
            <div className="mt-2 p-4 bg-secondary/10 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Servicio</p>
                <p className="font-semibold text-foreground">{servicio}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-secondary">{total} €</p>
              </div>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Te llamaremos para confirmar la cita. Si necesitas cambiarla, escríbenos por WhatsApp.</span>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </Button>
          </a>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            {shared ? "¡Copiado!" : "Compartir"}
          </Button>
        </div>

        <a
          href={BUSINESS.whatsappInfoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            className="w-full gap-2 text-white"
            style={{ backgroundColor: "#25D366" }}
          >
            {/* WhatsApp icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.471 2.027 7.774L0 32l8.486-2.006A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm7.307 19.36c-.4-.2-2.364-1.167-2.731-1.3-.367-.133-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.687-.622-3.213-1.98-1.187-1.058-1.988-2.364-2.221-2.764-.233-.4-.025-.616.175-.816.181-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.655-.674-.9-.686l-.767-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.367-1.4 3.333s1.433 3.867 1.633 4.133c.2.267 2.821 4.308 6.833 6.042.955.413 1.7.66 2.281.844.958.305 1.831.262 2.52.159.769-.114 2.364-.967 2.697-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z"/>
            </svg>
            Contactar por WhatsApp
          </Button>
        </a>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Button>
          <span className="text-xs text-muted-foreground">
            (Automático en {countdown}s)
          </span>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
