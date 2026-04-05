import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { vehicleData } from "@/data/vehicleData";
import { Checkbox } from "@/components/ui/checkbox";
import {
  format, parseISO, isToday, isTomorrow, startOfWeek, addDays,
  isSameDay, addWeeks, subWeeks, isAfter, startOfDay, addDays as addD,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  LogOut, Calendar as CalIcon, Clock, Phone, Car, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Droplets, Search, Filter,
  TrendingUp, CalendarCheck, CalendarX, Hourglass, ChevronLeft,
  ChevronRight, Ban, Trash2, List, CalendarDays, Plus, User,
  Mail, Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_type: string;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}
interface BlockedDay { id: string; blocked_date: string; reason: string; }
interface BusinessHours { day_of_week: number; open_time: string; close_time: string; is_open: boolean; }

// ─── Datos compartidos con la web ─────────────────────────────────────────────
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
const SERVICES = [
  { value: "exterior",  label: "Lavado Exterior",             description: "Exterior, llantas, cristales",           prices: { "2": 15, "5": 15, "7": 20 }, duration: "30 min" },
  { value: "interior",  label: "Lavado Interior",             description: "Aspirado, salpicadero, cristales int.",   prices: { "2": 30, "5": 35, "7": 40 }, duration: "60-90 min" },
  { value: "completo",  label: "Lavado Completo",             description: "Exterior + Interior completo",            prices: { "2": 40, "5": 45, "7": 55 }, duration: "90-120 min" },
  { value: "tapiceria", label: "Lavado Integral + Tapicería", description: "Asientos, alfombras, moqueta",            prices: { "2": 80, "5": 90, "7": 110 }, duration: "150-210 min" },
];
const EXTRAS = [
  { value: "ceramica",       label: "Tratamiento cerámico",   price: 25 },
  { value: "ozono",          label: "Ozono",                  price: 15 },
  { value: "motor",          label: "Lavado motor",           price: 20 },
  { value: "faros",          label: "Pulido de faros",        price: 35 },
  { value: "tapiceria_extra",label: "Limpieza tapicería extra",price: 20 },
];
const SEVILLA_HOLIDAYS = [
  "2025-01-01","2025-01-06","2025-04-18","2025-05-01","2025-08-15","2025-10-12",
  "2025-11-01","2025-12-06","2025-12-08","2025-12-25","2025-02-28","2025-04-17","2025-05-30",
  "2026-01-01","2026-01-06","2026-04-03","2026-05-01","2026-08-15","2026-10-12",
  "2026-11-01","2026-12-06","2026-12-08","2026-12-25","2026-02-28","2026-04-02","2026-05-30",
].map(d => new Date(d + "T00:00:00"));
const isHoliday = (date: Date) => SEVILLA_HOLIDAYS.some(h => isSameDay(h, date));
const DEFAULT_HOURS: BusinessHours[] = [0,1,2,3,4,5,6].map(d => ({
  day_of_week: d, open_time: "10:00", close_time: "21:00", is_open: d !== 0,
}));

// ─── Constantes UI ────────────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = { exterior:"Exterior", interior:"Interior", completo:"Completo", tapiceria:"Integral+Tap." };
const SERVICE_COLORS: Record<string, string> = { exterior:"bg-blue-100 text-blue-800", interior:"bg-purple-100 text-purple-800", completo:"bg-teal-100 text-teal-800", tapiceria:"bg-amber-100 text-amber-800" };
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label:"Pendiente",  color:"bg-amber-100 text-amber-800 border-amber-200", icon:<Hourglass className="w-3 h-3"/> },
  confirmed: { label:"Confirmada", color:"bg-green-100 text-green-800 border-green-200",  icon:<CheckCircle className="w-3 h-3"/> },
  cancelled: { label:"Cancelada",  color:"bg-red-100 text-red-800 border-red-200",        icon:<XCircle className="w-3 h-3"/> },
  completed: { label:"Completada", color:"bg-blue-100 text-blue-800 border-blue-200",     icon:<CalendarCheck className="w-3 h-3"/> },
};
const WORK_HOURS: string[] = [];
for (let h = 10; h <= 20; h++) { WORK_HOURS.push(`${String(h).padStart(2,"0")}:00`); if (h<20) WORK_HOURS.push(`${String(h).padStart(2,"0")}:30`); }
WORK_HOURS.push("20:30");
const SERVICE_SLOTS: Record<string, number> = { exterior:1, interior:3, completo:4, tapiceria:7 };
const timeToMin = (t: string) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const slotsForBooking = (b: Booking) => SERVICE_SLOTS[b.service_type] ?? 1;
const parseNotes = (notes: string | null) => ({
  vehicle: notes?.match(/Vehículo: ([^|]+)/)?.[1]?.trim() ?? null,
  extras:  notes?.match(/Extras: ([^|]+)/)?.[1]?.trim() ?? null,
  total:   notes?.match(/Total: (\d+)€/)?.[1] ?? null,
});

