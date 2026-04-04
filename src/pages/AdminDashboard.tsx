import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import {
  LogOut, Calendar, Clock, User, Phone, Car, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Droplets, Search, Filter,
  TrendingUp, CalendarCheck, CalendarX, Hourglass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const SERVICE_LABELS: Record<string, string> = {
  exterior: "Lavado Exterior",
  interior: "Lavado Interior",
  completo: "Lavado Completo",
  tapiceria: "Lavado Integral + Tapicería",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Hourglass className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  completed: {
    label: "Completada",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CalendarCheck className="w-3 h-3" />,
  },
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (error) {
      toast({ title: "Error al cargar reservas", variant: "destructive" });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } else {
      toast({
        title: `Reserva ${STATUS_CONFIG[status]?.label.toLowerCase()}`,
        description: "Estado actualizado correctamente.",
      });
      fetchBookings();
    }
    setUpdating(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // Filtros
  const filtered = bookings.filter((b) => {
    const matchSearch =
      search === "" ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_phone || "").includes(search) ||
      (b.customer_email || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === "all" || b.status === filterStatus;

    const date = parseISO(b.booking_date);
    const matchDate =
      filterDate === "all" ||
      (filterDate === "today" && isToday(date)) ||
      (filterDate === "tomorrow" && isTomorrow(date)) ||
      (filterDate === "upcoming" && date >= new Date());

    return matchSearch && matchStatus && matchDate;
  });

  // Estadísticas
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    today: bookings.filter((b) => isToday(parseISO(b.booking_date))).length,
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "EEEE d MMM", { locale: es });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-secondary" />
            <span className="font-bold text-lg">MetroWash</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">— Panel Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchBookings} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1">Actualizar</span>
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
            { label: "Total reservas", value: stats.total, icon: <TrendingUp className="w-4 h-4" />, color: "text-blue-600" },
            { label: "Pendientes", value: stats.pending, icon: <Hourglass className="w-4 h-4" />, color: "text-amber-600" },
            { label: "Confirmadas", value: stats.confirmed, icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600" },
            { label: "Hoy", value: stats.today, icon: <Calendar className="w-4 h-4" />, color: "text-secondary" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>
                  {s.icon}
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-full sm:w-44">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Fecha" />
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

        {/* Lista de reservas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">
              Reservas{" "}
              <span className="text-muted-foreground font-normal text-sm">
                ({filtered.length} resultados)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-sm animate-pulse">
                  <CardContent className="p-4 h-24 bg-muted/30" />
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <CalendarX className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No hay reservas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search || filterStatus !== "all" || filterDate !== "all"
                    ? "Prueba con otros filtros"
                    : "Las reservas aparecerán aquí cuando lleguen"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const isUpdating = updating === booking.id;
                const notes = booking.notes || "";

                // Extraer vehículo del campo notes
                const vehicleMatch = notes.match(/Vehículo: ([^|]+)/);
                const vehicle = vehicleMatch ? vehicleMatch[1].trim() : null;

                // Extraer extras
                const extrasMatch = notes.match(/Extras: ([^|]+)/);
                const extras = extrasMatch ? extrasMatch[1].trim() : null;

                // Extraer total
                const totalMatch = notes.match(/Total: (\d+)€/);
                const total = totalMatch ? totalMatch[1] : null;

                return (
                  <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                        {/* Fecha y hora — columna izquierda */}
                        <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 sm:min-w-[90px] sm:text-center">
                          <div className="flex items-center gap-1.5 text-secondary font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-sm capitalize">{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.booking_time}
                          </div>
                        </div>

                        {/* Separador */}
                        <div className="hidden sm:block w-px bg-border self-stretch" />

                        {/* Info principal */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">{booking.customer_name}</span>
                            <Badge className={`text-xs border ${statusCfg.color} flex items-center gap-1`}>
                              {statusCfg.icon} {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {booking.customer_phone && (
                              <a
                                href={`tel:${booking.customer_phone}`}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                {booking.customer_phone}
                              </a>
                            )}
                            {vehicle && (
                              <span className="flex items-center gap-1">
                                <Car className="w-3.5 h-3.5" /> {vehicle}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                              {SERVICE_LABELS[booking.service_type] || booking.service_type}
                            </span>
                            {extras && extras !== "Ninguno" && (
                              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                + {extras}
                              </span>
                            )}
                            {total && (
                              <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded font-semibold">
                                {total} €
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap sm:flex-col gap-2 sm:min-w-[130px]">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                disabled={isUpdating}
                                onClick={() => updateStatus(booking.id, "confirmed")}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Confirmar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                                    disabled={isUpdating}
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    Cancelar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se cancelará la reserva de <strong>{booking.customer_name}</strong> para el{" "}
                                      {formatDate(booking.booking_date)} a las {booking.booking_time}.
                                      Esta acción se puede deshacer cambiando el estado manualmente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>No, mantener</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => updateStatus(booking.id, "cancelled")}
                                    >
                                      Sí, cancelar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              className="flex-1 sm:flex-none"
                              disabled={isUpdating}
                              onClick={() => updateStatus(booking.id, "completed")}
                            >
                              <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                              Completada
                            </Button>
                          )}

                          {(booking.status === "cancelled" || booking.status === "completed") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none text-xs"
                              disabled={isUpdating}
                              onClick={() => updateStatus(booking.id, "pending")}
                            >
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              Reabrir
                            </Button>
                          )}

                          {booking.customer_phone && (
                            <a
                              href={`https://wa.me/34${booking.customer_phone.replace(/\D/g, "").slice(-9)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
