# ARQUITECTURA.md - Arquitectura de DocGenerator

Este documento describe la arquitectura implementada actualmente.

## Diagrama de Arquitectura

```text
[Usuario en navegador]
        |
        v
[React SPA - App.jsx]
        |
        |-- providerId, modelId, languageCode, token, repoUrl
        |-- loading, currentStep, error
        |-- markdown, architectureMarkdown, streaming
        |
        +--> [Componentes UI]
        |       |-- AiSelector
        |       |-- ModelSelector
        |       |-- LanguageSelector
        |       |-- TokenInput
        |       |-- RepoInput
        |       |-- ProgressBar
        |       |-- DocViewer
        |       |-- ArchitectureViewer
        |       `-- DownloadButton
        |
        +--> [services/github.js]
        |       |-- parseRepoUrl
        |       |-- fetchRepoInfo
        |       |-- fetchFileTree
        |       `-- fetchFileContent
        |               |
        |               v
        |       [GitHub REST API]
        |
        +--> [services/aiProviders.js]
        |       |-- AI_PROVIDERS
        |       |-- getProvider
        |       |-- getProviderModels
        |       |-- getDefaultModelId
        |       `-- getModel
        |
        +--> [services/languages.js]
        |       |-- DOCUMENTATION_LANGUAGES
        |       |-- getDefaultLanguageCode
        |       `-- getLanguage
        |
        +--> [services/ai.js]
                |-- generateRepositoryDocuments
                |-- parseGeneratedDocuments
                |-- buildRepoContext
                `-- readSSEStream
                        |
                        v
        [GitHub Models / Inference API]