// ─── Estado inicial del formulario telefónico ─────────────────────────────────
const EMPTY_FORM = { name:"", lastName:"", phone:"", email:"", vehicleBrand:"", vehicleModel:"", vehicleType:"", seats:"" };

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [blockedDays,  setBlockedDays]  = useState<BlockedDay[]>([]);
  const [businessHours,setBusinessHours]= useState<BusinessHours[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState<string | null>(null);
  const [view,         setView]         = useState<"list"|"calendar"|"nueva">("list");

  // ── Filtros lista
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterDate,   setFilterDate]   = useState("all");

  // ── Calendario admin
  const [weekStart,    setWeekStart]    = useState(() => startOfWeek(new Date(), { weekStartsOn:1 }));
  const [blockReason,  setBlockReason]  = useState("Día festivo / Cerrado");
  const [expandedId,   setExpandedId]   = useState<string|null>(null);

  // ── Formulario nueva reserva telefónica
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [selectedService, setSelectedService] = useState("");
  const [selectedExtras,  setSelectedExtras]  = useState<string[]>([]);
  const [selectedDate,    setSelectedDate]    = useState<Date|undefined>(undefined);
  const [selectedTime,    setSelectedTime]    = useState("");
  const [filteredBrands,  setFilteredBrands]  = useState<string[]>([]);
  const [filteredModels,  setFilteredModels]  = useState<string[]>([]);
  const [phoneBookings,   setPhoneBookings]   = useState<Booking[]>([]);
  const [formStep,        setFormStep]        = useState<1|2|3|4|5>(1);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [errors,          setErrors]          = useState<Record<string,string>>({});

  // ── Fetch
  const fetchBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });
    if (data) setBookings(data);
    if (showLoading) setLoading(false);
  }, []);
  const fetchBlockedDays = useCallback(async () => {
    const { data } = await supabase.from("blocked_days").select("*").order("blocked_date",{ascending:true});
    setBlockedDays(data ?? []);
  }, []);
  const fetchBusinessHours = useCallback(async () => {
    const { data } = await supabase.from("business_hours").select("*");
    if (data && data.length > 0) setBusinessHours(data);
    else setBusinessHours(DEFAULT_HOURS);
  }, []);

  useEffect(() => {
    fetchBookings(); fetchBlockedDays(); fetchBusinessHours();
    const ch = supabase.channel("admin-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"bookings"},()=>fetchBookings(false))
      .on("postgres_changes",{event:"*",schema:"public",table:"blocked_days"},fetchBlockedDays)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchBookings, fetchBlockedDays, fetchBusinessHours]);

  // Actualizar bookings disponibles para el formulario teléfono en tiempo real
  useEffect(() => {
    // Reservas activas para bloquear slots en formulario telefónico
    const active = bookings.filter(b => ["pending","confirmed"].includes(b.status) && b.status !== "cancelled");
    setPhoneBookings(active);
  }, [bookings]);

  // ── Acciones reservas
  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);

    // 1. ACTUALIZACIÓN OPTIMISTA: modifica el estado local inmediatamente
    //    para que la UI responda al instante sin esperar a Supabase
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

    // Cerrar tarjeta expandida en calendario al cancelar/completar
    if (status === "cancelled" || status === "completed") {
      setExpandedId(null);
    }

    // 2. Actualizar en Supabase
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      // Si hay error, revertir el estado optimista
      toast({ title: "Error al actualizar", variant: "destructive" });
      await fetchBookings(false); // refetch para restaurar estado real
    } else {
      toast({ title: `Reserva ${STATUS_CONFIG[status]?.label.toLowerCase()}` });
      // Refetch silencioso en background para sincronizar con el servidor
      fetchBookings(false);
    }
    setUpdating(null);
  };

  // ── Acciones días bloqueados
  const blockDay = async (dateStr: string) => {
    const { error } = await supabase.from("blocked_days").insert({ blocked_date: dateStr, reason: blockReason || "Cerrado" });
    if (error) toast({ title: error.code==="23505" ? "Ya está bloqueado" : "Error al bloquear", variant:"destructive" });
    else { toast({ title:`${format(parseISO(dateStr),"d MMM",{locale:es})} bloqueado` }); fetchBlockedDays(); }
  };
  const unblockDay = async (id: string, dateStr: string) => {
    const { error } = await supabase.from("blocked_days").delete().eq("id", id);
    if (error) toast({ title:"Error al desbloquear", variant:"destructive" });
    else { toast({ title:`${format(parseISO(dateStr),"d MMM",{locale:es})} disponible` }); fetchBlockedDays(); }
  };
  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  // ── Helpers calendario
  const isBlocked    = (d: Date) => blockedDays.some(b => isSameDay(parseISO(b.blocked_date), d));
  const getBlockInfo = (d: Date) => blockedDays.find(b => isSameDay(parseISO(b.blocked_date), d));
  const dayBookings  = (d: Date) => bookings.filter(b => b.booking_date === format(d,"yyyy-MM-dd") && b.status !== "cancelled");
  // Solo reservas activas (no canceladas) que EMPIEZAN en esta franja
  const slotBookings = (d: Date, t: string) => bookings.filter(
    b => b.booking_date === format(d,"yyyy-MM-dd") &&
         b.booking_time === t &&
         b.status !== "cancelled"
  );
  const slotIsCovered = (d: Date, t: string) => {
    const dateStr = format(d,"yyyy-MM-dd"); const tMin = timeToMin(t);
    return bookings.filter(b => b.status !== "cancelled").some(b => {
      if (b.booking_date !== dateStr) return false;
      const startMin = timeToMin(b.booking_time); const endMin = startMin + slotsForBooking(b)*30;
      return tMin > startMin && tMin < endMin;
    });
  };

  // ── Helpers formulario teléfono
  const effectiveHours = businessHours.length > 0 ? businessHours : DEFAULT_HOURS;
  const isDateClosed = (date: Date) => {
    if (date.getDay() === 0) return true;
    if (isHoliday(date)) return true;
    if (isBlocked(date)) return true;
    const h = effectiveHours.find(h => h.day_of_week === date.getDay());
    return !h?.is_open;
  };
  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hours = effectiveHours.find(h => h.day_of_week === dayOfWeek);
    if (!hours?.is_open) return [];
    const slots: string[] = [];
    const [openH, openM] = hours.open_time.split(":").map(Number);
    const [closeH, closeM] = hours.close_time.split(":").map(Number);
    let cur = new Date(); cur.setHours(openH, openM, 0, 0);
    const end = new Date(); end.setHours(closeH, closeM, 0, 0);
    while (cur < end) { slots.push(format(cur,"HH:mm")); cur.setMinutes(cur.getMinutes()+30); }
    return slots;
  };
  const isSlotOccupied = (date: Date, time: string) => {
    const dateStr = format(date,"yyyy-MM-dd"); const slotMin = timeToMin(time);
    return phoneBookings.some(b => {
      if (b.booking_date !== dateStr) return false;
      const startMin = timeToMin(b.booking_time); const endMin = startMin + (SERVICE_SLOTS[b.service_type]??1)*30;
      return slotMin >= startMin && slotMin < endMin;
    });
  };
  const calcTotal = () => {
    let t = 0;
    if (selectedService && formData.seats) { const s = SERVICES.find(s=>s.value===selectedService); if(s) t += s.prices[formData.seats as "2"|"5"|"7"]||0; }
    selectedExtras.forEach(ev => { const e=EXTRAS.find(e=>e.value===ev); if(e) t+=e.price; });
    return t;
  };
  const validateStep1 = () => {
    const errs: Record<string,string> = {};
    if (!formData.name.trim()) errs.name = "Nombre obligatorio";
    if (!formData.lastName.trim()) errs.lastName = "Apellidos obligatorios";
    if (!formData.phone.trim()) errs.phone = "Teléfono obligatorio";
    else if (!/^[6789]\d{8}$/.test(formData.phone.replace(/\D/g,""))) errs.phone = "Teléfono español inválido";
    if (!formData.vehicleBrand) errs.vehicleBrand = "Marca obligatoria";
    if (!formData.vehicleModel) errs.vehicleModel = "Modelo obligatorio";
    if (!formData.vehicleType) errs.vehicleType = "Tipo obligatorio";
    if (!formData.seats) errs.seats = "Plazas obligatorias";
    setErrors(errs); return Object.keys(errs).length === 0;
  };
  const handlePhoneSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService) { toast({title:"Selecciona servicio, fecha y hora",variant:"destructive"}); return; }
    if (!validateStep1()) { toast({title:"Corrige los errores",variant:"destructive"}); return; }
    setIsSubmitting(true);
    const fullName = `${formData.name} ${formData.lastName}`.trim();
    const vehicleInfo = `${formData.vehicleBrand} ${formData.vehicleModel} (${formData.vehicleType}, ${formData.seats} plazas)`;
    const service = SERVICES.find(s=>s.value===selectedService);
    const extrasInfo = selectedExtras.length > 0 ? selectedExtras.map(ev=>EXTRAS.find(e=>e.value===ev)?.label).join(", ") : "Ninguno";
    const total = calcTotal();
    const { error } = await supabase.from("bookings").insert({
      customer_name: fullName, customer_email: formData.email || "", customer_phone: formData.phone.replace(/\D/g,""),
      service_type: selectedService, booking_date: format(selectedDate,"yyyy-MM-dd"), booking_time: selectedTime,
      notes: `Vehículo: ${vehicleInfo} | Extras: ${extrasInfo} | Total: ${total}€ | Origen: Llamada telefónica`,
      status: "confirmed",
    });
    setIsSubmitting(false);
    if (error) { toast({title:"Error al guardar reserva",variant:"destructive"}); return; }
    toast({ title:"✅ Reserva telefónica guardada", description:`${fullName} — ${format(selectedDate,"d 'de' MMMM",{locale:es})} a las ${selectedTime}`, duration:5000 });
    setFormData(EMPTY_FORM); setSelectedService(""); setSelectedExtras([]); setSelectedDate(undefined); setSelectedTime(""); setErrors({}); setFormStep(1);
  };
  const resetPhoneForm = () => {
    setFormData(EMPTY_FORM); setSelectedService(""); setSelectedExtras([]); setSelectedDate(undefined); setSelectedTime(""); setErrors({}); setFormStep(1);
  };

  // ── Filtros lista
  const filtered = useMemo(() => bookings.filter(b => {
    const ms = !search || b.customer_name.toLowerCase().includes(search.toLowerCase()) || (b.customer_phone??"").includes(search) || (b.customer_email??"").toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus==="all" || (filterStatus==="active" && ["pending","confirmed"].includes(b.status)) || b.status===filterStatus;
    const date = parseISO(b.booking_date);
    const md = filterDate==="all" || (filterDate==="today"&&isToday(date)) || (filterDate==="tomorrow"&&isTomorrow(date)) || (filterDate==="upcoming"&&isAfter(date,startOfDay(new Date())));
    return ms && mst && md;
  }), [bookings, search, filterStatus, filterDate]);
  const stats = {
    total:     bookings.filter(b=>["pending","confirmed"].includes(b.status)).length,
    pending:   bookings.filter(b=>b.status==="pending").length,
    confirmed: bookings.filter(b=>b.status==="confirmed").length,
    today:     bookings.filter(b=>isToday(parseISO(b.booking_date))&&b.status!=="cancelled").length,
  };
  const weekDays = Array.from({length:7},(_,i)=>addDays(weekStart,i));
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  // ── Tarjeta compacta calendario (expandible)
  const CompactCard = ({ b }: { b: Booking }) => {
    const { vehicle, extras, total } = parseNotes(b.notes);
    const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
    const isExpanded = expandedId === b.id;
    const isUp = updating === b.id;
    return (
      <div className={cn("text-xs rounded border-l-2 cursor-pointer transition-all",
        b.status==="confirmed" ? "border-green-500 bg-green-50" : b.status==="cancelled" ? "border-gray-300 bg-gray-50" : "border-amber-400 bg-amber-50"
      )} onClick={() => setExpandedId(isExpanded ? null : b.id)}>
        <div className="px-1.5 py-1">
          <div className="font-semibold truncate text-foreground">{b.customer_name}</div>
          <div className="text-muted-foreground">{SERVICE_LABELS[b.service_type]??b.service_type}</div>
          {b.customer_phone && <div className="flex items-center gap-0.5 text-muted-foreground"><Phone className="w-2.5 h-2.5"/>{b.customer_phone}</div>}
          {total && <div className="font-semibold text-secondary">{total}€</div>}
        </div>
        {isExpanded && (
          <div className="border-t px-1.5 py-1.5 space-y-1 bg-white/80" onClick={e=>e.stopPropagation()}>
            {vehicle && <div className="flex items-center gap-1 text-xs"><Car className="w-3 h-3 text-muted-foreground"/>{vehicle}</div>}
            {extras && extras!=="Ninguno" && <div className="text-xs text-muted-foreground">Extras: {extras}</div>}
            <div className="flex items-center gap-1"><Badge className={`text-xs border ${sc.color} flex items-center gap-0.5`}>{sc.icon}{sc.label}</Badge></div>
            <div className="flex gap-1 flex-wrap pt-1">
              {b.status==="pending" && <>
                <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 text-white px-2" disabled={isUp} onClick={()=>updateStatus(b.id,"confirmed")}>✓ Confirmar</Button>
                <Button size="sm" variant="outline" className="h-6 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2" disabled={isUp} onClick={()=>updateStatus(b.id,"cancelled")}>✗ Cancelar</Button>
              </>}
              {b.status==="confirmed" && <>
                <Button size="sm" className="h-6 text-xs px-2" disabled={isUp} onClick={()=>updateStatus(b.id,"completed")}><CalendarCheck className="w-3 h-3 mr-1"/>Completada</Button>
                <Button size="sm" variant="outline" className="h-6 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2" disabled={isUp} onClick={()=>updateStatus(b.id,"cancelled")}>✗ Cancelar</Button>
              </>}
              {["cancelled","completed"].includes(b.status) && <Button size="sm" variant="outline" className="h-6 text-xs px-2" disabled={isUp} onClick={()=>updateStatus(b.id,"pending")}><AlertCircle className="w-3 h-3 mr-1"/>Reabrir</Button>}
              {b.customer_phone && <a href={`https://wa.me/34${b.customer_phone.replace(/\D/g,"").slice(-9)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}><Button size="sm" variant="outline" className="h-6 text-xs px-2 text-green-700 border-green-200 hover:bg-green-50"><Phone className="w-3 h-3 mr-1"/>WA</Button></a>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Tarjeta completa (lista)
  const FullCard = ({ b }: { b: Booking }) => {
    const sc = STATUS_CONFIG[b.status]??STATUS_CONFIG.pending;
    const isUp = updating===b.id;
    const { vehicle, extras, total } = parseNotes(b.notes);
    const fmtDate = (s:string)=>{ const d=parseISO(s); return isToday(d)?"Hoy":isTomorrow(d)?"Mañana":format(d,"EEE d MMM",{locale:es}); };
    const phoneNotes = b.notes?.includes("Llamada telefónica");
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1 sm:min-w-[90px] sm:text-center">
              <div className="flex items-center gap-1.5 text-secondary font-semibold text-sm"><CalIcon className="w-3.5 h-3.5"/><span className="capitalize">{fmtDate(b.booking_date)}</span></div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm"><Clock className="w-3.5 h-3.5"/>{b.booking_time}</div>
              {phoneNotes && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">📞 Teléfono</span>}
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch"/>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{b.customer_name}</span>
                <Badge className={`text-xs border ${sc.color} flex items-center gap-1`}>{sc.icon}{sc.label}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {b.customer_phone && <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="w-3.5 h-3.5"/>{b.customer_phone}</a>}
                {vehicle && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5"/>{vehicle}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${SERVICE_COLORS[b.service_type]??"bg-muted text-foreground"}`}>{SERVICE_LABELS[b.service_type]??b.service_type}</span>
                {extras && extras!=="Ninguno" && <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">+ {extras}</span>}
                {total && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-semibold">{total} €</span>}
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-col gap-2 sm:min-w-[130px]">
              {b.status==="pending" && <>
                <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white" disabled={isUp} onClick={()=>updateStatus(b.id,"confirmed")}><CheckCircle className="w-3.5 h-3.5 mr-1"/>Confirmar</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50" disabled={isUp}><XCircle className="w-3.5 h-3.5 mr-1"/>Cancelar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
                    <AlertDialogDescription>Reserva de <strong>{b.customer_name}</strong>. Quedará cancelada — puedes reabrirla.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>No, mantener</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={()=>updateStatus(b.id,"cancelled")}>Sí, cancelar</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>}
              {b.status==="confirmed" && <>
                <Button size="sm" disabled={isUp} onClick={()=>updateStatus(b.id,"completed")}><CalendarCheck className="w-3.5 h-3.5 mr-1"/>Completada</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50" disabled={isUp}><XCircle className="w-3.5 h-3.5 mr-1"/>Cancelar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
                    <AlertDialogDescription>Reserva de <strong>{b.customer_name}</strong>. Quedará cancelada — puedes reabrirla.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>No, mantener</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={()=>updateStatus(b.id,"cancelled")}>Sí, cancelar</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>}
              {["cancelled","completed"].includes(b.status) && <Button size="sm" variant="outline" className="text-xs" disabled={isUp} onClick={()=>updateStatus(b.id,"pending")}><AlertCircle className="w-3.5 h-3.5 mr-1"/>Reabrir</Button>}
              {b.customer_phone && <a href={`https://wa.me/34${b.customer_phone.replace(/\D/g,"").slice(-9)}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="w-full text-xs text-green-700 border-green-200 hover:bg-green-50"><Phone className="w-3.5 h-3.5 mr-1"/>WhatsApp</Button></a>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><Droplets className="w-6 h-6 text-secondary"/><span className="font-bold text-lg">MetroWash</span><span className="text-muted-foreground text-sm hidden sm:inline">— Admin</span></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              {(["list","calendar","nueva"] as const).map(v => (
                <button key={v} onClick={()=>setView(v)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  view===v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {v==="list"?<><List className="w-3.5 h-3.5"/>Lista</>:v==="calendar"?<><CalendarDays className="w-3.5 h-3.5"/>Calendario</>:<><Plus className="w-3.5 h-3.5"/>Nueva reserva</>}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={()=>{fetchBookings();fetchBlockedDays();}} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading?"animate-spin":""}`}/></Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1"/>Salir</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{label:"Activas",value:stats.total,icon:<TrendingUp className="w-4 h-4"/>,color:"text-blue-600"},
            {label:"Pendientes",value:stats.pending,icon:<Hourglass className="w-4 h-4"/>,color:"text-amber-600"},
            {label:"Confirmadas",value:stats.confirmed,icon:<CheckCircle className="w-4 h-4"/>,color:"text-green-600"},
            {label:"Hoy",value:stats.today,icon:<CalIcon className="w-4 h-4"/>,color:"text-secondary"},
          ].map(s=>(
            <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4">
              <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent></Card>
          ))}
        </div>

        {/* ══ VISTA LISTA ══ */}
        {view==="list" && (<>
          <Card className="border-0 shadow-sm"><CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input placeholder="Buscar por nombre, teléfono o email..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9"/></div>
              <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-full sm:w-52"><Filter className="w-3.5 h-3.5 mr-1.5"/><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="active">Activas (pend. + conf.)</SelectItem><SelectItem value="all">Todas</SelectItem><SelectItem value="pending">Solo pendientes</SelectItem><SelectItem value="confirmed">Solo confirmadas</SelectItem><SelectItem value="cancelled">Canceladas</SelectItem><SelectItem value="completed">Completadas</SelectItem></SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}><SelectTrigger className="w-full sm:w-44"><CalIcon className="w-3.5 h-3.5 mr-1.5"/><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas las fechas</SelectItem><SelectItem value="today">Hoy</SelectItem><SelectItem value="tomorrow">Mañana</SelectItem><SelectItem value="upcoming">Próximas</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card>
          <div>
            <p className="text-sm text-muted-foreground mb-3">{filtered.length} reserva{filtered.length!==1?"s":""}</p>
            {loading ? <div className="space-y-3">{[1,2,3].map(i=><Card key={i} className="border-0 shadow-sm animate-pulse"><CardContent className="p-4 h-24 bg-muted/30"/></Card>)}</div>
            : filtered.length===0 ? <Card className="border-0 shadow-sm"><CardContent className="p-12 text-center"><CalendarX className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3"/><p className="text-muted-foreground font-medium">No hay reservas</p></CardContent></Card>
            : <div className="space-y-3">{filtered.map(b=><FullCard key={b.id} b={b}/>)}</div>}
          </div>
        </>)}

        {/* ══ VISTA CALENDARIO ══ */}
        {view==="calendar" && (<div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={()=>setWeekStart(subWeeks(weekStart,1))}><ChevronLeft className="w-4 h-4"/>Anterior</Button>
            <div className="text-center">
              <p className="font-semibold">{format(weekStart,"d MMM",{locale:es})} – {format(addDays(weekStart,6),"d MMM yyyy",{locale:es})}</p>
              <button className="text-xs text-secondary hover:underline" onClick={()=>setWeekStart(startOfWeek(new Date(),{weekStartsOn:1}))}>Ir a hoy</button>
            </div>
            <Button variant="outline" size="sm" onClick={()=>setWeekStart(addWeeks(weekStart,1))}>Siguiente<ChevronRight className="w-4 h-4"/></Button>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-amber-400 bg-amber-50 inline-block"/>Pendiente</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-green-500 bg-green-50 inline-block"/>Confirmada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"/>Bloqueado</span>
            <span className="text-xs text-muted-foreground italic">Haz clic en una reserva para ver detalles y gestionarla</span>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
            <table className="w-full min-w-[720px] text-sm border-collapse">
              <thead><tr>
                <th className="w-14 border-r border-b bg-muted/40 py-2 px-1 text-xs text-muted-foreground font-medium"/>
                {weekDays.map(day => {
                  const blocked = isBlocked(day); const blockInfo = getBlockInfo(day);
                  const dBook = dayBookings(day); const isWeekend = day.getDay()===0;
                  return (
                    <th key={day.toISOString()} className={`border-r border-b py-2 px-1 font-medium min-w-[130px] ${isToday(day)?"bg-secondary/10":blocked?"bg-red-50":isWeekend?"bg-muted/20":"bg-muted/10"}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs uppercase tracking-wide ${isToday(day)?"text-secondary":"text-muted-foreground"}`}>{format(day,"EEE",{locale:es})}</span>
                        <span className={`text-xl font-bold ${isToday(day)?"text-secondary":"text-foreground"}`}>{format(day,"d")}</span>
                        {blocked ? (
                          <div className="flex flex-col items-center gap-0.5 w-full px-1">
                            <span className="text-xs text-red-600 font-medium flex items-center gap-0.5"><Ban className="w-3 h-3"/>Bloqueado</span>
                            <span className="text-xs text-red-400 truncate max-w-[100px]">{blockInfo?.reason}</span>
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-red-600 hover:bg-red-100 px-2" onClick={()=>unblockDay(blockInfo!.id,blockInfo!.blocked_date)}><Trash2 className="w-3 h-3 mr-1"/>Desbloquear</Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 w-full px-1">
                            {dBook.length>0 && <span className="text-xs text-muted-foreground">{dBook.length} reserva{dBook.length!==1?"s":""}</span>}
                            {!isWeekend && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="h-6 text-xs px-2 border-red-200 text-red-600 hover:bg-red-50"><Ban className="w-3 h-3 mr-1"/>Bloquear</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Bloquear {format(day,"EEEE d 'de' MMMM",{locale:es})}</AlertDialogTitle>
                                  <AlertDialogDescription>Los clientes no podrán reservar.{dBook.length>0 && <span className="block mt-2 text-amber-600 font-medium">⚠️ Hay {dBook.length} reserva(s) activa(s). Cancélalas manualmente.</span>}</AlertDialogDescription></AlertDialogHeader>
                                  <div className="px-6 pb-2 space-y-1.5"><Label>Motivo</Label><Input value={blockReason} onChange={e=>setBlockReason(e.target.value)} placeholder="Ej: Festivo, Vacaciones..."/></div>
                                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={()=>blockDay(format(day,"yyyy-MM-dd"))}>Bloquear día</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr></thead>
              <tbody>
                {WORK_HOURS.map(hour => (
                  <tr key={hour} className="hover:bg-muted/10">
                    <td className="border-r border-b py-1 px-2 text-xs text-muted-foreground text-right align-top w-14 bg-muted/10">{hour}</td>
                    {weekDays.map(day => {
                      const blocked = isBlocked(day); const cellBk = slotBookings(day,hour);
                      const isWeekend = day.getDay()===0; const covered = !blocked && slotIsCovered(day,hour);
                      if (covered) return null;
                      const mainBk = cellBk[0]; const rowSpanVal = mainBk ? slotsForBooking(mainBk) : 1;
                      return (
                        <td key={day.toISOString()} rowSpan={rowSpanVal} className={`border-r border-b py-1 px-1 align-top ${isToday(day)?"bg-secondary/5":blocked?"bg-red-50/50":isWeekend?"bg-muted/10":""}`} style={{minHeight:rowSpanVal*36,verticalAlign:"top"}}>
                          {blocked ? <div className="h-8 flex items-center justify-center"><Ban className="w-3 h-3 text-red-300 opacity-40"/></div>
                          : <div className="space-y-0.5 h-full">{cellBk.map(b=><CompactCard key={b.id} b={b}/>)}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {blockedDays.length>0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm flex items-center gap-2"><Ban className="w-4 h-4 text-red-500"/>Días bloqueados</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4"><div className="flex flex-wrap gap-2">
                {blockedDays.map(b=>(
                  <div key={b.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-sm">
                    <Ban className="w-3.5 h-3.5 text-red-500"/>
                    <span className="font-medium text-red-700 capitalize">{format(parseISO(b.blocked_date),"EEE d MMM yyyy",{locale:es})}</span>
                    <span className="text-red-400 text-xs">{b.reason}</span>
                    <button onClick={()=>unblockDay(b.id,b.blocked_date)} className="text-red-400 hover:text-red-600 ml-1"><XCircle className="w-4 h-4"/></button>
                  </div>
                ))}
              </div></CardContent>
            </Card>
          )}
        </div>)}

        {/* ══ NUEVA RESERVA TELEFÓNICA ══ */}
        {view==="nueva" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg flex items-center gap-2"><Phone className="w-5 h-5 text-secondary"/>Reserva telefónica</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Registra una reserva recibida por llamada. Se guardará como confirmada directamente.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetPhoneForm}><RefreshCw className="w-4 h-4 mr-1"/>Limpiar</Button>
                </div>
              </CardContent>
            </Card>

            {/* Indicador de pasos */}
            <nav aria-label="Pasos">
              <ol className="flex items-center gap-1 md:gap-2">
                {["Datos","Servicio","Extras","Resumen","Fecha"].map((label,i)=>(
                  <li key={label} className="flex flex-col items-center flex-1">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",formStep>i+1?"bg-secondary text-secondary-foreground":formStep===i+1?"bg-secondary text-secondary-foreground":"bg-muted text-muted-foreground")}>
                      {formStep>i+1 ? <CheckCircle className="w-3 h-3"/> : i+1}
                    </div>
                    <span className={cn("text-xs mt-1 text-center hidden sm:block",formStep>=i+1?"text-foreground font-medium":"text-muted-foreground")}>{label}</span>
                  </li>
                ))}
              </ol>
            </nav>

            {/* PASO 1: Datos cliente y vehículo */}
            {formStep===1 && (
              <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle className="flex items-center gap-2 text-lg"><User className="w-4 h-4 text-secondary"/>Datos del cliente y vehículo</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="p-name">Nombre *</Label>
                    <Input id="p-name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Ej: Juan" className={errors.name?"border-destructive":""}/>
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div><Label htmlFor="p-lastName">Apellidos *</Label>
                    <Input id="p-lastName" value={formData.lastName} onChange={e=>setFormData({...formData,lastName:e.target.value})} placeholder="Ej: García López" className={errors.lastName?"border-destructive":""}/>
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="p-phone" className="flex items-center gap-1"><Phone className="w-3 h-3"/>Teléfono *</Label>
                    <Input id="p-phone" type="tel" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value.replace(/[^\d+\s]/g,"")})} placeholder="600 123 456" className={errors.phone?"border-destructive":""}/>
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div><Label htmlFor="p-email" className="flex items-center gap-1"><Mail className="w-3 h-3"/>Email <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                    <Input id="p-email" type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="cliente@email.com"/>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="font-medium flex items-center gap-2 mb-3"><Car className="w-4 h-4 text-secondary"/>Vehículo</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Marca *</Label>
                      <div className="relative">
                        <Input value={formData.vehicleBrand} onChange={e=>{const v=e.target.value;setFormData({...formData,vehicleBrand:v,vehicleModel:""});setFilteredBrands(Object.keys(vehicleData).filter(b=>b.toLowerCase().includes(v.toLowerCase())));setFilteredModels([]);}} placeholder="Ej: Volkswagen" className={errors.vehicleBrand?"border-destructive":""}/>
                        {filteredBrands.length>0 && <ul className="absolute z-30 w-full bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">{filteredBrands.map(brand=><li key={brand} className="px-3 py-2 hover:bg-muted cursor-pointer text-sm" onClick={()=>{setFormData({...formData,vehicleBrand:brand,vehicleModel:""});setFilteredBrands([]);}}>{brand}</li>)}</ul>}
                      </div>
                      {errors.vehicleBrand && <p className="text-xs text-destructive mt-1">{errors.vehicleBrand}</p>}
                    </div>
                    <div><Label>Modelo *</Label>
                      <div className="relative">
                        <Input disabled={!formData.vehicleBrand} value={formData.vehicleModel} onChange={e=>{const v=e.target.value;setFormData({...formData,vehicleModel:v});const models=vehicleData[formData.vehicleBrand]?.filter(m=>m.toLowerCase().includes(v.toLowerCase()))||[];setFilteredModels(models.length?models:["Otros"]);}} placeholder="Ej: Golf" className={errors.vehicleModel?"border-destructive":""}/>
                        {filteredModels.length>0 && formData.vehicleBrand && <ul className="absolute z-30 w-full bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">{filteredModels.map(model=><li key={model} className="px-3 py-2 hover:bg-muted cursor-pointer text-sm" onClick={()=>{setFormData({...formData,vehicleModel:model});setFilteredModels([]);}}>{model}</li>)}</ul>}
                      </div>
                      {errors.vehicleModel && <p className="text-xs text-destructive mt-1">{errors.vehicleModel}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div><Label>Tipo de vehículo *</Label>
                      <Select value={formData.vehicleType} onValueChange={v=>setFormData({...formData,vehicleType:v})}>
                        <SelectTrigger className={errors.vehicleType?"border-destructive":""}><SelectValue placeholder="Selecciona tipo"/></SelectTrigger>
                        <SelectContent>{vehicleTypes.map(t=><SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.vehicleType && <p className="text-xs text-destructive mt-1">{errors.vehicleType}</p>}
                    </div>
                    <div><Label>Número de plazas *</Label>
                      <Select value={formData.seats} onValueChange={v=>setFormData({...formData,seats:v})}>
                        <SelectTrigger className={errors.seats?"border-destructive":""}><SelectValue placeholder="Selecciona plazas"/></SelectTrigger>
                        <SelectContent>{seatOptions.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.seats && <p className="text-xs text-destructive mt-1">{errors.seats}</p>}
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            )}

            {/* PASO 2: Servicio */}
            {formStep===2 && (
              <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle>Elige el servicio</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                {SERVICES.map(service=>{
                  const price = formData.seats ? service.prices[formData.seats as "2"|"5"|"7"] : null;
                  return (
                    <button key={service.value} onClick={()=>setSelectedService(service.value)} className={cn("w-full p-4 rounded-xl border-2 text-left transition-all",selectedService===service.value?"border-secondary bg-secondary/10":"border-border hover:border-secondary/70")}>
                      <div className="flex justify-between items-start">
                        <div><div className="font-semibold">{service.label}</div><div className="text-muted-foreground text-sm mt-0.5">{service.description}</div><div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/>{service.duration}</div></div>
                        <span className="text-secondary font-bold text-lg">{price!==null?`${price}€`:"—"}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent></Card>
            )}

            {/* PASO 3: Extras */}
            {formStep===3 && (
              <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-secondary"/>Extras (opcional)</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-2">
                {EXTRAS.map(extra=>(
                  <div key={extra.value} className={cn("p-3 rounded-lg border transition-colors cursor-pointer",selectedExtras.includes(extra.value)?"border-secondary bg-secondary/10":"border-border hover:border-secondary/50")} onClick={()=>setSelectedExtras(prev=>prev.includes(extra.value)?prev.filter(e=>e!==extra.value):[...prev,extra.value])}>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedExtras.includes(extra.value)} onCheckedChange={()=>setSelectedExtras(prev=>prev.includes(extra.value)?prev.filter(e=>e!==extra.value):[...prev,extra.value])}/>
                      <span className="font-medium flex-1">{extra.label}</span>
                      <span className="font-bold text-secondary">+{extra.price}€</span>
                    </div>
                  </div>
                ))}
              </CardContent></Card>
            )}

            {/* PASO 4: Resumen */}
            {formStep===4 && (
              <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle>Resumen de la reserva</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg"><div className="font-medium flex items-center gap-1.5 mb-2"><User className="w-3.5 h-3.5"/>Cliente</div>
                  <div className="text-sm">{formData.name} {formData.lastName}</div>
                  {formData.phone && <div className="text-sm text-muted-foreground">{formData.phone}</div>}
                  {formData.email && <div className="text-sm text-muted-foreground">{formData.email}</div>}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg"><div className="font-medium flex items-center gap-1.5 mb-2"><Car className="w-3.5 h-3.5"/>Vehículo</div>
                  <div className="text-sm">{formData.vehicleBrand} {formData.vehicleModel}</div>
                  <div className="text-sm text-muted-foreground">{vehicleTypes.find(t=>t.value===formData.vehicleType)?.label} · {formData.seats} plazas</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg"><div className="font-medium mb-2">Servicio</div>
                  <div className="flex justify-between"><span>{SERVICES.find(s=>s.value===selectedService)?.label}</span><span className="font-medium">{SERVICES.find(s=>s.value===selectedService)?.prices[formData.seats as "2"|"5"|"7"]??0}€</span></div>
                </div>
                {selectedExtras.length>0 && <div className="p-4 bg-muted/50 rounded-lg"><div className="font-medium mb-2">Extras</div>
                  {selectedExtras.map(ev=>{const e=EXTRAS.find(x=>x.value===ev);return e?<div key={ev} className="flex justify-between text-sm"><span>{e.label}</span><span>+{e.price}€</span></div>:null;})}
                </div>}
                <div className="p-4 bg-secondary/10 border border-secondary rounded-lg"><div className="flex justify-between items-center"><span className="font-bold">Total estimado</span><span className="text-secondary font-bold text-2xl">{calcTotal()}€</span></div></div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"><Phone className="w-4 h-4 flex-shrink-0"/>Esta reserva se guardará como <strong>Confirmada</strong> directamente (origen: llamada telefónica)</div>
              </CardContent></Card>
            )}

            {/* PASO 5: Fecha y hora */}
            {formStep===5 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle className="flex items-center gap-2"><CalIcon className="w-4 h-4 text-secondary"/>Selecciona fecha</CardTitle></CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="bg-background border rounded-lg p-2 overflow-x-auto">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={es}
                      disabled={date=>{const today=new Date();today.setHours(0,0,0,0);return date<today||date>addDays(new Date(),30)||isDateClosed(date);}}
                      modifiers={{holiday:d=>isHoliday(d),sunday:d=>d.getDay()===0}}
                      modifiersClassNames={{holiday:"text-destructive/80 opacity-80",sunday:"text-muted opacity-50"}}
                      className="w-full mx-auto"/>
                  </div>
                </CardContent></Card>
                <Card className="border-0 shadow-lg"><CardHeader className="px-6 pt-6 pb-4"><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary"/>Selecciona hora</CardTitle></CardHeader>
                <CardContent className="px-6 pb-6">
                  {selectedDate ? availableSlots.length>0 ? (<>
                    <p className="text-muted-foreground mb-4 text-sm">Horarios para el <span className="font-medium text-foreground">{format(selectedDate,"EEEE d 'de' MMMM",{locale:es})}</span></p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map(slot=>{const occ=isSlotOccupied(selectedDate,slot);return(
                        <button key={slot} disabled={occ} onClick={()=>!occ&&setSelectedTime(slot)} className={cn("py-2.5 px-2 text-sm font-medium rounded-md transition-all",occ?"bg-destructive/5 text-destructive/60 cursor-not-allowed line-through":selectedTime===slot?"bg-secondary text-secondary-foreground shadow-md":"bg-muted hover:bg-muted/80 text-foreground")}>
                          {slot}
                        </button>);})}
                    </div>
                  </>) : <div className="text-center py-8 text-muted-foreground"><CalIcon className="w-10 h-10 mx-auto opacity-40 mb-2"/><p>No hay horarios este día.</p></div>
                  : <div className="text-center py-10 text-muted-foreground"><CalIcon className="w-12 h-12 mx-auto opacity-30 mb-3"/><p className="font-medium">Selecciona una fecha primero</p></div>}
                </CardContent></Card>
              </div>
            )}

            {/* Navegación pasos */}
            <div className="flex justify-between">
              {formStep>1 ? <Button variant="outline" onClick={()=>setFormStep(s=>(s-1) as 1|2|3|4|5)} disabled={isSubmitting}>← Anterior</Button> : <div/>}
              <div className="ml-auto">
                {formStep<5 ? (
                  <Button onClick={()=>{
                    if(formStep===1){if(validateStep1())setFormStep(2);}
                    else if(formStep===2){if(selectedService)setFormStep(3);else toast({title:"Selecciona un servicio",variant:"destructive"});}
                    else setFormStep(s=>(s+1) as 1|2|3|4|5);
                  }}>{formStep===4?"Seleccionar fecha →":"Siguiente →"}</Button>
                ) : (
                  <Button onClick={handlePhoneSubmit} disabled={isSubmitting||!selectedDate||!selectedTime} className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white">
                    {isSubmitting?<span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/>Guardando...</span>:<span className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Guardar reserva telefónica</span>}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
