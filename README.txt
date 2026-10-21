PEAKX SD - navegador proxy (Ultraviolet + epoxy + Wisp)

OPCION A (la mas facil): todo en un solo servidor
1. Sube esta carpeta completa a un repo de GitHub.
2. En Render (o Railway) crea un "Web Service" con ese repo.
   Build command: npm install     Start command: npm start
3. Abre la URL que te da Render. Listo, no tocas nada mas.

OPCION B: interfaz en htmlhoster + Wisp aparte
1. Despliega el servidor como en la opcion A.
2. Abre public/config.js y pon: window.PEAKX_WISP = "wss://TU-APP.onrender.com/wisp/";
3. Sube la carpeta public/ a htmlhoster (funciona aunque quede en una subcarpeta como /p/ID/public/).
   Sin servidor Wisp la pagina carga pero no puede abrir sitios.

Para probar en tu PC: npm install && npm start  ->  http://localhost:8080
