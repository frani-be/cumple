# Git workflow

## Commits atómicos

- Un commit = un cambio lógico. Si el diff toca cosas no relacionadas (fix + feature, estilos + contenido), separar en varios commits.
- No mezclar refactor con cambio de comportamiento en el mismo commit.
- Cada commit debe dejar el proyecto en estado compilable (`npm run build` pasa).
- Mensajes en español, imperativo, resumen corto en la primera línea (máx ~72 caracteres).
- Verificar `git status` antes de commitear: no incluir archivos sueltos que no correspondan al cambio (node_modules, dist, .DS_Store ya están en .gitignore).

## Branches

- `main` es la rama protegida: despliega a GitHub Pages automáticamente (`.github/workflows/deploy.yml`). Nunca commitear directo a `main`; trabajar siempre en branch + PR.
- Crear branches desde `main` actualizado:
  `git checkout main && git pull && git checkout -b <tipo>/<nombre>`
- Prefijos de branch:
  - `feat/` funcionalidad o secciones nuevas
  - `content/` solo contenido: textos, datos del evento
  - `fix/` correcciones
  - `style/` cambios visuales sin cambio funcional
  - `chore/` tooling, deps, config
- Nombres en kebab-case, cortos y descriptivos.
- Al terminar la tarea: commit(s) atómicos en la branch, push y abrir PR a `main`. No mergear ni pushear a `main` sin que el usuario lo pida.
- Borrar la branch local/remota una vez mergeado el PR.
