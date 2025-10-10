# 🎯 Sistema de Plantillas de Selección Personalizadas - UBITS

Sistema completo de gestión de plantillas personalizadas para flujos de contratación con agentes IA integrados, construido 100% con componentes oficiales de UBITS.

---

## 📋 **Tabla de Contenidos**

1. [Características Principales](#-características-principales)
2. [Estructura de Archivos](#-estructura-de-archivos)
3. [Agentes IA Disponibles](#-agentes-ia-disponibles)
4. [Categorías de Etapas](#-categorías-de-etapas)
5. [Categorías de Plantillas](#-categorías-de-plantillas)
6. [Cómo Usar](#-cómo-usar)
7. [Componentes UBITS Utilizados](#-componentes-ubits-utilizados)
8. [Responsive Design](#-responsive-design)
9. [Sistema de Versiones](#-sistema-de-versiones)
10. [Persistencia de Datos](#-persistencia-de-datos)

---

## 🚀 **Características Principales**

### ✅ **Dashboard de Plantillas (`index.html`)**

#### **Gestión de Plantillas:**
- **Crear plantillas** con modal UBITS (nombre y categoría obligatorios)
- **Editar plantillas** navegando al editor visual completo
- **Clonar plantillas** con modal de confirmación previo y toast "Plantilla clonada exitosamente"
- **Eliminar plantillas** con modal de confirmación y toast "Plantilla eliminada exitosamente"
- **Activar/Desactivar** plantillas (estado activa = en uso en vacante)
- **Duplicados inteligentes**: Al clonar, se crea con prefijo "Copia de..." (no incrementa versión)

#### **Visualización:**
- **Grid responsive** optimizado para mostrar 3 plantillas por fila
- **Template cards** con border-radius de **8px** y información completa:
  - Badge de estado (Activa/Borrador)
  - Nombre de la plantilla (font-size 16px, font-weight 600)
  - Avatar y nombre del autor
  - Fecha de última modificación (relativa: "hace X días")
  - **Categoría de plantilla** claramente etiquetada
  - Estadísticas: Etapas, Agentes, Versión
  - Borde izquierdo verde (4px) si está activa
- **Empty state horizontal** con:
  - Imagen SVG (200px width) a la izquierda
  - Título `ubits-heading-h1` color `fg-2-high`
  - Descripción `ubits-body-md-regular` color `fg-2-medium`
  - Botón secundario "Crear mi primera plantilla"
- **No results state** cuando la búsqueda no encuentra coincidencias

#### **Controles:**
- **Búsqueda en tiempo real** (nombre, categoría, autor, descripción)
- **Botón limpiar búsqueda** con icono X (aparece al escribir)
- **Ordenamiento** con dropdown personalizado:
  - Más reciente primero
  - Más antiguo primero
  - Alfabético A - Z
  - Alfabético Z - A
- **Contador dinámico** "X resultados" con color `fg-1-medium`
- **Controles ocultos** automáticamente cuando el dashboard está vacío

#### **Acciones rápidas por tarjeta:**
- **Activar/Convertir a borrador** (icono play/edit, oculto por defecto, visible al hover)
- **Clonar** (icono copy con modal de confirmación y toast de éxito)
- **Eliminar** (icono trash con modal de confirmación y toast de éxito)

---

### ✅ **Editor de Plantillas (`editor-plantillas.html`)**

#### **Header del Editor:**
**Desktop:**
- Botón volver + Título editable + Badge estado (agrupados a la izquierda)
- Botón Guardar (a la derecha)

**Mobile (<768px):**
- Fila 1: Botón volver (40x40px fijo) + Título editable (flexible)
- Fila 2: Badge estado + Botón Guardar (auto-width)

#### **Info Bar:**
- **Avatar y nombre** del autor (24px circular)
- **Label clarificado:** "Categoría de plantilla:" + **Selector** con 10 categorías
- **Fecha de modificación** relativa (formato inteligente)
- **Número de versión** (ej: "Versión 3")
- **Dropdown de categorías** con posicionamiento fixed y estilos UBITS

#### **Sistema de Tabs (Columna Izquierda):**

**Tab Etapas:**
- **Descripción:** "Crea y gestiona las etapas del proceso de selección"
- **Botón "Crear etapa"** que abre modal UBITS con:
  - Campo nombre (text input, max 50 chars)
  - Campo **categoría de etapa** (select con 6 categorías) - claramente diferenciada de categoría de plantilla
- **Buscador inteligente:**
  - Solo visible cuando hay más de 6 etapas creadas
  - Icono search a la izquierda
  - Botón X para limpiar (aparece al escribir)
  - Filtrado en tiempo real por nombre y categoría
- **Lista de etapas disponibles:**
  - Cards con drag & drop
  - Sin icono izquierdo
  - Título y **"Categoría de etapa: [nombre]"** (etiqueta clarificada)
  - Menú ellipsis con dropdown:
    - Añadir a la plantilla
    - Editar (modal con datos pre-llenados)
    - Eliminar (validación de uso en plantillas activas)
  - Sin divider inferior
  - Filtro automático (no muestra etapas ya en uso en esta plantilla)
- **Etapas como entidades globales:**
  - Identificadas por ID único
  - Cambios en el nombre se reflejan en todas las plantillas que las usan
  - No se pueden eliminar si están en uso en plantillas activas

**Tab Agentes:**
- **Descripción:** "Arrastra y suelta los agentes IA para automatizar etapas del flujo"
- **4 agentes IA disponibles:**
  - Analizador CV
  - Entrevista Serena
  - Analista psicométrico
  - Antecedentes judiciales
- **Agent cards** con:
  - Icono + Título + **Menú ellipsis con "Ver más información"** (abre modal descriptivo)
  - Descripción breve del agente
  - Drag & drop habilitado
  - **Desaparece de la lista** al asignarse a una etapa
  - **Reaparece** al quitarse de la etapa

#### **Board Principal:**

**Alert Informativa (UBITS Alert):**
- Tipo: info (azul)
- Icono: circle-info
- Texto: "Solo un agente por etapa. Puedes dejarla vacía o arrastrar uno desde la columna izquierda."
- Sin botón de cerrar

**Área de Etapas:**
- **Drag & drop** para reordenar etapas
- **Números de orden** dinámicos (1, 2, 3...) que se actualizan al mover
- **Cards de etapa** con:
  - Icono grip-vertical para arrastrar
  - Número circular (bg-1, fg-1-high, border-1, 4px radius)
  - Nombre y **"Categoría de etapa: [nombre]"** (etiqueta clarificada)
  - Menú ellipsis con dropdown:
    - Editar (modal con nombre y categoría pre-llenados)
    - **Subir** (solo si no es la primera etapa)
    - **Bajar** (solo si no es la última etapa)
    - Eliminar etapa (con confirmación)
  - Padding uniforme de 12px en stage-header
- **Etapas pueden estar vacías** (sin agentes asignados)
- **Máximo 1 agente por etapa** (validación con toast de error)

**Agent Cards en Etapas:**
- **Header horizontal** con:
  - Icono + Nombre del agente (sin alias)
  - Botón acordeón (chevron-up/down) → Mostrar/ocultar config (si tiene)
  - Menú ellipsis con dropdown:
    - **Ver más información** → Modal descriptivo completo
    - **Subir** (solo si no es la primera posición dentro de las etapas)
    - **Bajar** (solo si no es la última posición dentro de las etapas)
    - Eliminar agente (con confirmación)
- **Configuración por agente:**
  - **Analizador CV:**
    - Porcentaje sobre el rango salarial (%, default 0)
    - Puntaje mínimo de evaluación (pts, default 0)
  - **Entrevista Serena:**
    - Días para que expire la entrevista (días, default 0)
    - Puntaje mínimo de la entrevista (pts, default 0)
  - **Analista psicométrico:**
    - Puntaje CI mínimo (pts, default 0)
    - Tipo de prueba (select: CI/CA, 16PF, DISC, MBTI, Cleaver)
    - Idioma de la prueba (select: Español, Inglés, Portugués)
  - **Antecedentes judiciales:**
    - Sin configuración
- **Labels alineados** a la izquierda (180px width, font-weight 400)
- **Inputs horizontales** (100px width) con suffix text
- **Selects personalizados** (min-width 120px)
- **Estado de acordeón persistente** al re-renderizar

**Empty State de Etapa:**
- Texto: "Puedes dejar la etapa vacía o agregar un agente:"
- **Selector UBITS** con lista de agentes disponibles
- Al seleccionar agente, se agrega automáticamente
- Selector con posicionamiento inteligente (arriba si no hay espacio)

**Empty State del Board (sin etapas):**
- Icono circular azul con sitemap
- Título: "Construye tu proceso de selección"
- Descripción: "Añade etapas para organizar el proceso de selección y asigna agentes IA que te ayuden a evaluar candidatos."

#### **Validaciones y Protecciones:**

1. **Un agente por etapa:**
   - Toast de error si intenta agregar segundo agente
   - Mensaje: "Solo se permite un agente por etapa."
   - Duración: 5000ms

2. **Agente único en plantilla:**
   - Al asignarse a una etapa, desaparece de sidebar
   - Al quitarse de etapa, reaparece en sidebar
   - No puede estar en dos etapas simultáneamente

3. **Plantillas activas (Sistema de Control de Versiones):**
   - No se pueden editar directamente si están en uso en una vacante
   - Al intentar editar, aparece modal informativo con opción de crear nueva versión
   - Título: "Esta plantilla está en uso"
   - Mensaje: "No puedes editar esta plantilla porque está siendo utilizada en una vacante activa. ¿Quieres crear una nueva versión?"
   - Al aceptar:
     - Se crea copia exacta con nombre "Copia de [nombre original]"
     - Versión incrementada automáticamente (ej: v2 → v3)
     - Nueva versión en estado "Borrador" (editable)
     - Redirección automática al editor de la nueva versión
   - La plantilla original permanece intacta y activa

4. **Etapas en uso:**
   - Etapas usadas en plantillas activas no se pueden eliminar del catálogo
   - Modal informativo: "Esta etapa no se puede borrar porque se está usando en una vacante activa."
   - Solo botón "Entendido"
   - Garantiza la integridad de los flujos en producción

5. **Cambios sin guardar:**
   - Modal de confirmación al intentar salir sin guardar
   - Título: "Cambios sin guardar"
   - Mensaje: "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
   - Opciones: "Salir sin guardar" / "Cancelar"
   - Protección con stopImmediatePropagation y setTimeout

6. **Validación de duplicados:**
   - No permite etapas con mismo nombre
   - Verifica al crear y editar
   - Validación case-insensitive

7. **Dropdown inteligente:**
   - Detecta espacio disponible abajo
   - Si no hay espacio, se posiciona arriba del input
   - Ajuste dinámico de maxHeight y posición

---

### ✅ **Configuración de Vacante (`configurar-vacante.html`)** *(Nueva Funcionalidad)*

#### **Stepper de Progreso:**
- **Desktop:**
  - Stepper horizontal de 5 pasos con líneas conectoras
  - Pasos completados: check verde
  - Paso activo: número con fondo azul primario
  - Pasos pendientes: número gris con borde
  - Etiquetas descriptivas bajo cada paso
  
- **Mobile (<768px):**
  - Círculo de progreso con porcentaje visual (60% para paso 3/5)
  - Número "3/5" centrado
  - Título del paso actual: "Configurar vacante"
  - Botón "Siguiente" (primary, small)

#### **Configuración Principal:**
**Selector de Plantilla:**
- Widget con icono layer-group
- Título: "Seleccionar plantilla"
- Input select UBITS con opciones disponibles
- Permite elegir el flujo base para la vacante

**Notificaciones Automáticas:**
- Widget con icono envelope
- Título: "Activar notificaciones automáticas de rechazo"
- Switch toggle UBITS (activado por defecto)
- Input numérico para configurar días de espera
- Label: "Enviar correo de rechazo a los: (días)"

#### **Layout Responsive:**
- Desktop: 2 columnas (Selector | Notificaciones)
- Mobile: Apilado verticalmente
- Sistema modular con `section-dual`
- Paddings: 20px desktop, 16px mobile

#### **Navegación:**
- Accesible desde Sidebar (botón Vacantes)
- Accesible desde Floating Menu (opción Vacantes)
- Tab-bar mobile activa correctamente la sección