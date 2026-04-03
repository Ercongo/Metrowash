import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";
import { BUSINESS } from "@/config/business";

const Terminos = () => {
  useEffect(() => {
    document.title = "Términos y Condiciones — MetroWash";
  }, []);

  return (
    <LegalLayout
      title="Términos y Condiciones de Uso"
      breadcrumb="Términos"
      description="Condiciones generales que regulan el uso de la plataforma MetroWash y la contratación de servicios."
      lastUpdated="3 de abril de 2026"
    >
      {/* 1. Objeto */}
      <section aria-labelledby="t1">
        <h2 id="t1">1. Objeto y Ámbito de Aplicación</h2>
        <p>
          Las presentes Condiciones Generales regulan el acceso y uso de la plataforma web <strong>MetroWash</strong> (en adelante, "la Plataforma"), así como la contratación de los servicios de lavado de vehículos ofrecidos en las instalaciones de CC Metromar, Mairena del Aljarafe (Sevilla).
        </p>
        <p>
          El acceso y uso de la Plataforma implica la aceptación plena y sin reservas de las presentes condiciones. Si no está de acuerdo con las mismas, le rogamos que no utilice este servicio.
        </p>
      </section>

      {/* 2. Titular */}
      <section aria-labelledby="t2">
        <h2 id="t2">2. Datos del Titular del Servicio</h2>
        <table aria-label="Datos del titular">
          <thead>
            <tr><th scope="col">Campo</th><th scope="col">Información</th></tr>
          </thead>
          <tbody>
            <tr><td>Empresa</td><td>MetroWash</td></tr>
            <tr><td>Dirección</td><td>{BUSINESS.address}</td></tr>
            <tr><td>Email</td><td><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></td></tr>
            <tr><td>Teléfono</td><td><a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a></td></tr>
          </tbody>
        </table>
      </section>

      {/* 3. Servicios */}
      <section aria-labelledby="t3">
        <h2 id="t3">3. Descripción de los Servicios</h2>
        <p>MetroWash ofrece servicios profesionales de limpieza y detailing de vehículos, que incluyen:</p>
        <ul>
          <li><strong>Lavado Exterior</strong> — limpieza de carrocería, llantas y cristales.</li>
          <li><strong>Lavado Interior</strong> — aspirado completo, salpicadero y cristales interiores.</li>
          <li><strong>Lavado Completo</strong> — combinación de interior y exterior.</li>
          <li><strong>Lavado Integral con Tapicería</strong> — tratamiento del textil de asientos, alfombras y moqueta.</li>
          <li><strong>Extras opcionales</strong> — tratamiento cerámico, ozono, lavado de motor, pulido de faros y limpieza de tapicería especial.</li>
        </ul>
        <p>Los precios vigentes son los indicados en la Plataforma en el momento de la reserva y pueden estar sujetos a variaciones según el tamaño y características del vehículo.</p>
      </section>

      {/* 4. Reservas */}
      <section aria-labelledby="t4">
        <h2 id="t4">4. Proceso de Reserva Online</h2>
        <h3>4.1 Requisitos</h3>
        <p>Para realizar una reserva el usuario debe:</p>
        <ul>
          <li>Ser mayor de 18 años o actuar con autorización de su representante legal.</li>
          <li>Proporcionar datos veraces, exactos y completos en el formulario.</li>
          <li>Disponer de un número de teléfono móvil español válido.</li>
        </ul>
        <h3>4.2 Confirmación</h3>
        <p>
          La reserva se considera confirmada cuando el sistema registra correctamente los datos y el usuario recibe la notificación de confirmación. MetroWash enviará un mensaje vía WhatsApp al número indicado con los detalles de la cita.
        </p>
        <h3>4.3 Modificación y Cancelación</h3>
        <p>
          El usuario puede modificar o cancelar su reserva contactando directamente con el establecimiento por teléfono (<a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>) o WhatsApp (<a href={BUSINESS.whatsappInfoUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>) con al menos <strong>2 horas de antelación</strong> a la cita programada.
        </p>
        <p>
          Las cancelaciones realizadas con menos de 2 horas de antelación o la no presentación sin aviso previo podrán ser consideradas como servicio realizado a efectos de gestión de agenda.
        </p>
      </section>

      {/* 5. Precios y pago */}
      <section aria-labelledby="t5">
        <h2 id="t5">5. Precios y Forma de Pago</h2>
        <p>
          Los precios indicados en la Plataforma incluyen el IVA aplicable y están expresados en euros (€). El pago se realiza <strong>en el momento de la prestación del servicio</strong>, directamente en las instalaciones de MetroWash, mediante los medios de pago disponibles (efectivo, tarjeta bancaria, Bizum).
        </p>
        <p>
          MetroWash se reserva el derecho de modificar los precios en cualquier momento, siendo aplicable el precio vigente en la fecha de la reserva.
        </p>
      </section>

      {/* 6. Obligaciones usuario */}
      <section aria-labelledby="t6">
        <h2 id="t6">6. Obligaciones del Usuario</h2>
        <p>El usuario se compromete a:</p>
        <ul>
          <li>Facilitar datos veraces y actualizados en el formulario de reserva.</li>
          <li>Acudir a la cita en el horario reservado, o avisar con suficiente antelación en caso de no poder asistir.</li>
          <li>No utilizar la Plataforma para fines ilícitos, fraudulentos o que infrinjan derechos de terceros.</li>
          <li>No reproducir, distribuir ni explotar comercialmente los contenidos de la Plataforma sin autorización expresa.</li>
        </ul>
      </section>

      {/* 7. Responsabilidad */}
      <section aria-labelledby="t7">
        <h2 id="t7">7. Limitación de Responsabilidad</h2>
        <p>MetroWash no será responsable de:</p>
        <ul>
          <li>Fallos en el acceso a la Plataforma debidos a causas ajenas a su control (fallos de red, interrupciones de servicio de terceros, etc.).</li>
          <li>Daños preexistentes en el vehículo no comunicados antes del inicio del servicio.</li>
          <li>Pérdida u olvido de objetos personales en el interior del vehículo durante la prestación del servicio.</li>
          <li>Uso indebido de la Plataforma por parte del usuario.</li>
        </ul>
        <p>
          MetroWash responde de los daños causados al vehículo durante la prestación del servicio cuando sean directamente imputables al personal del establecimiento, conforme a la legislación española aplicable.
        </p>
      </section>

      {/* 8. Propiedad intelectual */}
      <section aria-labelledby="t8">
        <h2 id="t8">8. Propiedad Intelectual e Industrial</h2>
        <p>
          Todos los contenidos de la Plataforma (diseño, textos, imágenes, logotipos, código fuente) son titularidad de MetroWash o de sus licenciantes y están protegidos por la legislación española e internacional de propiedad intelectual. Queda expresamente prohibida su reproducción, distribución o modificación sin autorización previa y por escrito.
        </p>
      </section>

      {/* 9. Ley aplicable */}
      <section aria-labelledby="t9">
        <h2 id="t9">9. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Las presentes Condiciones se rigen por la legislación española. Para la resolución de cualquier conflicto derivado del uso de la Plataforma o de la prestación de los servicios, las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de Sevilla, salvo que la normativa de consumidores y usuarios establezca otro fuero imperativo.
        </p>
        <p>
          Conforme al Reglamento (UE) n.º 524/2013, los consumidores de la UE pueden acceder a la plataforma de resolución de litigios en línea (ODR) de la Comisión Europea:{" "}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </section>

      {/* 10. Modificaciones */}
      <section aria-labelledby="t10">
        <h2 id="t10">10. Modificaciones de las Condiciones</h2>
        <p>
          MetroWash se reserva el derecho de modificar las presentes Condiciones en cualquier momento. Los cambios se publicarán en esta página con la fecha de actualización. El uso continuado de la Plataforma tras dichos cambios implica su aceptación.
        </p>
      </section>

      {/* 11. Contacto */}
      <section aria-labelledby="t11">
        <h2 id="t11">11. Contacto</h2>
        <p>
          Para cualquier consulta relativa a las presentes Condiciones puede contactar con nosotros en:{" "}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> o en el teléfono{" "}
          <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>.
        </p>
        <p>
          Consulte también nuestra <Link to="/privacidad">Política de Privacidad</Link> y nuestra <Link to="/cookies">Política de Cookies</Link>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Terminos;
