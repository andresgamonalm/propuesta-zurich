# Seguros Zurich para clientes de Banco BICE

Propuesta de mini sitio para la licitación Zurich–Banco BICE: productos,
cotizadores y servicios de Zurich en un solo espacio, dentro del entorno
privado del banco, con roles de marca claramente diferenciados.

**Estado:** prototipo navegable, listo para revisión. No publicado.

## Abrirlo en tu equipo

- **Windows:** doble clic en `Abrir-el-sitio.cmd`
- **Mac:** doble clic en `Abrir-el-sitio.command`

Se abre `http://127.0.0.1:5178/login/`. Para entrar como administrador usa
`hola@andresgamonal.com`; cualquier otro correo entra como cliente. Necesita
Python o Node instalados en el equipo (el lanzador lo resuelve solo).

## Qué hay

| | |
|---|---|
| 34 páginas | Acceso, portada, catálogo y 4 ramos, 8 productos, 5 cotizadores y 4 trámites integrados, 3 asesorías con su confirmación, alianza, Mundo Zurich, configuración y 404 |
| Contenido | Tomado de las páginas oficiales de zurich.cl el 9 de octubre de 2026 (`assets/js/catalogo.js`) |
| Marca | `lineamientos-marca-zurich`, con cabecera blanca y bloqueo de co-branding Zurich–Banco BICE |
| Medición | Eventos `pag` / `click` / `rec` en `window.dataLayer`, visibles en Configuración › Medición |
| Integraciones | Dentro del marco va solo el formulario de Zurich, con la promoción o el aviso al lado. Seis herramientas cargan su formulario; Auto Digital, Hogar Fácil Plus y Protección Urgencias esperan esa dirección de Zurich |
| Pendientes | 50 definiciones antes de producción, listadas en Configuración › Pendientes |

## Verificar

```
node _herramientas/verificar.mjs
```

Recorre todas las rutas en escritorio, tablet y celular, prueba los flujos y
audita el contraste, con las mismas cabeceras de seguridad que se publican.
Última ejecución: **637 comprobaciones, 0 fallas**.
Detalle en `REVISION.md`.

## Publicar

Cloudflare Pages, sin comando de compilación, con la raíz del repositorio como
salida. Las cabeceras de seguridad están en `_headers`.

## Retomar el trabajo

`TRASPASO.md` explica de qué se trata, qué se decidió, qué se hizo y en qué
quedó. Sirve para abrir otro chat sin perder nada.

## Documentos

En `_entregables/`: documentación general y técnica, descripción
publicitaria (Word), capturas, portada de presentación e íconos.
