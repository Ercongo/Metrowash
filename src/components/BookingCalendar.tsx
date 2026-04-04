import { useState, useEffect, useCallback } from "react";
import { BUSINESS } from "@/config/business";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehicleData } from "@/data/vehicleData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  User,
  Mail,
  Phone,
  Car,
  Plus,
  Send,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BusinessHours {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

interface Booking {
  booking_date: string;
  booking_time: string;
  status: string;
}

const vehicleTypes = [
  { value: "turismo", label: "Turismo" },
  { value: "suv", label: "SUV" },
  { value: "monovolumen", label: "Monovolumen" },
  { value: "furgoneta", label: "Furgoneta" },
  { value: "pickup", label: "Pick-up" },
];

const seatOptions = [
  { value: "2", label: "2 plazas" },
  { value: "5", label: "5 plazas" },
  { value: "7", label: "7+ plazas" },
];

const services = [
  {
    value: "exterior",
    label: "Lavado Exterior",
    description: "Exterior del vehículo, llantas, cristales",
    prices: { "2": 15, "5": 15, "7": 20 },
    duration: "30 min",
  },
  {
    value: "interior",
    label: "Lavado Interior",
    description: "Aspirado completo, salpicadero, cristales interiores",
    prices: { "2": 30, "5": 35, "7": 40 },
    duration: "60-90 min",
  },
  {
    value: "completo",
    label: "Lavado Completo",
    description: "Exterior + Interior completo",
    prices: { "2": 40, "5": 45, "7": 55 },
    duration: "90-120 min",
  },
  {
    value: "tapiceria",
    label: "Lavado Integral con Tapicería",
    description:
      "Tratamiento textil de asientos (cuero/alcántara/tela), desinfección alfombras y moqueta",
    prices: { "2": 80, "5": 90, "7": 110 },
    duration: "150-210 min + 30 min secado",
  },
];

const extras = [
  { value: "ceramica", label: "Tratamiento cerámico", price: 25, description: "Protección y brillo duradero" },
  { value: "ozono", label: "Ozono", price: 15, description: "Desinfección y eliminación de olores" },
  { value: "motor", label: "Lavado motor", price: 20, description: "Limpieza del compartimento motor" },
  { value: "faros", label: "Pulido de faros", price: 35, description: "Restauración de transparencia" },
  { value: "tapiceria_extra", label: "Limpieza tapicería extra", price: 20, description: "Manchas difíciles" },
];

// Festivos de Sevilla: nacionales + autonómicos de Andalucía + municipales de Sevilla
const SEVILLA_HOLIDAYS = [
  // 2025 – Nacionales
  "2025-01-01", "2025-01-06", "2025-04-18", "2025-05-01",
  "2025-08-15", "2025-10-12", "2025-11-01", "2025-12-06",
  "2025-12-08", "2025-12-25",
  // 2025 – Autonómicos Andalucía
  "2025-02-28", "2025-04-17",
  // 2025 – Municipal Sevilla (San Fernando)
  "2025-05-30",
  // 2026 – Nacionales
  "2026-01-01", "2026-01-06", "2026-04-03", "2026-05-01",
  "2026-08-15", "2026-10-12", "2026-11-01", "2026-12-06",
  "2026-12-08", "2026-12-25",
  // 2026 – Autonómicos Andalucía
  "2026-02-28", "2026-04-02",
  // 2026 – Municipal Sevilla (San Fernando)
  "2026-05-30",
].map(d => new Date(d + "T00:00:00"));

const isHoliday = (date: Date) =>
  SEVILLA_HOLIDAYS.some(holiday => isSameDay(holiday, date));

// Horario por defecto si Supabase no devuelve datos (Lun–Sáb 10:00–21:00)
const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day_of_week: 1, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 2, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 3, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 4, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 5, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 6, open_time: "10:00", close_time: "21:00", is_open: true },
  { day_of_week: 0, open_time: "10:00", close_time: "21:00", is_open: false },
];

const isValidEmail = (email: string) => {
  if (!email.trim()) return true; // opcional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  const clean = phone.replace(/\D/g, "");
  return /^[6789]\d{8}$/.test(clean) || /^\+34[6789]\d{8}$/.test(clean);
};

