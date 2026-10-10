/* =====================================================================
   Datos para probar, paso por paso
   ---------------------------------------------------------------------
   Pedido de Andrés (10-10-2026): que quien prueba la maqueta vea los
   datos que necesita, sin buscarlos en un documento.

   Una sola tabla para dos usos:
   · El sitio la muestra al lado del cotizador, con el paso en que va la
     persona y un botón para copiar cada dato (/assets/js/datos-prueba.js).
   · El cotizador la usa para «Completar este paso»: escribe los datos en
     los campos de la pantalla, como si los tecleara la persona, y la
     persona revisa y continúa.

   Lo que no se completa solo, a propósito: las casillas de autorización y
   de declaración, y los documentos por leer. Eso lo marca la persona.

   Los clientes son los de clientes-demo.js: ficticios.
   ===================================================================== */

import { CLIENTES_DEMO } from './clientes-demo.js';

const [A, B] = CLIENTES_DEMO;

/** Nueve dígitos cualesquiera: la validación de la firma es simulada. */
export const CEDULA = '123456789';

/** Una fecha de un adulto. La pantalla la muestra día-mes-año; el campo la guarda al revés. */
const NACIMIENTO = { ver: '20-05-1985', iso: '1985-05-20' };

const celular = (/** @type {number} */ n) => String(n).replace(/^56/, '');
const celularVisible = (/** @type {number} */ n) => celular(n).replace(/^(\d)(\d{4})(\d{4})$/, '$1 $2 $3');
const primero = (/** @type {string} */ t) => t.split(' ')[0];

/**
 * Un dato del paso.
 * · rotulo, valor: lo que se ve y lo que se copia.
 * · campo: el id del campo que llena «Completar este paso» (sin campo, solo se muestra).
 * · llenar: si lo que se escribe no es lo que se ve (una fecha, un celular).
 * · nota: una aclaración corta.
 * @typedef {{ rotulo: string, valor: string, campo?: string, llenar?: string, nota?: string }} DatoPrueba
 * @typedef {{ datos: DatoPrueba[], nota?: string }} PasoPrueba
 */

const firma = /** @type {PasoPrueba} */ ({
  datos: [
    { rotulo: 'Día de pago', valor: '5', campo: 'dia', nota: 'o el que quieras' },
    { rotulo: 'Cédula', valor: CEDULA, campo: 'cedula', nota: 'nueve dígitos cualesquiera' },
  ],
  nota: 'Abre cada documento y valida la firma. El pago es simulado: no se cobra nada.',
});
const sinDatos = (/** @type {string} */ nota) => /** @type {PasoPrueba} */ ({ datos: [], nota });

