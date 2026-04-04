import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  format, parseISO, isToday, isTomorrow, startOfWeek, addDays,
  isSameDay, addWeeks, subWeeks, isAfter, startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  LogOut, Calendar, Clock, Phone, Car, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Droplets, Search, Filter,
  TrendingUp, CalendarCheck, CalendarX, Hourglass, ChevronLeft,
  ChevronRight, Ban, Trash2, List, CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Tipos ───────────────────────────────────────────────────────────────────
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

interface BlockedDay {
  id: string;
  blocked_date: string;
  reason: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  exterior:  "Exterior",
  interior:  "Interior",
  completo:  "Completo",
  tapiceria: "Integral + Tap.",
};

const SERVICE_COLORS: Record<string, string> = {
  exterior:  "bg-blue-100 text-blue-800",
  interior:  "bg-purple-100 text-purple-800",
  completo:  "bg-teal-100 text-teal-800",
  tapiceria: "bg-amber-100 text-amber-800",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Pendiente",  color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Hourglass className="w-3 h-3" /> },
  confirmed: { label: "Confirmada", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelada",  color: "bg-red-100 text-red-800 border-red-200",       icon: <XCircle className="w-3 h-3" /> },
  completed: { label: "Completada", color: "bg-blue-100 text-blue-800 border-blue-200",    icon: <CalendarCheck className="w-3 h-3" /> },
};

// Franjas horarias 10:00 – 21:00 cada 30 min
const WORK_HOURS: string[] = [];
for (let h = 10; h <= 20; h++) {
  WORK_HOURS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) WORK_HOURS.push(`${String(h).padStart(2, "0")}:30`);
}
WORK_HOURS.push("20:30");

// Franjas que bloquea cada servicio (30 min cada una)
const SERVICE_SLOTS: Record<string, number> = {
  exterior:  1,
  interior:  3,
  completo:  4,
  tapiceria: 7,
};

const timeToMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const slotsForBooking = (b: Booking) => SERVICE_SLOTS[b.service_type] ?? 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseNotes = (notes: string | null) => ({
  vehicle: notes?.match(/Vehículo: ([^|]+)/)?.[1]?.trim() ?? null,
  extras:  notes?.match(/Extras: ([^|]+)/)?.[1]?.trim() ?? null,
  total:   notes?.match(/Total: (\d+)€/)?.[1] ?? null,
});

