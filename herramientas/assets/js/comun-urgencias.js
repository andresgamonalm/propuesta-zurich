// @ts-check
/* =====================================================================
   Cotizador de demostración · Protección Urgencias — comun-urgencias.js
   ---------------------------------------------------------------------
   Lo propio del recorrido: su estado (con su propia llave, para convivir
   con Auto y Hogar en la misma sesión), sus pasos y la guarda. Todo lo
   demás —validación, modal, medición, marco— viene de comun.js, igual
   que en Hogar.
   ===================================================================== */
import { pintarPasos, fechaLarga } from './comun.js';
import { leerAlmacen, guardarAlmacen, borrarAlmacen } from './almacen.js';
import { planPorId } from './datos-urgencias.js';

export { $, $$, ev, pista, validarFormulario, montarComun, montarModal, escapar,
         formateaCelular, fechaLarga, correoDelSitio } from './comun.js';

const LLAVE = 'zurich_demo_urgencias';

const VACIO = {
  rut: '',
  persona: { nombres: '', apellidos: '', correo: '', celular: '' },
  nacimiento: '',
  consentimiento: false,
  plan: 'estandar',
  /** @type {{ designar: boolean, lista: { nombre: string, rut: string, parentesco: string, porcentaje: number }[] }} */
  beneficiarios: { designar: false, lista: [] },
  pago: { diaCargo: '' },
  /** @type {null | { numero: string, fecha: string, prima: number, primaUF: number }} */
  poliza: null,
};

const clonar = (/** @type {any} */ o) => JSON.parse(JSON.stringify(o));

function leer() {
  const sobre = leerAlmacen(LLAVE);
  return sobre ? { ...clonar(VACIO), ...sobre.datos } : clonar(VACIO);
}

/** @type {typeof VACIO} */
export const estadoU = leer();

/** @param {Partial<typeof VACIO>} parcial */
export function guardarU(parcial = {}) {
  Object.assign(estadoU, parcial);
  guardarAlmacen(LLAVE, estadoU);
  return estadoU;
}

export function reiniciarU() {
  borrarAlmacen(LLAVE);
  Object.assign(estadoU, clonar(VACIO));
}

/* ── PASOS ─────────────────────────────────────────────────────────── */
export const PASOS_U = [
  { id: 'datos',         n: 1, rotulo: 'Tus datos',     url: '/herramientas/proteccion-urgencias/datos/' },
  { id: 'planes',        n: 2, rotulo: 'Tu plan',       url: '/herramientas/proteccion-urgencias/planes/' },
  { id: 'beneficiarios', n: 3, rotulo: 'Beneficiarios', url: '/herramientas/proteccion-urgencias/beneficiarios/' },
  { id: 'pagar',         n: 4, rotulo: 'Pago',          url: '/herramientas/proteccion-urgencias/pago/' },
];

export const pintarPasosU = (/** @type {string} */ actual) => pintarPasos(actual, PASOS_U);

/* ── SEMILLA DE DEMOSTRACIÓN ───────────────────────────────────────────
   Con ?demo cualquier pantalla abre con el estado completo, igual que en
   Auto y Hogar. ?plan= elige el plan. */
function semillaDemo() {
  const parametros = new URLSearchParams(location.search);
  const plan = ['basico', 'estandar', 'premium'].includes(parametros.get('plan') || '') ? String(parametros.get('plan')) : 'estandar';
  const p = planPorId(plan);
  guardarU({
    rut: '30517786-5',
    persona: { nombres: 'Sofía Belén', apellidos: 'Navarro Mella',
               correo: 'sofia.navarro.001@datos-ficticios.test', celular: '56900000001' },
    nacimiento: '1988-04-12',
    consentimiento: true,
    plan,
    beneficiarios: { designar: true, lista: [
      { nombre: 'Tomás Navarro Mella', rut: '50168305-1', parentesco: 'Hermano o hermana', porcentaje: 100 },
    ] },
    pago: { diaCargo: '5' },
    poliza: { numero: 'PU-00000001', fecha: fechaLarga(), prima: p.primaPesos, primaUF: p.primaUF },
  });
}

/** Sin lo necesario, vuelve al primer paso. @param {...string} requisitos */
export function exigirU(...requisitos) {
  if (new URLSearchParams(location.search).get('demo') !== null) semillaDemo();
  /** @type {Record<string, () => boolean>} */
  const cumple = {
    persona: () => !!estadoU.rut && !!estadoU.persona.nombres && !!estadoU.persona.correo && !!estadoU.nacimiento,
    plan: () => !!estadoU.plan,
    poliza: () => !!estadoU.poliza,
  };
  for (const r of requisitos) {
    if (cumple[r] && !cumple[r]()) { location.replace(PASOS_U[0].url); return false; }
  }
  return true;
}

/** Edad cumplida a hoy. @param {string} iso aaaa-mm-dd */
export function edadDe(iso) {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return NaN;
  const hoy = new Date();
  let edad = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad -= 1;
  return edad;
}
