-- ═══════════════════════════════════════════════════════════════════════════
-- SEGURIDAD: Solo el propietario autenticado puede modificar datos
-- Solo INSERT público (clientes pueden crear reservas sin cuenta)
-- UPDATE / DELETE / modificar horarios → requiere sesión autenticada
-- ═══════════════════════════════════════════════════════════════════════════

-- ── bookings: solo el propietario puede actualizar o eliminar reservas ────

CREATE POLICY "Only authenticated users can update bookings"
ON public.bookings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete bookings"
ON public.bookings
FOR DELETE
USING (auth.role() = 'authenticated');

-- ── business_hours: solo el propietario puede gestionar horarios ──────────

CREATE POLICY "Only authenticated users can insert business hours"
ON public.business_hours
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update business hours"
ON public.business_hours
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete business hours"
ON public.business_hours
FOR DELETE
USING (auth.role() = 'authenticated');
