/**
 * Backend de cumple.frani.be: RSVP + lista de regalos.
 * Usa dos pestañas de este spreadsheet:
 *   - "Respuestas": una fila por confirmación del formulario.
 *   - "Regalos": catálogo de regalos y su estado de reserva.
 *
 * Setup (2 min):
 *   1) sheets.new → crea una hoja nueva en tu Drive (ej: "rsvp-cumple")
 *   2) Extensiones → Apps Script → pega este archivo como Code.gs
 *   3) Implementar → Nueva implementación → tipo "Aplicación web"
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 *   4) Copia la URL .../exec en la constante SCRIPT_ENDPOINT de index.astro
 *
 * Pestaña "Regalos": se crea sola con encabezados la primera vez:
 *   id | regalo | precio | link | reservado | token | fecha
 * Llena a mano id, regalo, precio y link (una fila por regalo, ids únicos).
 * "precio" es texto libre para mostrar (ej: "$25.000 aprox").
 *
 * API de la lista:
 *   GET  ?lista=regalos → { ok, regalos:[{id,regalo,precio,link,reservado,huella}] }
 *   POST action=reservar&id=X&token=T → marca el regalo (con lock anti doble clic)
 *   POST action=liberar&id=X&token=T  → lo libera solo si el token coincide
 *
 * La "huella" es el SHA-256 del token: la web la compara con el token que
 * guardó en localStorage para mostrar "lo regalas tú" sin exponer el token
 * ni pedir nombre. El anonimato es real: la Sheet no guarda quién reservó.
 *
 * La columna "empresa" del RSVP es el honeypot antispam: si viene con datos,
 * se responde ok pero NO se escribe la fila.
 */

const SHEET_NAME = 'Respuestas';
const GIFTS_SHEET = 'Regalos';
const GIFTS_HEADERS = ['id', 'regalo', 'precio', 'link', 'reservado', 'token', 'fecha'];

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function giftsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(GIFTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(GIFTS_SHEET);
    sheet.appendRow(GIFTS_HEADERS);
  }
  return sheet;
}

function giftRow(sheet, id) {
  const buscado = String(id || '').trim();
  const last = sheet.getLastRow();
  if (!buscado || last < 2) return 0;
  const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === buscado) return i + 2;
  }
  return 0;
}

function sha256(texto) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes
    .map(function (b) { return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'); })
    .join('');
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.lista !== 'regalos') return jsonOut({ ok: true });

  const rows = giftsSheet().getDataRange().getValues();
  const regalos = [];
  for (let i = 1; i < rows.length; i++) {
    const id = String(rows[i][0] || '').trim();
    if (!id || !String(rows[i][1]).trim()) continue; // filas sin regalo no cuentan
    const reservado = rows[i][4] === true || String(rows[i][4]).toUpperCase() === 'TRUE';
    const token = String(rows[i][5] || '');
    regalos.push({
      id: id,
      regalo: String(rows[i][1] || ''),
      precio: String(rows[i][2] || ''),
      link: String(rows[i][3] || ''),
      reservado: reservado,
      huella: reservado && token ? sha256(token) : '',
    });
  }
  return jsonOut({ ok: true, regalos: regalos });
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'reservar') return setReserva(p, true);
  if (p.action === 'liberar') return setReserva(p, false);
  return rsvpPost(p);
}

function setReserva(p, reservar) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = giftsSheet();
    const row = giftRow(sheet, p.id);
    if (!row) return jsonOut({ ok: false, error: 'no_existe' });
    const token = String(p.token || '');
    if (reservar) {
      if (!token) return jsonOut({ ok: false, error: 'falta_token' });
      const ya = sheet.getRange(row, 5).getValue();
      if (ya === true || String(ya).toUpperCase() === 'TRUE') {
        return jsonOut({ ok: false, error: 'ya_reservado' });
      }
      sheet.getRange(row, 5, 1, 3).setValues([[true, token, new Date()]]);
    } else {
      const guardado = String(sheet.getRange(row, 6).getValue() || '');
      if (!guardado || guardado !== token) {
        return jsonOut({ ok: false, error: 'token_invalido' });
      }
      sheet.getRange(row, 5, 1, 3).clearContent();
    }
    return jsonOut({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function rsvpPost(p) {
  const out = jsonOut({ ok: true });

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
