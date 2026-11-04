# cumple.frani.be

Invitación al cumpleaños de Frani: **tallarinata + bingo**, con formulario de confirmación de asistencia y lista de regalos con reserva anónima.

- `/tallarinata` → la invitación (RSVP + regalos)
- `/regalos` → solo la lista de regalos (para la familia)
- `/` → redirige a `/regalos`

## Desarrollo

```sh
npm install
npm run dev
```

Build de producción:

```sh
npm run build
npm run preview
```

Sitio estático (Astro + Tailwind 4). El `public/CNAME` apunta a `cumple.frani.be` para GitHub Pages.