const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleType: "",
    seats: "",
  });
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch business hours
  useEffect(() => {
    const fetchBusinessHours = async () => {
      const { data, error } = await supabase.from("business_hours").select("*");
      if (data && !error) {
        setBusinessHours(data);
      }
    };
    fetchBusinessHours();
  }, []);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_date, booking_time, status")
        .in("status", ["pending", "confirmed"]);
      if (data && !error) {
        setBookings(data);
      }
    };
    fetchBookings();

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        fetchBookings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const calculateTotalPrice = () => {
    let total = 0;
    if (selectedService && formData.seats) {
      const service = services.find(s => s.value === selectedService);
      if (service) {
        total += service.prices[formData.seats as keyof typeof service.prices] || 0;
      }
    }
    selectedExtras.forEach(extraValue => {
      const extra = extras.find(e => e.value === extraValue);
      if (extra) total += extra.price;
    });
    return total;
  };

  const getEstimatedDuration = () => {
    const service = services.find(s => s.value === selectedService);
    if (!service) return "";
    return selectedExtras.length > 0 
      ? `${service.duration} (+ extras)` 
      : service.duration;
  };

  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const effectiveHours = businessHours.length > 0 ? businessHours : DEFAULT_BUSINESS_HOURS;
    const hours = effectiveHours.find(h => h.day_of_week === dayOfWeek);
    if (!hours?.is_open) return [];
    
    const slots: string[] = [];
    const [openH, openM] = hours.open_time.split(":").map(Number);
    const [closeH, closeM] = hours.close_time.split(":").map(Number);
    
    let current = new Date();
    current.setHours(openH, openM, 0, 0);
    const end = new Date();
    end.setHours(closeH, closeM, 0, 0);
    
    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  };

  const isSlotOccupied = (date: Date, time: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.some(b => b.booking_date === dateStr && b.booking_time === time);
  };

  const isDateClosed = (date: Date) => {
    if (date.getDay() === 0) return true; // Domingo siempre cerrado
    if (isHoliday(date)) return true;     // Festivos de Sevilla
    const effectiveHours = businessHours.length > 0 ? businessHours : DEFAULT_BUSINESS_HOURS;
    const hours = effectiveHours.find(h => h.day_of_week === date.getDay());
    return !hours?.is_open;
  };

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  const handleExtraToggle = (extraValue: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraValue) 
        ? prev.filter(e => e !== extraValue)
        : [...prev, extraValue]
    );
  };

  const validateStep1 = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nombre es obligatorio";
    if (!formData.lastName.trim()) newErrors.lastName = "Apellidos son obligatorios";
    if (!formData.phone.trim()) {
      newErrors.phone = "Teléfono es obligatorio";
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Teléfono debe ser español válido (6XX XXX XXX)";
    }
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Formato de correo inválido";
    }
    if (!formData.vehicleBrand) newErrors.vehicleBrand = "Marca es obligatoria";
    if (!formData.vehicleModel) newErrors.vehicleModel = "Modelo es obligatorio";
    if (!formData.vehicleType) newErrors.vehicleType = "Tipo de vehículo es obligatorio";
    if (!formData.seats) newErrors.seats = "Número de plazas es obligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  useEffect(() => {
    if (step === 1) validateStep1();
  }, [step, formData, validateStep1]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast({ title: "Error", description: "Selecciona servicio, fecha y hora", variant: "destructive" });
      return;
    }

    if (!validateStep1()) {
      toast({ title: "Corrige los errores", description: "Revisa los campos marcados", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const cleanPhone = cleanPhoneNumber(formData.phone);
    const fullName = `${formData.name} ${formData.lastName}`.trim();
    const vehicleInfo = `${formData.vehicleBrand} ${formData.vehicleModel} (${formData.vehicleType}, ${formData.seats} plazas)`;
    const service = services.find(s => s.value === selectedService);
    const selectedServiceLabel = service?.label || "Servicio no especificado";
    const extrasInfo = selectedExtras.length > 0
      ? selectedExtras.map(e => extras.find(ex => ex.value === e)?.label).join(", ")
      : "Ninguno";
    const totalPrice = calculateTotalPrice();
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const { error } = await supabase.from("bookings").insert({
      customer_name: fullName,
      customer_email: formData.email || "",
      customer_phone: cleanPhone,
      service_type: selectedService,
      booking_date: formattedDate,
      booking_time: selectedTime,
      notes: `Vehículo: ${vehicleInfo} | Extras: ${extrasInfo} | Total: ${totalPrice}€`,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Error en reserva:", error);
      toast({
        title: "❌ Error al reservar",
        description: "No se pudo crear la reserva. Intenta más tarde.",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    // ✅ ÉXITO
    toast({
      title: "✅ ¡Reserva confirmada!",
      description: `Tu cita para el ${format(selectedDate, "d 'de' MMMM 'a las' HH:mm", { locale: es })} está registrada.`,
      duration: 5000,
    });

    // 📩 Enviar a negocio (sin espacios extra)
    const messageToBusiness = encodeURIComponent(
      `📌 *NUEVA RESERVA ONLINE*\n\n` +
      `👤 *Cliente:* ${fullName}\n` +
      `📞 *Teléfono:* ${formData.phone}\n` +
      `${formData.email ? `📧 *Email:* ${formData.email}\n\n` : '\n'}` +
      `🚗 *Vehículo:* ${vehicleInfo}\n` +
      `🧼 *Servicio:* ${selectedServiceLabel}\n` +
      `➕ *Extras:* ${extrasInfo}\n\n` +
      `📅 *Fecha:* ${format(selectedDate, "dd/MM/yyyy")}\n` +
      `⏰ *Hora:* ${selectedTime}\n` +
      `💶 *Total:* ${totalPrice} €\n\n` +
      `📍 *Dirección:* ${BUSINESS.address}`
    );

    window.open(`https://wa.me/${BUSINESS.whatsappId}?text=${messageToBusiness}`, "_blank");

    // 📲 Confirmación al cliente
    const messageToCustomer =
      `¡Hola ${formData.name}! 👋\n\n` +
      `✅ Tu reserva en *MetroWash* ha sido registrada.\n\n` +
      `📅 *Fecha:* ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}\n` +
      `⏰ *Hora:* ${selectedTime}\n` +
      `🚗 *Vehículo:* ${vehicleInfo}\n` +
      `🧼 *Servicio:* ${selectedServiceLabel}\n` +
      (selectedExtras.length > 0 ? `➕ *Extras:* ${extrasInfo}\n` : "") +
      `💶 *Total estimado:* ${totalPrice} €\n\n` +
      `📍 *Dirección:* ${BUSINESS.address}\n\n` +
      `📞 Te llamaremos para confirmar. ¡Gracias! 🧼✨`;

    try {
      await navigator.clipboard.writeText(messageToCustomer);
      toast({
        title: "📱 Copiado",
        description: "Mensaje de confirmación listo para pegar en WhatsApp.",
        duration: 6000,
      });
    } catch {
      const encoded = encodeURIComponent(messageToCustomer);
      const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
      toast({
        title: "📲 ¿Guardar en WhatsApp?",
        description: "Confirma para enviarte el recordatorio.",
        action: (
          <Button size="sm" variant="default" onClick={() => window.open(url, "_blank")} className="gap-1">
            <Send className="h-3 w-3" /> Enviar
          </Button>
        ),
        duration: 10000,
      });
    }

    // Reset
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedService("");
    setSelectedExtras([]);
    setFormData({
      name: "", lastName: "", email: "", phone: "",
      vehicleBrand: "", vehicleModel: "", vehicleType: "", seats: "",
    });
    setErrors({});
    setStep(1);
  };

  const stepLabels = ["Datos", "Servicio", "Extras", "Resumen", "Fecha"];
  const isStep2Valid = !!selectedService;
  const isStep5Valid = selectedDate && selectedTime;

  return (
    <section id="reservas" aria-labelledby="booking-heading" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-2">
            Reservas Profesionales
          </span>
          <h2 id="booking-heading" className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            Reserva tu lavado en 60 segundos
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Sin llamadas. Sin esperas. Confirma tu cita online con total seguridad.
          </p>
        </div>

        {/* WCAG 4.1.3 / AAA — aria-live status for step changes */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Paso {step} de 5: {stepLabels[step - 1]}
        </p>

        {/* Progress Steps — WCAG 2.4.8 AAA location indicator */}
        <nav aria-label="Progreso de la reserva" className="flex justify-center mb-10">
          <ol className="flex items-center gap-1 md:gap-2 max-w-2xl w-full list-none p-0 m-0">
            {[1, 2, 3, 4, 5].map(s => (
              <li key={s} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step >= s ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  )}
                  aria-current={step === s ? "step" : undefined}
                  aria-label={`Paso ${s}: ${stepLabels[s - 1]}${step > s ? " (completado)" : step === s ? " (actual)" : ""}`}
                >
                  {step > s ? <Check className="w-3 h-3" aria-hidden="true" /> : s}
                </div>
                <span className={cn(
                  "text-xs mt-1 text-center hidden sm:block",
                  step >= s ? "text-foreground font-medium" : "text-muted-foreground"
                )} aria-hidden="true">
                  {stepLabels[s - 1]}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Datos personales y vehículo */}
          {step === 1 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-4 h-4 text-secondary" /> Datos del cliente y vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                {/* WCAG 1.3.1 / 1.3.5 AAA — fieldset groups related fields, autocomplete attributes */}
                <fieldset className="border-0 p-0 m-0">
                  <legend className="sr-only">Datos personales</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <Input
                        id="name"
                        autoComplete="given-name"
                        aria-required="true"
                        aria-describedby={errors.name ? "name-error" : undefined}
                        aria-invalid={!!errors.name}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Juan"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p id="name-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellidos <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
                        aria-required="true"
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        aria-invalid={!!errors.lastName}
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Ej: García López"
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && <p id="lastName-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="w-3 h-3" aria-hidden="true" /> Teléfono <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        aria-required="true"
                        aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                        aria-invalid={!!errors.phone}
                        value={formData.phone}
                        onChange={e => {
                          const value = e.target.value.replace(/[^\d+\s]/g, "");
                          setFormData({ ...formData, phone: value });
                        }}
                        placeholder="+34 600 123 456"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      <p id="phone-hint" className="text-xs text-muted-foreground mt-1">Formato español: 6XX XXX XXX</p>
                      {errors.phone && <p id="phone-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" aria-hidden="true" /> Email <span className="text-muted-foreground font-normal">(opcional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-required="false"
                        aria-describedby={errors.email ? "email-error" : undefined}
                        aria-invalid={!!errors.email}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p id="email-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.email}</p>}
                    </div>
                  </div>
                </fieldset>

                {/* WCAG 1.3.1 AAA — fieldset groups vehicle fields */}
                <fieldset className="border-0 p-0 m-0 pt-3 border-t">
                  <legend className="font-medium flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-secondary" aria-hidden="true" /> Vehículo
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleBrand">Marca <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <div className="relative">
                        <Input
                          id="vehicleBrand"
                          autoComplete="off"
                          aria-required="true"
                          aria-autocomplete="list"
                          aria-controls={filteredBrands.length > 0 ? "brand-suggestions" : undefined}
                          aria-describedby={errors.vehicleBrand ? "vehicleBrand-error" : undefined}
                          aria-invalid={!!errors.vehicleBrand}
                          value={formData.vehicleBrand}
                          onChange={e => {
                            const v = e.target.value;
                            setFormData({ ...formData, vehicleBrand: v, vehicleModel: "" });
                            const brands = Object.keys(vehicleData).filter(b =>
                              b.toLowerCase().includes(v.toLowerCase())
                            );
                            setFilteredBrands(brands);
                            setFilteredModels([]);
                          }}
                          placeholder="Ej: Volkswagen"
                          className={errors.vehicleBrand ? "border-destructive" : ""}
                        />
                        {filteredBrands.length > 0 && (
                          <ul
                            id="brand-suggestions"
                            role="listbox"
                            aria-label="Marcas sugeridas"
                            className="absolute z-30 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                          >
                            {filteredBrands.map(brand => (
                              <li
                                key={brand}
                                role="option"
                                aria-selected={formData.vehicleBrand === brand}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => {
                                  setFormData({ ...formData, vehicleBrand: brand, vehicleModel: "" });
                                  setFilteredBrands([]);
                                }}
                              >
                                {brand}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.vehicleBrand && <p id="vehicleBrand-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.vehicleBrand}</p>}
                    </div>
                    <div>
                      <Label htmlFor="vehicleModel">Modelo <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <div className="relative">
                        <Input
                          id="vehicleModel"
                          autoComplete="off"
                          aria-required="true"
                          aria-autocomplete="list"
                          aria-controls={filteredModels.length > 0 ? "model-suggestions" : undefined}
                          aria-describedby={errors.vehicleModel ? "vehicleModel-error" : "vehicleModel-hint"}
                          aria-invalid={!!errors.vehicleModel}
                          disabled={!formData.vehicleBrand}
                          value={formData.vehicleModel}
                          onChange={e => {
                            const v = e.target.value;
                            setFormData({ ...formData, vehicleModel: v });
                            const models = vehicleData[formData.vehicleBrand]?.filter(m =>
                              m.toLowerCase().includes(v.toLowerCase())
                            ) || [];
                            setFilteredModels(models.length ? models : ["Otros"]);
                          }}
                          placeholder="Ej: Golf"
                          className={errors.vehicleModel ? "border-destructive" : ""}
                        />
                        {filteredModels.length > 0 && formData.vehicleBrand && (
                          <ul
                            id="model-suggestions"
                            role="listbox"
                            aria-label="Modelos sugeridos"
                            className="absolute z-30 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                          >
                            {filteredModels.map(model => (
                              <li
                                key={model}
                                role="option"
                                aria-selected={formData.vehicleModel === model}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => {
                                  setFormData({ ...formData, vehicleModel: model });
                                  setFilteredModels([]);
                                }}
                              >
                                {model}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {!errors.vehicleModel && <p id="vehicleModel-hint" className="text-xs text-muted-foreground mt-1">Selecciona primero la marca</p>}
                      {errors.vehicleModel && <p id="vehicleModel-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.vehicleModel}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="vehicleType">Tipo de vehículo <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <Select
                        value={formData.vehicleType}
                        onValueChange={v => setFormData({ ...formData, vehicleType: v })}
                      >
                        <SelectTrigger
                          id="vehicleType"
                          aria-required="true"
                          aria-invalid={!!errors.vehicleType}
                          aria-describedby={errors.vehicleType ? "vehicleType-error" : undefined}
                          className={errors.vehicleType ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.vehicleType && <p id="vehicleType-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.vehicleType}</p>}
                    </div>
                    <div>
                      <Label htmlFor="seats">Número de plazas <abbr title="campo obligatorio" aria-label="obligatorio">*</abbr></Label>
                      <Select
                        value={formData.seats}
                        onValueChange={v => setFormData({ ...formData, seats: v })}
                      >
                        <SelectTrigger
                          id="seats"
                          aria-required="true"
                          aria-invalid={!!errors.seats}
                          aria-describedby={errors.seats ? "seats-error" : "seats-hint"}
                          className={errors.seats ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Selecciona plazas" />
                        </SelectTrigger>
                        <SelectContent>
                          {seatOptions.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p id="seats-hint" className="text-xs text-muted-foreground mt-1">El precio varía según el tamaño</p>
                      {errors.seats && <p id="seats-error" role="alert" className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.seats}</p>}
                    </div>
                  </div>
                </fieldset>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Servicio */}
          {step === 2 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle>Elige tu servicio</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Precios ajustados al tamaño de tu vehículo
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                {services.map(service => {
                  const price = formData.seats 
                    ? service.prices[formData.seats as keyof typeof service.prices] 
                    : null;
                  return (
                    <button
                      key={service.value}
                      onClick={() => setSelectedService(service.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md",
                        selectedService === service.value
                          ? "border-secondary bg-secondary/10 shadow-sm"
                          : "border-border hover:border-secondary/70"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base">{service.label}</div>
                          <div className="text-muted-foreground text-sm mt-1">{service.description}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </div>
                        </div>
                        <span className="text-secondary font-bold text-lg min-w-[50px] text-right">
                          {price !== null ? `${price}€` : "—"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Extras */}
          {step === 3 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-secondary" /> Extras (opcional)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mejora tu lavado con tratamientos premium
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-2">
                {extras.map(extra => (
                  <div
                    key={extra.value}
                    className={cn(
                      "p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedExtras.includes(extra.value)
                        ? "border-secondary bg-secondary/10"
                        : "border-border hover:border-secondary/50"
                    )}
                    onClick={() => handleExtraToggle(extra.value)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedExtras.includes(extra.value)}
                        onCheckedChange={() => handleExtraToggle(extra.value)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{extra.label}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{extra.description}</div>
                      </div>
                      <span className="font-bold text-secondary flex-shrink-0">+{extra.price}€</span>
                    </div>
                  </div>
                ))}
                
                {selectedExtras.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4 bg-muted/30 rounded-lg">
                    Puedes continuar sin extras si lo prefieres
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Resumen */}
          {step === 4 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle>Resumen de tu reserva</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium flex items-center gap-1.5 mb-2">
                      <User className="w-3.5 h-3.5" /> Cliente
                    </div>
                    <div className="text-sm">{formData.name} {formData.lastName}</div>
                    {formData.phone && <div className="text-sm text-muted-foreground">{formData.phone}</div>}
                    {formData.email && <div className="text-sm text-muted-foreground">{formData.email}</div>}
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium flex items-center gap-1.5 mb-2">
                      <Car className="w-3.5 h-3.5" /> Vehículo
                    </div>
                    <div className="text-sm">{formData.vehicleBrand} {formData.vehicleModel}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicleTypes.find(t => t.value === formData.vehicleType)?.label} · {formData.seats} plazas
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">Servicio</div>
                    <div className="flex justify-between">
                      <span>{services.find(s => s.value === selectedService)?.label}</span>
                      <span className="font-medium">
                        {services.find(s => s.value === selectedService)?.prices[
                          formData.seats as "2" | "5" | "7"
                        ] ?? 0}€
                      </span>
                    </div>
                  </div>

                  {selectedExtras.length > 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-medium mb-2">Extras</div>
                      {selectedExtras.map(ev => {
                        const e = extras.find(x => x.value === ev);
                        return e ? (
                          <div key={ev} className="flex justify-between text-sm">
                            <span>{e.label}</span>
                            <span>+{e.price}€</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="p-4 bg-secondary/10 border border-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Total</div>
                        <div className="text-sm text-muted-foreground">
                          ⏱️ {getEstimatedDuration()}
                        </div>
                      </div>
                      <div className="text-secondary font-bold text-2xl">{calculateTotalPrice()}€</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Fecha y hora */}
          {step === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendario */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-secondary" /> Selecciona fecha
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Solo mostramos días disponibles (lunes a sábado)
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="bg-background border rounded-lg p-2 sm:p-4 overflow-x-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={es}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date > addDays(new Date(), 30) || isDateClosed(date);
                      }}
                      modifiers={{
                        holiday: (date) => isHoliday(date),
                        sunday: (date) => date.getDay() === 0,
                      }}
                      modifiersClassNames={{
                        holiday: "text-destructive/80 opacity-80",
                        sunday: "text-muted opacity-50",
                      }}
                      className="w-full mx-auto"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                      <span>Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/60"></div>
                      <span>Festivo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                      <span>Cerrado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horarios */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" /> Selecciona hora
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {selectedDate ? (
                    availableSlots.length > 0 ? (
                      <>
                        <p className="text-muted-foreground mb-4 text-sm">
                          Horarios disponibles para el{" "}
                          <span className="font-medium text-foreground">
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map(slot => {
                            const occupied = isSlotOccupied(selectedDate, slot);
                            return (
                              <button
                                key={slot}
                                disabled={occupied}
                                onClick={() => !occupied && setSelectedTime(slot)}
                                className={cn(
                                  "py-2.5 px-2 text-sm font-medium rounded-md transition-all duration-200",
                                  occupied
                                    ? "bg-destructive/5 text-destructive/60 cursor-not-allowed line-through"
                                    : selectedTime === slot
                                    ? "bg-secondary text-secondary-foreground shadow-md"
                                    : "bg-muted hover:bg-muted/80 hover:shadow-sm text-foreground"
                                )}
                                title={occupied ? "Horario ocupado" : undefined}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-10 h-10 mx-auto opacity-40 mb-2" />
                        <p>No hay horarios disponibles este día.</p>
                        <p className="text-sm mt-1">Prueba con otro día.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto opacity-30 mb-3" />
                      <p className="font-medium">Selecciona una fecha primero</p>
                      <p className="text-sm mt-1">Haz clic en un día del calendario</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(s => (s - 1) as 1 | 2 | 3 | 4 | 5)}
                disabled={isSubmitting}
              >
                ← Anterior
              </Button>
            )}
            <div className="ml-auto">
              {step < 5 ? (
                <Button
                  variant="default"
                  onClick={() => {
                    if (step === 1) {
                      if (validateStep1()) setStep(2);
                    } else if (step === 2) {
                      if (isStep2Valid) setStep(3);
                      else toast({ title: "Selecciona un servicio", variant: "destructive" });
                    } else {
                      setStep(s => (s + 1) as 1 | 2 | 3 | 4 | 5);
                    }
                  }}
                >
                  {step === 4 ? "Seleccionar fecha" : "Siguiente →"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStep5Valid}
                  className="min-w-[180px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reservando...
                    </span>
                  ) : (
                    "✅ Confirmar Reserva"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;