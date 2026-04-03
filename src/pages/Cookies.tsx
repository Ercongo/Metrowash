import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/LegalLayout";
import { BUSINESS } from "@/config/business";

const Cookies = () => {
  useEffect(() => {
    document.title = "Política de Cookies — MetroWash";
  }, []);

  return (
    <LegalLayout
      title="Política de Cookies"
      breadcrumb="Cookies"
      description="Información sobre el uso de cookies en este sitio web conforme a la LSSI-CE y el RGPD."
      lastUpdated="3 de abril de 2026"
    >
      {/* 1. ¿Qué son las cookies? */}
      <section aria-labelledby="c1">
        <h2 id="c1">1. ¿Qué son las Cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web depositan en el dispositivo del usuario (ordenador, tablet, smartphone) cuando los visita. Permiten que el sitio recuerde información sobre su visita para facilitar la navegación y mejorar la experiencia de usuario.
        </p>
        <p>
          De conformidad con el artículo 22.2 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), y con el RGPD, le informamos sobre las cookies que utiliza este sitio web.
        </p>
      </section>

      {/* 2. Tipos de cookies */}
      <section aria-labelledby="c2">
        <h2 id="c2">2. Tipos de Cookies que Utilizamos</h2>

        <h3>2.1 Cookies Técnicas o Estrictamente Necesarias</h3>
        <p>
          Son imprescindibles para el funcionamiento de la web. Sin ellas, el sitio no puede funcionar correctamente. <strong>No requieren consentimiento del usuario</strong> conforme al art. 22.2 LSSI-CE.
        </p>
        <table aria-label="Cookies técnicas">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Proveedor</th>
              <th scope="col">Finalidad</th>
              <th scope="col">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sb-oxdnevkkwvthyszfwcdk-auth-token</code></td>
              <td>Supabase</td>
              <td>Mantiene la sesión de autenticación con la base de datos</td>
              <td>Sesión / 1 año</td>
            </tr>
            <tr>
              <td><code>localStorage (metrowash-*)</code></td>
              <td>MetroWash</td>
              <td>Almacenamiento local del estado de la aplicación (no cookie estricta)</td>
              <td>Persistente</td>
            </tr>
          </tbody>
        </table>

        <h3>2.2 Cookies de Preferencias</h3>
        <p>
          Permiten recordar opciones seleccionadas por el usuario (como el idioma o la región). Este sitio web <strong>no utiliza</strong> actualmente cookies de preferencias.
        </p>

        <h3>2.3 Cookies Analíticas o de Medición</h3>
        <p>
          Permiten cuantificar el número de visitantes y analizar estadísticamente el uso del sitio. Este sitio web <strong>no utiliza</strong> actualmente cookies analíticas de terceros.
        </p>

        <h3>2.4 Cookies de Publicidad o Marketing</h3>
        <p>
          Este sitio web <strong>no utiliza</strong> cookies de publicidad, seguimiento o retargeting de ningún tipo.
        </p>
      </section>

      {/* 3. Cookies de terceros */}
      <section aria-labelledby="c3">
        <h2 id="c3">3. Cookies de Terceros</h2>
        <table aria-label="Cookies de terceros">
          <thead>
            <tr>
              <th scope="col">Proveedor</th>
              <th scope="col">Finalidad</th>
              <th scope="col">Política de privacidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google Fonts</td>
              <td>Carga de fuentes tipográficas (Outfit, DM Sans)</td>
              <td>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  policies.google.com/privacy
                </a>
              </td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>Base de datos y autenticación</td>
              <td>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  supabase.com/privacy
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 4. Cómo gestionar */}
      <section aria-labelledby="c4">
        <h2 id="c4">4. Cómo Gestionar y Desactivar las Cookies</h2>
        <p>
          Puede configurar su navegador para bloquear o eliminar cookies. A continuación encontrará los enlaces a las instrucciones de los navegadores más comunes:
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
              Apple Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p>
          Tenga en cuenta que deshabilitar las cookies técnicas puede impedir el correcto funcionamiento del sitio web y de su sistema de reservas.
        </p>
      </section>

      {/* 5. Base jurídica */}
      <section aria-labelledby="c5">
        <h2 id="c5">5. Base Jurídica</h2>
        <p>
          El uso de cookies técnicas se basa en el <strong>interés legítimo</strong> del responsable (art. 6.1.f RGPD) y está exento del requisito de consentimiento conforme al art. 22.2 LSSI-CE, ya que son estrictamente necesarias para la prestación del servicio solicitado.
        </p>
        <p>
          En caso de que en el futuro se implanten cookies analíticas o de publicidad, se solicitará previamente el consentimiento del usuario mediante un banner de cookies conforme a las directrices de la AEPD.
        </p>
      </section>

      {/* 6. Contacto */}
      <section aria-labelledby="c6">
        <h2 id="c6">6. Contacto</h2>
        <p>
          Para cualquier consulta sobre el uso de cookies en este sitio web puede contactar con nosotros en{" "}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
        </p>
        <p>
          Consulte también nuestra <Link to="/privacidad">Política de Privacidad</Link> y nuestros <Link to="/terminos">Términos y Condiciones</Link>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Cookies;
