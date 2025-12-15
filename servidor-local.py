#!/usr/bin/env python3
"""
Servidor HTTP simple para desarrollo local
Uso: python3 servidor-local.py
Luego abre: http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers CORS para desarrollo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Log simplificado
        print(f"[{self.address_string()}] {format % args}")

if __name__ == "__main__":
    # Cambiar al directorio del script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor iniciado en http://localhost:{PORT}")
        print(f"📁 Directorio: {os.getcwd()}")
        print(f"🌐 Abre tu navegador en: http://localhost:{PORT}/index.html")
        print(f"⏹️  Presiona Ctrl+C para detener el servidor\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n⏹️  Servidor detenido")


