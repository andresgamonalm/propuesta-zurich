# Reglas de este proyecto

Memoria del proyecto: lo que hay que saber **antes** de tocar nada.

## Con quién se trabaja

Andrés Gamonal (`hola@andresgamonal.com`), Marketing y Ecommerce en Zurich
Chile. **No es técnico.** Decide qué quiere el producto; las decisiones
técnicas se toman aquí y se le muestran resueltas. Se le habla en castellano y
sin jerga. Razonar a fondo, sin atajos. **No empezar un aplicativo nuevo sin su
OK**; para correcciones y continuaciones de lo acordado, avanzar.

## Qué es

Propuesta de mini sitio para la licitación Zurich–Banco BICE. El brief es el
documento «Propuesta de contenidos · Estructura y contenidos del mini sitio de
seguros Zurich para Banco BICE» (octubre 2026).

## Precedencia (del brief)

Obligaciones legales → skill `lineamientos-marca-zurich` → brief → recursos de
Banco BICE. Si la marca no resuelve algo, no se improvisa: queda pendiente.

## Decisiones ya tomadas con él (no reabrir)

- **Cabecera blanca con los logos a color** (versión secundaria del skill).
  Excepción por la alianza: el logo de Banco BICE solo existe azul sobre blanco.
- **Bloqueo de co-branding** arriba a la izquierda: Zurich, divisoria y BICE a
  la altura de la palabra «Zurich», no de la Z (`marco.js › bloqueo`).
- **Pie:** franja de la alianza (blanca, logo BICE, rol de cada compañía) +
  pie Zurich en azul oscuro con logo blanco.
- **Promoción Auto Digital:** se usan las bases oficiales («2 cuotas gratis +
  gift card $60.000», 1 al 10 de octubre de 2026). Él dejó la decisión a
  criterio; la página del producto dice «3 cuotas» y las bases mandan.
- **Entrega:** en el repositorio. Él conecta Cloudflare Pages. Repositorio
  público: los logos y fotos vienen de sus carpetas de Drive.
- **Contenido con lógica promocional:** en cada producto, el gancho (precio o
  promoción) va arriba junto al nombre y al botón.

## Lo que nunca se hace

- **No redactar coberturas, beneficios, precios ni condiciones.** Todo sale de
  zurich.cl y se anota la fecha (`catalogo.js`, cabecera).
- **No inventar textos legales ni campos de consentimiento.** Se muestran como
  pendientes.
- **No reconstruir cotizadores, pagos ni denuncias:** se integran en el marco.
- **No usar colores de BICE** fuera del identificador de la alianza.
- **Sobre el Azul de Zúrich `#2167AE` solo va texto blanco** (5,81:1). El
  `--texto-invertido-suave` da 4,36:1 ahí y no cumple: es solo para azul oscuro.
- **No tocar GitHub, Cloudflare ni dominios** sin que él lo pida.

## Cómo está hecho

- HTML estático y módulos ES nativos, **sin dependencias**. La carpeta es la
  dirección. Cada `index.html` declara `data-pagina` y `data-id`; todo arranca
  en `assets/js/entrada.js`.
- **Una sola fuente de contenido:** `assets/js/catalogo.js`. Para cambiar un
  texto, un precio o una promoción, se cambia ahí.
- Lo que decide el administrador se guarda **solo como diferencia** sobre el
  catálogo (`estado.js`).
- Orígenes que pueden cargarse en el marco: `ORIGENES_PERMITIDOS` en
  `paginas/configuracion.js` **y** `frame-src` en `_headers`. Se cambian juntos.
- Sin estilos ni scripts en línea: la política de seguridad los bloquea.

## Antes de cada commit

```
node _herramientas/verificar.mjs
```

Debe terminar en 0 fallas. Recorre todo de forma recursiva (nunca una lista
escrita a mano), en 1440, 820 y 390 px, prueba los flujos y mide el contraste
de lo pintado. Si se agrega una página, se agrega sola al recorrido.

## Trampas conocidas

- `[hidden]` necesita `display: none !important` (ya está en el CSS).
- Textos `.sr` dentro de un contenedor con desplazamiento escapan y ensanchan
  la página en el celular si el contenedor no tiene `position: relative`.
- `aspect-ratio` + `min-height` en una foto fuerza un ancho mínimo y desborda
  en el celular.
- Las columnas de una rejilla de una sola pista van en `minmax(0, 1fr)`, no
  `1fr`: con `1fr` un contenido largo empuja la página.
