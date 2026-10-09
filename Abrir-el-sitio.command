#!/bin/bash
# Abre la propuesta en el navegador del Mac. Doble clic en el Finder.
cd "$(dirname "$0")"
PUERTO=5178
echo ""
echo "  SEGUROS ZURICH PARA CLIENTES DE BANCO BICE · versión local"
echo "  Se abre en http://127.0.0.1:$PUERTO/login/"
echo "  Administrador: hola@andresgamonal.com · cualquier otro correo entra como cliente."
echo "  Deja esta ventana abierta mientras lo revisas. Para cerrarlo, ciérrala."
echo ""
( sleep 1; open "http://127.0.0.1:$PUERTO/login/" ) &
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PUERTO --bind 127.0.0.1
elif command -v node >/dev/null 2>&1; then
  npx --yes http-server -p $PUERTO -a 127.0.0.1 -c-1
else
  echo "No encontré Python ni Node en este computador."
  read -r -p "Presiona Enter para cerrar."
fi
