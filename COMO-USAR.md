# 🚀 Cómo usar este proyecto

## ⚠️ IMPORTANTE: Este proyecto NO requiere servidor

Este proyecto está diseñado para funcionar **simplemente abriendo el archivo HTML directamente en tu navegador**. No necesitas localhost ni ningún servidor.

## ✅ Método recomendado (SIN servidor)

### Opción 1: Doble clic en el archivo
1. Navega a la carpeta del proyecto
2. Haz **doble clic** en `index.html`
3. Se abrirá automáticamente en tu navegador predeterminado

### Opción 2: Arrastrar y soltar
1. Abre tu navegador (Chrome, Firefox, Safari, Edge)
2. **Arrastra** el archivo `index.html` a la ventana del navegador
3. La página se cargará automáticamente

### Opción 3: Abrir desde el navegador
1. Abre tu navegador
2. Presiona `Cmd+O` (Mac) o `Ctrl+O` (Windows/Linux)
3. Selecciona `index.html`
4. Haz clic en "Abrir"

## 🔧 Si necesitas usar localhost (opcional)

Si por alguna razón necesitas usar un servidor local, aquí tienes opciones simples:

### ⭐ Opción 1: Script automático (RECOMENDADO)
```bash
# Iniciar servidor
./iniciar-servidor.sh

# Detener servidor (en otra terminal)
./detener-servidor.sh
```

Luego abre: `http://localhost:8000/index.html`

### Opción 2: Python manual
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego abre: `http://localhost:8000/index.html`

### Opción 3: Script Python mejorado
```bash
python3 servidor-local.py
```

Luego abre: `http://localhost:8000/index.html`

### Opción 4: Node.js (si lo tienes instalado)
```bash
npx http-server -p 8000
```

Luego abre: `http://localhost:8000/index.html`

## 🐛 Solución de problemas

### El navegador se queda bloqueado
1. **Abre la consola del navegador** (F12 o Cmd+Option+I)
2. **Revisa los errores** en la pestaña "Console"
3. **Verifica que todos los archivos existan**:
   - `ubits-colors.css`
   - `ubits-typography.css`
   - `fontawesome-icons.css`
   - `components/` (todos los archivos)
   - `script.js`
   - `dashboard-plantillas.js`

### La página está en blanco
1. Verifica que estés abriendo `index.html` (no otro archivo)
2. Revisa la consola del navegador para errores
3. Asegúrate de que todos los archivos CSS y JS estén en la misma carpeta

### Los estilos no se cargan
1. Verifica que los archivos CSS existan en la ruta correcta
2. Revisa la pestaña "Network" en las herramientas de desarrollador
3. Busca archivos con estado 404 (no encontrados)

## 📝 Notas importantes

- **NO necesitas instalar nada** - El proyecto funciona directamente
- **NO necesitas npm, yarn, o package managers**
- **NO necesitas compilar nada** - Es HTML puro
- **Los archivos deben estar en la misma carpeta** - Mantén la estructura de carpetas intacta

## 🎯 Archivos principales

- `index.html` - Página principal del dashboard
- `editor-plantillas.html` - Editor de plantillas
- `configurar-vacante.html` - Configuración de vacantes
- `componentes.html` - Documentación de componentes

## 💡 Consejo

**La forma más fácil es simplemente hacer doble clic en `index.html`**. No necesitas complicarte con servidores locales a menos que tengas una razón específica para hacerlo.