```

## Capas del Sistema

### Capa de Presentacion

La capa de presentacion vive en `src/App.jsx` y `src/components/*`.

- `App.jsx` coordina estado global, validaciones y flujo principal.
- `AiSelector.jsx` permite seleccionar la IA/proveedor.
- `ModelSelector.jsx` muestra modelos segun la IA seleccionada.
- `LanguageSelector.jsx` permite seleccionar el idioma de salida. Ingles es el valor por defecto.
- `TokenInput.jsx` captura el token con entrada password y boton mostrar/ocultar.
- `RepoInput.jsx` captura la URL o `owner/repo` y dispara la generacion.
- `ProgressBar.jsx` muestra el paso actual.
- `DocViewer.jsx` renderiza el README generado.
- `ArchitectureViewer.jsx` renderiza la arquitectura generada.
- `DownloadButton.jsx` descarga cualquier Markdown recibido como prop.

### Capa de Orquestacion

La orquestacion principal esta en `handleGenerate` dentro de `src/App.jsx`.

Responsabilidades:

- Validar token, repositorio y modelo.
- Resolver proveedor seleccionado con `getProvider`.
- Resolver idioma seleccionado con `getLanguage` en el servicio IA.
- Limpiar errores y documentos anteriores.
- Ejecutar pasos: metadatos, arbol, contenidos, generacion IA.
- Mantener estados de progreso y streaming.
- Parsear el Markdown bruto en README y arquitectura con `parseGeneratedDocuments`.

### Capa de Servicios GitHub

Archivo: `src/services/github.js`.

Responsabilidades:

- Parsear entradas `https://github.com/owner/repo`, `owner/repo` y variantes con `.git`.
- Leer metadatos del repositorio.
- Obtener el arbol completo de la rama por defecto con Git Trees API y `recursive=1`.
- Filtrar archivos costosos o irrelevantes.
- Leer blobs por SHA y decodificar Base64.
- Ignorar archivos binarios o mayores a 500 KB.

### Capa de Catalogo IA

Archivo: `src/services/aiProviders.js`.

Responsabilidades:

- Definir proveedores visibles en UI.
- Definir modelos por proveedor.
- Marcar modelos que no soportan streaming.
- Entregar el modelo por defecto cuando cambia la IA.
- Evitar que la UI duplique listas de modelos.

### Capa de Generacion IA

Archivo: `src/services/ai.js`.

Responsabilidades:

- Construir contexto textual del repositorio.
- Preparar mensajes para generar `README.md` y `ARQUITECTURA.md`.
- Instruir al modelo para escribir en el idioma seleccionado.
- Llamar a `https://models.github.ai/inference/chat/completions` con el modelo seleccionado.
- Leer Server-Sent Events cuando el modelo soporta streaming.
- Leer JSON completo cuando el modelo no soporta streaming.
- Tolerar lineas SSE malformadas.
- Separar la respuesta en dos documentos mediante marcadores internos:
  - `<!-- DOCGEN:README -->`
  - `<!-- DOCGEN:ARCHITECTURE -->`

### Capa de Datos

No hay base de datos ni modelos persistentes.

Datos temporales en memoria:

- `providerId`: IA seleccionada.
- `modelId`: modelo seleccionado.
- `languageCode`: idioma seleccionado para la documentacion.
- `token`: token ingresado por el usuario.
- `repoUrl`: repositorio objetivo.
- `repoInfo`: metadatos obtenidos durante la ejecucion.
- `files`: arbol filtrado.
- `filesWithContent`: archivos con contenido textual.
- `markdown`: README generado.
- `architectureMarkdown`: arquitectura generada.

## Flujo Principal

1. El usuario selecciona IA, modelo, idioma, token y repositorio.
2. `RepoInput` llama `handleGenerate`.
3. `App.jsx` valida token, repositorio y modelo.
4. `parseRepoUrl` devuelve `{ owner, repo }`.
5. `fetchRepoInfo` consulta metadatos.
6. `fetchFileTree` consulta la rama por defecto y devuelve hasta 200 blobs filtrados.
7. `loadFileContents` descarga contenidos en lotes de 10 con `Promise.allSettled`.
8. `generateRepositoryDocuments` construye el prompt y llama GitHub Models.
9. Si hay streaming, `readSSEStream` procesa chunks SSE y entrega el texto acumulado; si no, se procesa la respuesta completa.
10. `parseGeneratedDocuments` separa README y arquitectura.
11. `DocViewer` y `ArchitectureViewer` renderizan en vivo.
12. Al terminar, dos `DownloadButton` permiten descargar `README.md` y `ARQUITECTURA.md`.

## Manejo de Errores

- Errores globales se capturan en `handleGenerate` y se muestran en UI.
- Errores de GitHub API y GitHub Models incluyen status HTTP.
- Errores al leer archivos individuales se ignoran para continuar.
- Lineas SSE malformadas se omiten.
- Si un modelo seleccionado no esta habilitado para el token, el error de GitHub Models se muestra al usuario.

## Seguridad

- No se hardcodean tokens.
- El token no se persiste.
- No hay backend propio que reciba secretos.
- El token solo viaja a GitHub REST API y GitHub Models API.
- Aunque la UI enumera varias IAs, no se hacen llamadas directas a proveedores externos fuera de GitHub Models.
- El contenido del repositorio se trata como dato no confiable.

## Decisiones Tecnicas

| Decision | Justificacion |
|----------|---------------|
| React SPA con Vite | App simple, rapida y desplegable como estatico. |
| Sin backend | Evita custodiar tokens en infraestructura propia. |
| `github.js` separado | Aisla lectura de repositorios. |
| `aiProviders.js` separado | Centraliza IA/modelos y evita duplicacion en UI. |
| `ai.js` separado | Aisla prompt, endpoint, idioma y parsing SSE. |
| Streaming con fallback | Soporta modelos con y sin streaming. |
| Marcadores internos | Permiten extraer README y arquitectura desde una unica respuesta. |
| Limites de archivos y truncado | Reducen prompts excesivos y fallos en repositorios grandes. |

## Reglas para Evolucion

- Mantener componentes visuales sin llamadas directas a APIs externas.
- Agregar proveedores o modelos solo en `aiProviders.js`.
- Mantener llamadas de generacion en `ai.js`.
- Si se necesita llamar APIs externas no GitHub, introducir primero una arquitectura segura documentada.
- Si se cambia el formato de salida IA, actualizar `parseGeneratedDocuments` y esta documentacion.
