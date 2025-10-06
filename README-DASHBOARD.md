# 🎯 Dashboard de Plantillas UBITS

Dashboard completo de gestión de plantillas de flujos de contratación, construido con componentes oficiales de UBITS.

## 🚀 Características

### ✅ **Funcionalidades Completas**
- **Crear plantillas** nuevas desde cero
- **Editar plantillas** existentes con drag & drop
- **Clonar plantillas** para reutilizar
- **Activar/Desactivar** plantillas
- **Eliminar plantillas** con confirmación
- **Búsqueda en tiempo real** por nombre, categoría, autor
- **Ordenamiento** por fecha, nombre, número de etapas
- **Persistencia** en localStorage

### ✅ **Editor de Plantillas**
- **Drag & drop** de agentes a etapas
- **Reordenamiento** de etapas verticalmente
- **Un agente por etapa** (validación automática)
- **Edición inline** de nombres de etapas
- **Agentes predefinidos** con iconos
- **Guardado automático** de cambios

### ✅ **Componentes UBITS Oficiales**
- **Tokens de color** oficiales (`--ubits-accent-brand`, etc.)
- **Tipografía UBITS** (`ubits-h1`, `ubits-body-md-regular`)
- **Botones UBITS** (`ubits-button--primary`)
- **Inputs UBITS** para búsqueda
- **Cards UBITS** para plantillas
- **Sidebar UBITS** oficial
- **SubNav UBITS** oficial

## 📁 Estructura de Archivos

```
ubits-template/
├── index.html                 # Dashboard principal
├── editor-plantillas.html     # Editor de plantillas
├── dashboard-plantillas.js    # Lógica del dashboard
├── editor-plantillas.js       # Lógica del editor
├── ubits-colors.css          # Tokens de color UBITS
├── ubits-typography.css      # Tipografía UBITS
├── fontawesome-icons.css     # Iconos FontAwesome
├── components/               # Componentes UBITS
│   ├── button.css
│   ├── input.css
│   ├── card-content.css
│   ├── sub-nav.css
│   └── ...
└── images/                   # Recursos visuales
    └── empty-states/
        ├── sin-cards.svg
        └── sin-resultados-img.svg
```

## 🎮 Cómo Usar

### **1. Dashboard Principal (`index.html`)**
- **Ver plantillas** existentes en grid responsive
- **Buscar plantillas** usando el campo de búsqueda
- **Ordenar plantillas** por diferentes criterios
- **Crear nueva plantilla** con el botón "Crear plantilla"
- **Acciones rápidas** en cada tarjeta (activar, clonar, eliminar)

### **2. Editor de Plantillas (`editor-plantillas.html`)**
- **Arrastrar agentes** desde la sidebar hacia las etapas
- **Reordenar etapas** arrastrando verticalmente
- **Editar nombres** haciendo click en el ícono de edición
- **Agregar etapas** con el botón "Agregar etapa"
- **Guardar cambios** con el botón "Guardar"

## 🔧 Agentes Disponibles

El sistema incluye 7 agentes predefinidos:

1. **Reclutador inicial** - Primera evaluación de CVs
2. **Evaluador técnico** - Evaluación de habilidades técnicas
3. **Entrevista Serena** - Entrevista conductual
4. **Analista de salario** - Evaluación salarial
5. **Gerente de RRHH** - Decisión final
6. **Coordinador de procesos** - Gestión de flujo
7. **Especialista en compliance** - Cumplimiento normativo

## 📱 Responsive Design

- **Desktop**: Grid de 3-4 columnas, sidebar lateral
- **Tablet**: Grid de 2 columnas, sidebar arriba
- **Mobile**: Grid de 1 columna, controles apilados

## 🎨 Personalización

### **Colores**
Usa solo tokens UBITS oficiales:
```css
color: var(--ubits-fg-1-high);
background: var(--ubits-bg-1);
border-color: var(--ubits-accent-brand);
```

### **Tipografía**
Usa clases UBITS oficiales:
```html
<h1 class="ubits-heading-h1">Título</h1>
<p class="ubits-body-md-regular">Texto</p>
```

### **Botones**
Usa estructura UBITS oficial:
```html
<button class="ubits-button ubits-button--primary ubits-button--md">
    <i class="far fa-plus"></i>
    <span>Texto</span>
</button>
```

## 🚀 Despliegue

1. **Subir archivos** a tu servidor web
2. **Configurar** rutas relativas correctas
3. **Verificar** que todos los CSS/JS se cargan
4. **Probar** funcionalidad en diferentes dispositivos

## 🔄 Migración de Datos

El sistema incluye migración automática para usuarios existentes:
- **Detecta** plantillas con múltiples agentes por etapa
- **Corrige** contadores de etapas y agentes
- **Genera** `realContent` si no existe
- **Preserva** todos los datos existentes

## 🐛 Solución de Problemas

### **Si los colores no se ven:**
1. Verificar que `ubits-colors.css` se carga
2. Usar solo tokens UBITS (`var(--ubits-...)`)
3. No usar colores hardcodeados

### **Si los componentes no funcionan:**
1. Verificar que los CSS de componentes se cargan
2. Usar estructura HTML exacta de UBITS
3. Importar JavaScript de componentes

### **Si el drag & drop no funciona:**
1. Verificar que `draggable="true"` está presente
2. Revisar event listeners en JavaScript
3. Comprobar que no hay errores en consola

## 📞 Soporte

Para problemas o mejoras:
1. Revisar la documentación UBITS oficial
2. Verificar estructura de componentes
3. Comprobar tokens de color y tipografía
4. Probar en diferentes navegadores

---

**¡Dashboard de Plantillas UBITS listo para usar! 🚀**

