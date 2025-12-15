#!/bin/bash

# Script para iniciar servidor local limpio
# Uso: ./iniciar-servidor.sh

PORT=8000

echo "🛑 Deteniendo servidores anteriores..."
# Detener cualquier proceso en el puerto 8000
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

echo "🚀 Iniciando servidor en puerto $PORT..."
echo "📁 Directorio: $(pwd)"
echo "🌐 URL: http://localhost:$PORT/index.html"
echo ""
echo "⏹️  Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor Python
cd "$(dirname "$0")"
python3 -m http.server $PORT