/** @type {Record<string, Record<string, PasoPrueba>>} */
export const PASOS_PRUEBA = {
  'auto-digital': {
    datos: {
      datos: [
        { rotulo: 'RUT', valor: A.rut, campo: 'rut' },
        { rotulo: 'Nombres', valor: primero(A.nombres), campo: 'nombres' },
        { rotulo: 'Apellidos', valor: A.apellidos, campo: 'apellidos' },
        { rotulo: 'Celular', valor: celularVisible(A.celular), llenar: celular(A.celular), campo: 'celular' },
      ],
      nota: 'El correo llega del acceso. La autorización es opcional y la marcas tú.',
    },
    vehiculo: {
      datos: [
        { rotulo: 'Patente', valor: A.patente, campo: 'patente', nota: `${A.marca} ${A.modelo} ${A.anio}` },
        { rotulo: 'Color', valor: 'Blanco', campo: 'color', nota: 'o el que quieras' },
      ],
    },
    planes: sinDatos('Aquí no se escribe nada: elige el plan, el deducible y las cuotas.'),
    confirmacion: {
      datos: [
        { rotulo: 'N° de motor', valor: 'MOTOR12345', campo: 'motor', nota: 'cinco caracteres o más' },
        { rotulo: 'N° de chasis', valor: 'CHASIS12345', campo: 'chasis', nota: 'cinco caracteres o más' },
        { rotulo: 'Dirección', valor: A.direccion, campo: 'direccion' },
        { rotulo: 'Número', valor: String(A.numero), campo: 'numero' },
        { rotulo: 'Comuna', valor: A.comunaDom, campo: 'comuna-dom' },
      ],
    },
    pago: firma,
    listo: sinDatos('Compra de prueba terminada. Para repetirla, vuelve a «Cotizar» desde la página del seguro.'),
  },
  'hogar-facil-plus': {
    datos: {
      datos: [
        { rotulo: 'RUT', valor: B.rut, campo: 'rut' },
        { rotulo: 'Nombres', valor: primero(B.nombres), campo: 'nombres' },
        { rotulo: 'Apellidos', valor: B.apellidos, campo: 'apellidos' },
        { rotulo: 'Celular', valor: celularVisible(B.celular), llenar: celular(B.celular), campo: 'celular' },
      ],
      nota: 'El correo llega del acceso. La autorización es opcional y la marcas tú.',
    },
    vivienda: {
      datos: [
        { rotulo: 'Dirección', valor: B.direccion, campo: 'direccion' },
        { rotulo: 'Número', valor: String(B.numero), campo: 'numero' },
        { rotulo: 'Comuna', valor: B.comunaDom, campo: 'comuna' },
        { rotulo: 'Metros cuadrados', valor: '90', campo: 'm2', nota: 'o los que quieras' },
        { rotulo: 'Año de construcción', valor: '2015', campo: 'anio', nota: 'o el que quieras' },
      ],
    },
    planes: sinDatos('Aquí no se escribe nada: elige el plan y sigue.'),
    confirmacion: {
      datos: [
        { rotulo: 'Nacimiento', valor: NACIMIENTO.ver, llenar: NACIMIENTO.iso, campo: 'nacimiento', nota: 'cualquier adulto' },
      ],
      nota: 'La declaración la marcas tú.',
    },
    pago: firma,
    listo: sinDatos('Compra de prueba terminada. Para repetirla, vuelve a «Cotizar» desde la página del seguro.'),
  },
  'proteccion-urgencias': {
    datos: {
      datos: [
        { rotulo: 'RUT', valor: A.rut, campo: 'rut' },
        { rotulo: 'Nacimiento', valor: NACIMIENTO.ver, llenar: NACIMIENTO.iso, campo: 'nacimiento', nota: 'cualquier adulto' },
        { rotulo: 'Nombres', valor: primero(A.nombres), campo: 'nombres' },
        { rotulo: 'Apellidos', valor: A.apellidos, campo: 'apellidos' },
        { rotulo: 'Celular', valor: celularVisible(A.celular), llenar: celular(A.celular), campo: 'celular' },
      ],
      nota: 'El correo llega del acceso. La autorización es opcional y la marcas tú.',
    },
    planes: sinDatos('Aquí no se escribe nada: elige el plan y sigue.'),
    beneficiarios: {
      datos: [
        { rotulo: 'Nombre', valor: `${primero(B.nombres)} ${B.apellidos}`, campo: 'b-nombre-0' },
        { rotulo: 'RUT', valor: B.rut, campo: 'b-rut-0' },
        { rotulo: 'Parentesco', valor: 'Hijo o hija', campo: 'b-parentesco-0', nota: 'o el que corresponda' },
        { rotulo: 'Porcentaje', valor: '100', campo: 'b-porcentaje-0', nota: 'entre todos suman 100' },
      ],
      nota: 'Designar beneficiarios es opcional. Si eliges «Sí», estos datos completan el primero.',
    },
    pago: firma,
    listo: sinDatos('Compra de prueba terminada. Para repetirla, vuelve a «Contratar» desde la página del seguro.'),
  },
};

/**
 * «Completar este paso»: escribe los datos en los campos de la pantalla y
 * dispara los mismos eventos que el teclado, para que la pantalla valide,
 * busque la patente o calcule como siempre. No avanza: eso lo hace la persona.
 * @param {string} producto @param {string} paso
 * @returns {number} cuántos campos completó
 */
export function rellenar(producto, paso) {
  const lista = PASOS_PRUEBA[producto]?.[paso]?.datos ?? [];
  let n = 0;
  for (const d of lista) {
    const el = d.campo ? document.getElementById(d.campo) : null;
    if (!el || el.closest('[hidden]')) continue;
    if (el instanceof HTMLSelectElement) {
      const i = [...el.options].findIndex((o) => o.value === (d.llenar ?? d.valor));
      if (i < 0) continue;
      el.selectedIndex = i;
    } else if (el instanceof HTMLInputElement) {
      if (el.readOnly) continue;
      el.value = d.llenar ?? d.valor;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else continue;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    n += 1;
  }
  /* Los sugeridores de dirección y comuna se abren con el evento: se
     cierran, porque la persona no está escribiendo. */
  document.querySelectorAll('.sugeridor[data-abierto="true"]').forEach((l) => { /** @type {HTMLElement} */ (l).dataset.abierto = 'false'; });
  document.querySelectorAll('[role="combobox"][aria-expanded="true"]').forEach((i) => i.setAttribute('aria-expanded', 'false'));
  return n;
}
