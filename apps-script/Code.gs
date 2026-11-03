/**
 * RSVP tallarinata: recibe el POST del formulario de cumple.frani.be
 * y agrega una fila a la hoja "Respuestas" de este spreadsheet.
 *
 * Setup (2 min):
 *   1) sheets.new → crea una hoja nueva en tu Drive (ej: "rsvp-cumple")
 *   2) Extensiones → Apps Script → pega este archivo como Code.gs
 *   3) Implementar → Nueva implementación → tipo "Aplicación web"
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 *   4) Copia la URL .../exec y pégala en src/pages/index.astro
 *      en la constante RSVP_ENDPOINT.
 *
 * La primera respuesta crea la pestaña "Respuestas" con encabezados.
 * La columna "empresa" es el honeypot antispam: si viene con datos,
 * se responde ok pero NO se escribe la fila.
 */

const SHEET_NAME = 'Respuestas';

function doPost(e) {
  const p = (e && e.parameter) || {};
  const out = ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);

  if (p.empresa) return out; // honeypot: bot detectado, se descarta en silencio

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Fecha', 'Nombre', 'Email', 'WhatsApp', 'Vienes', 'Acompañantes', 'Restricciones']);
  }
  sheet.appendRow([
    new Date(),
    p.nombre || '',
    p.email || '',
    p.whatsapp || '',
    p.vienes || '',
    p.amigos || '',
    p.restricciones || '',
  ]);
  return out;
}