// ─── Componente principal ─────────────────────────────────────────────────────
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<string | null>(null);
  const [view, setView]             = useState<"list" | "calendar">("list");

  // Filtros lista
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterDate, setFilterDate]     = useState("all");

  // Calendario
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [blockReason, setBlockReason] = useState("Día festivo / Cerrado");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });
    setBookings(data ?? []);
    setLoading(false);
  }, []);

  const fetchBlockedDays = useCallback(async () => {
    const { data } = await supabase
      .from("blocked_days")
      .select("*")
      .order("blocked_date", { ascending: true });
    setBlockedDays(data ?? []);
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchBlockedDays();
    const channel = supabase
      .channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings)
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_days" }, fetchBlockedDays)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBookings, fetchBlockedDays]);

  // ── Acciones ───────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast({ title: "Error al actualizar", variant: "destructive" });
    else { toast({ title: `Reserva ${STATUS_CONFIG[status]?.label.toLowerCase()}` }); fetchBookings(); }
    setUpdating(null);
  };

  const blockDay = async (dateStr: string) => {
    const { error } = await supabase
      .from("blocked_days")
      .insert({ blocked_date: dateStr, reason: blockReason || "Cerrado" });
    if (error) {
      toast({ title: error.code === "23505" ? "Ya está bloqueado" : "Error al bloquear", variant: "destructive" });
    } else {
      toast({ title: `Día ${format(parseISO(dateStr), "d MMM", { locale: es })} bloqueado` });
      fetchBlockedDays();
    }
  };

  const unblockDay = async (id: string, dateStr: string) => {
    const { error } = await supabase.from("blocked_days").delete().eq("id", id);
    if (error) toast({ title: "Error al desbloquear", variant: "destructive" });
    else { toast({ title: `${format(parseISO(dateStr), "d MMM", { locale: es })} disponible` }); fetchBlockedDays(); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); onLogout(); };

  // ── Helpers calendario ────────────────────────────────────────────────────
  const isBlocked    = (d: Date) => blockedDays.some((b) => isSameDay(parseISO(b.blocked_date), d));
  const getBlockInfo = (d: Date) => blockedDays.find((b) => isSameDay(parseISO(b.blocked_date), d));
  const dayBookings  = (d: Date) => bookings.filter((b) => b.booking_date === format(d, "yyyy-MM-dd") && b.status !== "cancelled");
  // Devuelve reservas que COMIENZAN en esta franja (para renderizar con rowSpan)
  const slotBookings = (d: Date, t: string) => dayBookings(d).filter((b) => b.booking_time === t);
  // Comprueba si esta franja está ocupada por una reserva que empezó ANTES
  const slotIsCovered = (d: Date, t: string) => {
    const dateStr = format(d, "yyyy-MM-dd");
    const tMin = timeToMin(t);
    return bookings.filter(b => b.status !== "cancelled").some(b => {
      if (b.booking_date !== dateStr) return false;
      const startMin = timeToMin(b.booking_time);
      const endMin = startMin + slotsForBooking(b) * 30;
      return tMin > startMin && tMin < endMin;
    });
  };

  // ── Filtros lista ──────────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const matchSearch = !search ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_phone ?? "").includes(search) ||
      (b.customer_email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && ["pending", "confirmed"].includes(b.status)) ||
      b.status === filterStatus;
    const date = parseISO(b.booking_date);
    const matchDate =
      filterDate === "all" ||
      (filterDate === "today"    && isToday(date)) ||
      (filterDate === "tomorrow" && isTomorrow(date)) ||
      (filterDate === "upcoming" && isAfter(date, startOfDay(new Date())));
    return matchSearch && matchStatus && matchDate;
  });

  const stats = {
    total:     bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    today:     bookings.filter((b) => isToday(parseISO(b.booking_date)) && b.status !== "cancelled").length,
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ── Tarjeta compacta (calendario) ─────────────────────────────────────────
  const CompactCard = ({ b }: { b: Booking }) => {
    const { total } = parseNotes(b.notes);
    return (
      <div className={`text-xs rounded px-1.5 py-1 border-l-2 cursor-default ${
        b.status === "confirmed" ? "border-green-500 bg-green-50" : "border-amber-400 bg-amber-50"
      }`}>
        <div className="font-semibold truncate">{b.customer_name.split(" ")[0]}</div>
        <div className="text-muted-foreground truncate">{SERVICE_LABELS[b.service_type] ?? b.service_type}</div>
        {total && <div className="text-secondary font-medium">{total}€</div>}
      </div>
    );
  };

  // ── Tarjeta completa (lista) ───────────────────────────────────────────────
  const FullCard = ({ b }: { b: Booking }) => {
    const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
    const isUp = updating === b.id;
    const { vehicle, extras, total } = parseNotes(b.notes);
    const fmtDate = (s: string) => {
      const d = parseISO(s);
      return isToday(d) ? "Hoy" : isTomorrow(d) ? "Mañana" : format(d, "EEE d MMM", { locale: es });
    };

    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Fecha */}
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1 sm:min-w-[90px] sm:text-center">
              <div className="flex items-center gap-1.5 text-secondary font-semibold text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span className="capitalize">{fmtDate(b.booking_date)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="w-3.5 h-3.5" /> {b.booking_time}
              </div>
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch" />
            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{b.customer_name}</span>
                <Badge className={`text-xs border ${sc.color} flex items-center gap-1`}>
                  {sc.icon} {sc.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {b.customer_phone && (
                  <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="w-3.5 h-3.5" /> {b.customer_phone}
                  </a>
                )}
                {vehicle && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {vehicle}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${SERVICE_COLORS[b.service_type] ?? "bg-muted text-foreground"}`}>
                  {SERVICE_LABELS[b.service_type] ?? b.service_type}
                </span>
                {extras && extras !== "Ninguno" && (
                  <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">+ {extras}</span>
                )}
                {total && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-semibold">{total} €</span>}
              </div>
            </div>
            {/* Acciones */}
            <div className="flex flex-wrap sm:flex-col gap-2 sm:min-w-[130px]">
              {b.status === "pending" && (
                <>
                  <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white" disabled={isUp} onClick={() => updateStatus(b.id, "confirmed")}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50" disabled={isUp}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Reserva de <strong>{b.customer_name}</strong>. Quedará marcada como cancelada — no se borra y puedes reabrirla desde "Canceladas".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, mantener</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => updateStatus(b.id, "cancelled")}>
                          Sí, cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {b.status === "confirmed" && (
                <Button size="sm" disabled={isUp} onClick={() => updateStatus(b.id, "completed")}>
                  <CalendarCheck className="w-3.5 h-3.5 mr-1" /> Completada
                </Button>
              )}
              {["cancelled", "completed"].includes(b.status) && (
                <Button size="sm" variant="outline" className="text-xs" disabled={isUp} onClick={() => updateStatus(b.id, "pending")}>
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> Reabrir
                </Button>
              )}
              {b.customer_phone && (
                <a href={`https://wa.me/34${b.customer_phone.replace(/\D/g, "").slice(-9)}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="w-full text-xs text-green-700 border-green-200 hover:bg-green-50">
                    <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-secondary" />
            <span className="font-bold text-lg">MetroWash</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">— Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "list" ? <><List className="w-3.5 h-3.5" /> Lista</> : <><CalendarDays className="w-3.5 h-3.5" /> Calendario</>}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => { fetchBookings(); fetchBlockedDays(); }} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Activas",    value: stats.total,     icon: <TrendingUp className="w-4 h-4" />,   color: "text-blue-600" },
            { label: "Pendientes", value: stats.pending,   icon: <Hourglass className="w-4 h-4" />,    color: "text-amber-600" },
            { label: "Confirmadas",value: stats.confirmed, icon: <CheckCircle className="w-4 h-4" />,  color: "text-green-600" },
            { label: "Hoy",        value: stats.today,     icon: <Calendar className="w-4 h-4" />,     color: "text-secondary" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ══ LISTA ══ */}
        {view === "list" && (
          <>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, teléfono o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-52">
                      <Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activas (pend. + conf.)</SelectItem>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Solo pendientes</SelectItem>
                      <SelectItem value="confirmed">Solo confirmadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="w-full sm:w-44">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="tomorrow">Mañana</SelectItem>
                      <SelectItem value="upcoming">Próximas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div>
              <p className="text-sm text-muted-foreground mb-3">{filtered.length} reserva{filtered.length !== 1 ? "s" : ""}</p>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map((i) => <Card key={i} className="border-0 shadow-sm animate-pulse"><CardContent className="p-4 h-24 bg-muted/30" /></Card>)}</div>
              ) : filtered.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <CalendarX className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">No hay reservas</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search || filterStatus !== "active" || filterDate !== "all" ? "Prueba con otros filtros" : "Las reservas aparecerán aquí cuando lleguen"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">{filtered.map((b) => <FullCard key={b.id} b={b} />)}</div>
              )}
            </div>
          </>
        )}

        {/* ══ CALENDARIO ══ */}
        {view === "calendar" && (
          <div className="space-y-4">
            {/* Navegación */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <div className="text-center">
                <p className="font-semibold">{format(weekStart, "d MMM", { locale: es })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}</p>
                <button className="text-xs text-secondary hover:underline" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                  Ir a hoy
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-amber-400 bg-amber-50 inline-block" /> Pendiente</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-green-500 bg-green-50 inline-block" /> Confirmada</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Bloqueado</span>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
              <table className="w-full min-w-[720px] text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="w-14 border-r border-b bg-muted/40 py-2 px-1 text-xs text-muted-foreground font-medium" />
                    {weekDays.map((day) => {
                      const blocked    = isBlocked(day);
                      const blockInfo  = getBlockInfo(day);
                      const dBookings  = dayBookings(day);
                      const isWeekend  = day.getDay() === 0;

                      return (
                        <th key={day.toISOString()} className={`border-r border-b py-2 px-1 font-medium min-w-[110px] ${
                          isToday(day) ? "bg-secondary/10" : blocked ? "bg-red-50" : isWeekend ? "bg-muted/20" : "bg-muted/10"
                        }`}>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs uppercase tracking-wide ${isToday(day) ? "text-secondary" : "text-muted-foreground"}`}>
                              {format(day, "EEE", { locale: es })}
                            </span>
                            <span className={`text-xl font-bold ${isToday(day) ? "text-secondary" : "text-foreground"}`}>
                              {format(day, "d")}
                            </span>

                            {blocked ? (
                              <div className="flex flex-col items-center gap-0.5 w-full px-1">
                                <span className="text-xs text-red-600 font-medium flex items-center gap-0.5">
                                  <Ban className="w-3 h-3" /> Bloqueado
                                </span>
                                <span className="text-xs text-red-400 truncate max-w-[90px]">{blockInfo?.reason}</span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs text-red-600 hover:bg-red-100 px-2"
                                  onClick={() => unblockDay(blockInfo!.id, blockInfo!.blocked_date)}>
                                  <Trash2 className="w-3 h-3 mr-1" /> Desbloquear
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 w-full px-1">
                                {dBookings.length > 0 && (
                                  <span className="text-xs text-muted-foreground">{dBookings.length} reserva{dBookings.length !== 1 ? "s" : ""}</span>
                                )}
                                {!isWeekend && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-red-200 text-red-600 hover:bg-red-50">
                                        <Ban className="w-3 h-3 mr-1" /> Bloquear
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Bloquear {format(day, "EEEE d 'de' MMMM", { locale: es })}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Los clientes no podrán hacer reservas este día.
                                          {dBookings.length > 0 && (
                                            <span className="block mt-2 text-amber-600 font-medium">
                                              ⚠️ Hay {dBookings.length} reserva(s) activa(s). Deberás cancelarlas manualmente desde la vista Lista.
                                            </span>
                                          )}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <div className="px-6 pb-2 space-y-1.5">
                                        <Label>Motivo del cierre</Label>
                                        <Input
                                          value={blockReason}
                                          onChange={(e) => setBlockReason(e.target.value)}
                                          placeholder="Ej: Festivo, Vacaciones..."
                                        />
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => blockDay(format(day, "yyyy-MM-dd"))}>
                                          Bloquear día
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {WORK_HOURS.map((hour) => (
                    <tr key={hour} className="hover:bg-muted/10">
                      <td className="border-r border-b py-1 px-2 text-xs text-muted-foreground text-right align-top w-14 bg-muted/10">
                        {hour}
                      </td>
                      {weekDays.map((day) => {
                        const blocked      = isBlocked(day);
                        const cellBookings = slotBookings(day, hour);
                        const isWeekend    = day.getDay() === 0;
                        const covered      = !blocked && slotIsCovered(day, hour);

                        // Si está cubierta por rowSpan de una reserva anterior, no renderizar celda
                        if (covered) return null;

                        // Calcular rowSpan: si hay reserva que empieza aquí, ocupa sus franjas
                        const mainBooking = cellBookings[0];
                        const rowSpanVal  = mainBooking ? slotsForBooking(mainBooking) : 1;

                        return (
                          <td
                            key={day.toISOString()}
                            rowSpan={rowSpanVal}
                            className={`border-r border-b py-1 px-1 align-top ${
                              isToday(day) ? "bg-secondary/5" : blocked ? "bg-red-50/50" : isWeekend ? "bg-muted/10" : ""
                            }`}
                            style={{ minHeight: rowSpanVal * 36, verticalAlign: "top" }}
                          >
                            {blocked ? (
                              <div className="h-8 flex items-center justify-center">
                                <Ban className="w-3 h-3 text-red-300 opacity-40" />
                              </div>
                            ) : (
                              <div className="space-y-0.5 h-full">
                                {cellBookings.map((b) => <CompactCard key={b.id} b={b} />)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lista de días bloqueados */}
            {blockedDays.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-500" /> Todos los días bloqueados
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {blockedDays.map((b) => (
                      <div key={b.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-sm">
                        <Ban className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-medium text-red-700 capitalize">
                          {format(parseISO(b.blocked_date), "EEE d MMM yyyy", { locale: es })}
                        </span>
                        <span className="text-red-400 text-xs">{b.reason}</span>
                        <button onClick={() => unblockDay(b.id, b.blocked_date)} className="text-red-400 hover:text-red-600 ml-1" title="Desbloquear">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
