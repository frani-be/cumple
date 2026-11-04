# Contexto del proyecto

Landing de invitación al cumpleaños de Frani (`cumple.frani.be`): **tallarinata + bingo** cumpleañera con formulario RSVP. Ya no hay causa, donaciones ni links de Mercado Pago (se eliminaron a pedido de Frani): no volver a agregarlos.

## Stack

- Astro 6 con output estático (SSG), una sola página.
- Tailwind CSS v4 via `@tailwindcss/vite` (los tokens viven en `@theme` dentro de `src/styles/global.css`, no hay `tailwind.config`). El `global.css` es copia del de frani.be: no editar tokens sin necesidad.
- Sin framework JS de UI: interactividad con `<script>` inline + TypeScript.
- Solo español (es-CL). No hay i18n ni `/en/`.
- Tema claro/oscuro: `.dark` en `<html>` flipa los tokens; toggle en nav + `localStorage` + `prefers-color-scheme`.

## Estructura

- `src/pages/index.astro`: toda la página (hero, detalles de la fiesta, cierre con RSVP `#confirmar`).
- `src/layouts/BaseLayout.astro`: head/meta/OG, nav mínimo (logo + CTA Confirmar + toggle tema), footer con gradiente.
- `src/components/`: componentes reutilizados de frani.be (`EmbroideryPattern`, `ArrowIcon`, etc.).
- `public/images/icons.svg`: sprite con `#logo` y rrss. Las ilustraciones nuevas (`tallarinata.svg`, etc.) son placeholders que Frani reemplaza manteniendo el nombre de archivo.
- `public/CNAME`: `cumple.frani.be` para GitHub Pages.

## Datos del evento

- Fecha: viernes 27 de noviembre de 2026.
- Hora: 20:00. Entrada liberada. La tallarinata es 100% vegana.
- RSVP campos: nombre, email (invitación Google Calendar), whatsapp (recordatorio), vienes (si/quizas), amigos (desplegable 0 a 4+), tiene_rest (si/no, si "si" muestra input restricciones).
- RSVP: formulario embebido en la sección de cierre que hace POST (`no-cors`) al Google Apps Script web app (desplegado, endpoint real en `RSVP_ENDPOINT` de `src/pages/index.astro`), que escribe en la pestaña "Respuestas" de una Sheet de Drive. El código está en `apps-script/Code.gs`.
- Pendiente de confirmar con Frani: lugar/dirección, URL real del Apps Script `/exec`.

## Entorno (importante)

- Node `>=22.12` requerido. El Node por defecto del sistema es v20. Antes de correr npm:
  `export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"`
- `~/Documents` está sincronizado con iCloud. Si `node_modules` queda evictado el build se cuelga; fix: `npm ci`.

## Verificación

- `npm run build` debe completar sin errores.
- No hay tests ni linter configurados.

## Deploy

- GitHub Pages vía `.github/workflows/deploy.yml` (push a `main` o `workflow_dispatch`, `withastro/action`, Node 22).
- Dominio `cumple.frani.be` vía `public/CNAME` y `site` en `astro.config.mjs` + registro DNS del subdominio.
- En GitHub: Settings → Pages → Source = "GitHub Actions".

## Convenciones de contenido

- UI en español chileno con tuteo estándar: "Ven", "Confirma", "Puedes".
- NO usar voseo rioplatense: evitar "Tenés", "Podés", "Vení".
- Tono cercano y festivo, sin perder claridad en los datos logísticos.
- Regla global: no usar el caracter "—" (guión largo) en copy ni comentarios; usar ",", "()" o ".".
