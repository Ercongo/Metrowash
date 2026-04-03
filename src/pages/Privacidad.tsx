import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";
import { BUSINESS } from "@/config/business";

const Privacidad = () => {
  useEffect(() => {
    document.title = "Política de Privacidad — MetroWash";
  }, []);

  return (
    <LegalLayout
      title="Política de Privacidad"
      breadcrumb="Privacidad"
      description="Información sobre el tratamiento de sus datos personales conforme al RGPD y la LOPDGDD."
      lastUpdated="3 de abril de 2026"
    >
      {/* 1. Responsable */}
      <section aria-labelledby="s1">
        <h2 id="s1">1. Responsable del Tratamiento</h2>
        <p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDGDD), le informamos:</p>
        <table aria-label="Datos del responsable del tratamiento">
          <thead>
            <tr><th scope="col">Campo</th><th scope="col">Dato</th></tr>
          </thead>
          <tbody>
            <tr><td>Denominación social</td><td>MetroWash</td></tr>
            <tr><td>Dirección</td><td>{BUSINESS.address}</td></tr>
            <tr><td>Correo electrónico</td><td><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></td></tr>
            <tr><td>Teléfono</td><td><a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a></td></tr>
          </tbody>
        </table>
      </section>

      {/* 2. Datos recogidos */}
      <section aria-labelledby="s2">
        <h2 id="s2">2. Datos Personales que Tratamos</h2>
        <p>A través del formulario de reserva online recogemos los siguientes datos:</p>
        <ul>
          <li><strong>Nombre y apellidos</strong> — identificación del titular de la reserva.</li>
          <li><strong>Número de teléfono</strong> — confirmación y comunicación de la cita.</li>
          <li><strong>Correo electrónico</strong> (opcional) — envío de confirmaciones y recordatorios.</li>
          <li><strong>Información del vehículo</strong> (marca, modelo, tipo) — prestación del servicio.</li>
        </ul>
        <p>No recogemos datos especialmente protegidos (salud, ideología, origen étnico, etc.).</p>
      </section>

      {/* 3. Finalidad */}
      <section aria-labelledby="s3">
        <h2 id="s3">3. Finalidad y Base Jurídica del Tratamiento</h2>
        <table aria-label="Finalidades del tratamiento">
          <thead>
            <tr>
              <th scope="col">Finalidad</th>
              <th scope="col">Base jurídica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gestión y confirmación de reservas</td>
              <td>Ejecución del contrato — art. 6.1.b RGPD</td>
            </tr>
            <tr>
              <td>Envío de recordatorios de cita</td>
              <td>Interés legítimo — art. 6.1.f RGPD</td>
            </tr>
            <tr>
              <td>Comunicaciones comerciales (si las solicita)</td>
              <td>Consentimiento expreso — art. 6.1.a RGPD</td>
            </tr>
            <tr>
              <td>Cumplimiento de obligaciones legales</td>
              <td>Obligación legal — art. 6.1.c RGPD</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 4. Conservación */}
      <section aria-labelledby="s4">
        <h2 id="s4">4. Plazos de Conservación</h2>
        <p>
          Los datos de reserva se conservan durante <strong>3 años</strong> desde la realización del servicio, en cumplimiento de las obligaciones fiscales y mercantiles (art. 30 Código de Comercio y normativa tributaria).
          Transcurrido dicho plazo, los datos serán eliminados o anonimizados de forma segura.
        </p>
      </section>

      {/* 5. Destinatarios */}
      <section aria-labelledby="s5">
        <h2 id="s5">5. Destinatarios y Transferencias Internacionales</h2>
        <p>Sus datos se almacenan en <strong>Supabase</strong> (base de datos en la nube alojada en la UE — región West EU, Irlanda), proveedor que cumple el RGPD y con quien existe un Acuerdo de Tratamiento de Datos (DPA). No se realizan transferencias internacionales fuera del Espacio Económico Europeo.</p>
        <p>No cedemos datos a terceros salvo obligación legal.</p>
      </section>

      {/* 6. Derechos */}
      <section aria-labelledby="s6">
        <h2 id="s6">6. Sus Derechos</h2>
        <p>Como interesado puede ejercer en cualquier momento los siguientes derechos:</p>
        <ul>
          <li><strong>Acceso</strong> — conocer qué datos tratamos sobre usted.</li>
          <li><strong>Rectificación</strong> — corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión</strong> ("derecho al olvido") — solicitar la eliminación de sus datos.</li>
          <li><strong>Limitación</strong> — solicitar que suspendamos el tratamiento.</li>
          <li><strong>Portabilidad</strong> — recibir sus datos en formato estructurado.</li>
          <li><strong>Oposición</strong> — oponerse al tratamiento basado en interés legítimo.</li>
          <li><strong>Revocación del consentimiento</strong> — sin que afecte a la licitud del tratamiento previo.</li>
        </ul>
        <p>
          Puede ejercer estos derechos enviando un correo a{" "}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> indicando el derecho que desea ejercer y adjuntando una copia de su DNI o documento equivalente.
        </p>
        <p>
          Si considera que el tratamiento no es conforme al RGPD, puede presentar una reclamación ante la{" "}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            Agencia Española de Protección de Datos (AEPD)
          </a>.
        </p>
      </section>

      {/* 7. Seguridad */}
      <section aria-labelledby="s7">
        <h2 id="s7">7. Medidas de Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas apropiadas para proteger sus datos personales frente al acceso no autorizado, pérdida, destrucción o alteración. Esto incluye:
        </p>
        <ul>
          <li>Cifrado HTTPS en todas las comunicaciones (TLS 1.2 / 1.3).</li>
          <li>Control de acceso mediante Row Level Security (RLS) en la base de datos.</li>
          <li>Copias de seguridad automáticas diarias.</li>
          <li>Acceso restringido a los datos únicamente al personal autorizado.</li>
        </ul>
      </section>

      {/* 8. Cookies */}
      <section aria-labelledby="s8">
        <h2 id="s8">8. Cookies</h2>
        <p>
          Este sitio web utiliza cookies técnicas necesarias para su funcionamiento. Para más información consulte nuestra{" "}
          <Link to="/cookies">Política de Cookies</Link>.
        </p>
      </section>

      {/* 9. Modificaciones */}
      <section aria-labelledby="s9">
        <h2 id="s9">9. Modificaciones de esta Política</h2>
        <p>
          Nos reservamos el derecho a actualizar esta política para adaptarla a cambios legislativos o de los servicios ofrecidos. Le recomendamos revisarla periódicamente. La fecha de última actualización figura en el encabezado de este documento.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Privacidad;
