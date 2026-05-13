# CONTEXT.md - Contexto del Proyecto

Este documento describe el proyecto tal como existe despues de implementar la arquitectura con selector de IA, selector de modelo y doble salida documental.

## Nombre del Proyecto

DocGenerator

## Descripcion

DocGenerator es una aplicacion web React de una sola pagina que genera documentacion Markdown para repositorios de GitHub. El usuario selecciona una IA/proveedor, selecciona un modelo, selecciona un idioma, ingresa un token y escribe una URL de repositorio. La app consulta GitHub REST API para leer el repositorio y usa GitHub Models para generar dos documentos: `README.md` y `ARQUITECTURA.md`. El idioma por defecto es ingles.

La aplicacion no tiene backend propio. Todas las llamadas externas se hacen desde el navegador hacia APIs de GitHub permitidas por las reglas de seguridad.

## Publico Objetivo

Desarrolladores que quieren generar documentacion inicial de un repositorio y luego editarla o usarla como base para cambios guiados por IA.

## Stack Tecnologico

- **Lenguaje:** JavaScript moderno con modulos ES.
- **Framework:** React 19.
- **Build tool:** Vite 8.
- **Estilos:** Tailwind CSS 4 mediante `@tailwindcss/vite`, mas reglas manuales para Markdown en `src/index.css`.
- **Render Markdown:** `react-markdown` 10 y `remark-gfm` 4.
- **Linting:** ESLint 10 con reglas para React Hooks y React Refresh.
- **Backend:** No aplica. La app es solo frontend.
- **Base de datos:** No aplica. No hay persistencia local ni remota.

## Estructura del Proyecto

```text
DocGenerator/
|-- IA Documentation/
|   |-- ARQUITECTURA.md
|   |-- CONTEXT.md
|   `-- REGLAS.md
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- AiSelector.jsx
|   |   |-- ArchitectureViewer.jsx
|   |   |-- DocViewer.jsx
|   |   |-- DownloadButton.jsx
|   |   |-- LanguageSelector.jsx
|   |   |-- ModelSelector.jsx
|   |   |-- ProgressBar.jsx
|   |   |-- RepoInput.jsx
|   |   `-- TokenInput.jsx
|   |-- services/
|   |   |-- ai.js
|   |   |-- aiProviders.js
|   |   |-- github.js
|   |   `-- languages.js
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- package.json
|-- README.md
`-- vite.config.js
```

## Funcionalidades Principales

1. Seleccionar una IA desde `AiSelector`.
2. Seleccionar un modelo dependiente de la IA desde `ModelSelector`.
3. Seleccionar el idioma de salida desde `LanguageSelector`, con valor por defecto en ingles.
4. Capturar un token con campo enmascarado y opcion para mostrar/ocultar.
5. Aceptar una URL completa de GitHub o formato corto `owner/repo`.
6. Consultar metadatos del repositorio desde GitHub REST API.
7. Obtener el arbol de archivos y filtrar ruido comun como `node_modules`, `dist`, `build` y lockfiles.
8. Descargar contenido textual de archivos en lotes, ignorando binarios o archivos muy grandes.
9. Construir un prompt con metadatos, arbol de archivos, contenido truncado e idioma seleccionado.
10. Generar en streaming dos documentos Markdown: README y arquitectura.
11. Renderizar README con `DocViewer` y arquitectura con `ArchitectureViewer`.
12. Descargar cada documento como archivo `.md`.

## APIs Externas

- `https://api.github.com`
  - Lee metadatos, arbol de archivos y blobs del repositorio.
  - Implementacion: `src/services/github.js`.

- `https://models.github.ai/inference/chat/completions`
  - Genera README y arquitectura por streaming cuando el modelo lo soporta, o como respuesta completa cuando no.
  - Implementacion: `src/services/ai.js`.

## Proveedores y Modelos

El catalogo de IA vive en `src/services/aiProviders.js`. Actualmente la UI expone modelos populares del catalogo de GitHub Models:

- GitHub Copilot: flujo recomendado por defecto, usando modelos compatibles disponibles en GitHub Models.
- OpenAI: GPT-4.1, GPT-4o, GPT-5 y modelos o-series.
- Microsoft: Phi y MAI-DS-R1.
- DeepSeek: R1 y V3.
- Meta: Llama.
- Mistral AI: Codestral, Mistral Medium, Mistral Small y Ministral.
- xAI: Grok 3 y Grok 3 Mini.
- Cohere: Command.
- AI21 Labs: Jamba.

Por seguridad, todos los proveedores se enrutan por GitHub Models. Si un modelo no esta habilitado para el token del usuario, la API devolvera un error visible en la UI. Algunos modelos no soportan streaming; para esos casos la app espera la respuesta completa y luego renderiza los documentos.

## Token

El token:

- Vive en estado React dentro de `App.jsx`.
- Se pasa como argumento a `github.js` y `ai.js`.
- No se guarda en `localStorage`, `sessionStorage`, cookies ni archivos.
- No se envia a servidores propios.
- Solo se envia a `api.github.com` y `models.github.ai`.

Permisos esperados:

- `models:read` para GitHub Models.
- `repo` o permisos de contenido equivalentes solo si se desea soportar repositorios privados.

## Variables de Entorno

Actualmente no hay variables de entorno requeridas. No agregar secretos al bundle frontend. Si en el futuro se necesita configuracion sensible, debe introducirse un backend o proxy seguro y actualizar estos documentos.

## Estado Actual y Limitaciones

- No hay tests automatizados configurados.
- No hay backend, autenticacion propia ni persistencia.
- El limite de archivos se controla en `fetchFileTree` con `maxFiles = 200`.
- Cada archivo se limita a 500 KB al descargar y a 8000 caracteres dentro del prompt.
- Errores al leer archivos individuales se ignoran para no detener toda la generacion.
- La disponibilidad real de modelos depende de GitHub Models, del token del usuario y de la configuracion de su organizacion.

## Como Usar Esta Documentacion para Cambios Futuros

Para pedir cambios con IA, referencia:

- `IA Documentation/CONTEXT.md` para entender el producto.
- `IA Documentation/ARQUITECTURA.md` para respetar el flujo y responsabilidades.
- `IA Documentation/REGLAS.md` para cumplir seguridad y mantenimiento.
