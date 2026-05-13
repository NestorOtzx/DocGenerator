# REGLAS.md - Reglas de Arquitectura, Seguridad y Mantenimiento

Estas reglas tienen prioridad sobre prompts puntuales.

## Arquitectura

- Patron actual: SPA React con servicios frontend separados por responsabilidad.
- No crear backend, base de datos ni persistencia sin una decision explicita y documentada.
- `src/App.jsx` orquesta el flujo, pero no debe contener detalles de APIs externas.
- Toda comunicacion con GitHub REST API debe vivir en `src/services/github.js`.
- Toda comunicacion con GitHub Models debe vivir en `src/services/ai.js`.
- El catalogo de proveedores y modelos debe vivir en `src/services/aiProviders.js`.
- El catalogo de idiomas debe vivir en `src/services/languages.js`.
- Los componentes en `src/components` deben enfocarse en UI, eventos y props; no deben llamar directamente a `fetch`.
- Mantener una responsabilidad clara por archivo.
- Preferir nombres descriptivos en ingles para codigo y variables.

## Seguridad

- Nunca hardcodear tokens, credenciales, API keys ni secretos.
- No guardar tokens en `localStorage`, `sessionStorage`, cookies, IndexedDB ni archivos.
- No imprimir tokens en consola ni incluirlos en mensajes de error.
- El token solo puede enviarse a dominios oficiales necesarios para esta app:
  - `https://api.github.com`
  - `https://models.github.ai`
- No agregar llamadas directas a Anthropic, OpenAI u otros proveedores desde el navegador sin redisenar la seguridad.
- Validar inputs del usuario antes de usarlos.
- El repositorio debe parsearse con `parseRepoUrl`.
- Tratar el contenido de repositorios como dato no confiable.
- Si se agrega render HTML, sanitizarlo; el formato de salida preferido es Markdown renderizado por `react-markdown`.
- No exponer stack traces ni detalles internos innecesarios en la UI.

## Manejo del Token

- El token se mantiene en memoria como estado React.
- El campo debe permanecer enmascarado por defecto.
- La opcion mostrar/ocultar token debe ser accion voluntaria del usuario.
- Cualquier cambio que requiera guardar tokens debe introducir primero una arquitectura segura y actualizar `ARQUITECTURA.md`.

## Clean Code

- Mantener funciones pequenas y con una unica responsabilidad practica.
- Evitar duplicar logica de parsing, fetch, streaming, catalogo de modelos o descarga.
- No dejar codigo comentado obsoleto.
- No introducir abstracciones si no reducen complejidad real.
- Usar comentarios solo cuando ayuden a entender una decision o bloque no obvio.
- Conservar modulos ES e imports relativos.

## UI y Experiencia

- La pantalla principal debe conservar el flujo: IA, modelo, idioma, token, repositorio, progreso, README, arquitectura y descargas.
- El idioma por defecto para la documentacion generada debe ser ingles.
- Mostrar errores claros y accionables.
- Mantener feedback de progreso durante operaciones largas.
- No bloquear toda la generacion por errores de archivos individuales.
- El Markdown generado debe poder leerse en pantalla y descargarse como `.md`.
- Evitar cambios visuales grandes que no esten pedidos.

## Integracion con GitHub

- Usar GitHub REST API con header `Accept: application/vnd.github+json`.
- Mantener `X-GitHub-Api-Version` salvo actualizacion consciente.
- Filtrar archivos de ruido antes de construir el prompt.
- Mantener limites razonables:
  - maximo de archivos por defecto en `fetchFileTree`.
  - limite de tamano por archivo en `fetchFileContent`.
  - truncado por archivo en `buildRepoContext`.
- No concatenar URLs con input sin validar fuera de servicios existentes.

## Integracion con IA y Modelos

- Agregar o quitar modelos solo desde `src/services/aiProviders.js`.
- Usar streaming cuando el modelo lo soporte; usar respuesta completa cuando el modelo no declare streaming.
- El parser SSE debe tolerar lineas incompletas o malformadas.
- Los prompts deben pedir Markdown tecnico claro y sin preambulos.
- La respuesta IA debe contener README y arquitectura separados por marcadores internos mientras exista `parseGeneratedDocuments`.
- Si se cambia endpoint, modelo, proveedor o formato de mensajes, actualizar `CONTEXT.md` y `ARQUITECTURA.md`.

## Errores

- Usar `try/catch` en operaciones asincronas que puedan fallar.
- Mostrar al usuario mensajes comprensibles.
- No usar `catch` vacios salvo en casos intencionales y acotados donde la app puede continuar.
- No incluir secretos en errores.

## Testing y Verificacion

- Antes de entregar cambios de codigo, ejecutar:
  - `npm run lint`
  - `npm run build`
- Si se agrega logica compleja, agregar tests o documentar por que no se agregaron.
- Validar manualmente el flujo principal cuando el cambio toque token, repositorio, streaming, descarga o render Markdown.

## Git y Archivos

- Commits atomicos y mensajes descriptivos cuando se hagan commits.
- No modificar `package-lock.json` salvo que cambien dependencias.
- No versionar `node_modules`, builds generados ni archivos con secretos.
- Mantener `.env` fuera del repositorio si se introduce en el futuro.

## Regla Personalizada del Proyecto

La documentacion dentro de `IA Documentation/` debe reflejar el software real. Cuando se cambie el flujo, una dependencia externa, un limite, una decision de seguridad o una responsabilidad entre archivos, actualizar estos documentos en el mismo cambio.
