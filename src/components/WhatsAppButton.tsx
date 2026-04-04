import { useState, useEffect } from "react";
import { BUSINESS } from "@/config/business";
import { MessageCircle, X } from "lucide-react";

const WhatsAppButton = () => {
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Aparece después de 3 segundos
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Muestra el tooltip automáticamente a los 5 segundos si no se cerró
  useEffect(() => {
    if (!visible || dismissed) return;
    const t = setTimeout(() => setTooltip(true), 5000);
    return () => clearTimeout(t);
  }, [visible, dismissed]);

  // Oculta el tooltip automáticamente después de 6 segundos
  useEffect(() => {
    if (!tooltip) return;
    const t = setTimeout(() => setTooltip(false), 6000);
    return () => clearTimeout(t);
  }, [tooltip]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      role="region"
      aria-label="Botón de contacto por WhatsApp"
    >
      {/* Tooltip / burbuja de mensaje */}
      {tooltip && !dismissed && (
        <div className="flex items-start gap-2 bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[220px] border border-green-100 animate-in slide-in-from-right-2 duration-300">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              ¿Tienes alguna duda?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Escríbenos por WhatsApp
            </p>
          </div>
          <button
            onClick={() => { setTooltip(false); setDismissed(true); }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            aria-label="Cerrar mensaje"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Botón principal */}
      <a
        href={BUSINESS.whatsappInfoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp con MetroWash"
        onClick={() => setTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#25D366" }}
      >
        {/* Anillo de pulso animado */}
        <span
          className="absolute inset-0 rounded-full opacity-30 animate-ping"
          style={{ backgroundColor: "#25D366" }}
          aria-hidden="true"
        />

        {/* Icono WhatsApp SVG oficial */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white"
          aria-hidden="true"
        >
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.471 2.027 7.774L0 32l8.486-2.006A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.26 13.26 0 01-6.773-1.853l-.486-.289-5.04 1.191 1.216-4.899-.316-.502A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667c7.364 0 13.333 5.969 13.333 13.333 0 7.364-5.969 13.333-13.333 13.333zm7.307-9.973c-.4-.2-2.364-1.167-2.731-1.3-.367-.133-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.687-.622-3.213-1.98-1.187-1.058-1.988-2.364-2.221-2.764-.233-.4-.025-.616.175-.816.181-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.655-.674-.9-.686l-.767-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.367-1.4 3.333s1.433 3.867 1.633 4.133c.2.267 2.821 4.308 6.833 6.042.955.413 1.7.66 2.281.844.958.305 1.831.262 2.52.159.769-.114 2.364-.967 2.697-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z" />
        </svg>
      </a>
    </div>
  );
};

export default WhatsAppButton;
