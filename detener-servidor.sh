#!/bin/bash

# Script para detener el servidor local
# Uso: ./detener-servidor.sh

PORT=8000

echo "🛑 Deteniendo servidor en puerto $PORT..."

# Buscar y detener procesos en el puerto
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ No hay servidor corriendo en el puerto $PORT"
else
    echo "$PIDS" | xargs kill -9 2>/dev/null
    echo "✅ Servidor detenido"
fi

# También buscar servidores Python HTTP
PYTHON_SERVERS=$(ps aux | grep -i "python.*http.server" | grep -v grep | awk '{print $2}')
if [ ! -z "$PYTHON_SERVERS" ]; then
    echo "$PYTHON_SERVERS" | xargs kill -9 2>/dev/null
    echo "✅ Servidores Python HTTP detenidos"
fi


