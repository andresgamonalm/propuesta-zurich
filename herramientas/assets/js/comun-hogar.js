/* =====================================================================
   Cotizador de demostración · Hogar Fácil Plus — comun-hogar.js
   Lo propio del recorrido de hogar. Nada más.
   ---------------------------------------------------------------------
   Este archivo NO repite la carcasa. Todo lo que las dos cotizaciones
   comparten —el selector $, la medición, la validación declarativa, el
   autocompletado, el modal, la cabecera, el «por qué te lo pedimos»—
   se importa de comun.js y se vuelve a exportar desde aquí, para que
   una pantalla de hogar tenga un solo sitio del que importar.

   Lo único que hogar necesita propio es el ESTADO: una cotización de
   auto y una de hogar tienen que poder convivir en la misma sesión sin
   pisarse, así que cada una guarda bajo su propia llave.
   ===================================================================== */

import { buscaCliente, formateaRut, CLIENTES } from './datos.js';
import { estructuraUF, contenidoSugerido, acotaContenido, regionDe,
         ANIO_ACTUAL, primaAnualUF, pesos, planHogarPorId } from './datos-hogar.js';
import { pintarPasos, fechaLarga } from './comun.js';
import { leerAlmacen, guardarAlmacen, borrarAlmacen } from './almacen.js';

/* Lo compartido se reexporta tal cual: una pantalla de hogar importa
   todo de aquí y no tiene que saber qué vive en cuál archivo. */
export { $, $$, ev, pista, marcarDeBase, desmarcarDeBase, validarFormulario,
         autocompletar, montarComun, montarModal, escapar, formateaCelular,
         irA, fechaLarga, correoDelSitio } from './comun.js';

/* ── ESTADO ───────────────────────────────────────────────────────── */
const LLAVE = 'zurich_demo_hogar';

const VACIO = {
  rut: '', origen: null,
  persona: { nombres: '', apellidos: '', correo: '', celular: '' },
  consentimiento: false,
  vivienda: {
    tipo: 'casa', direccion: '', numero: '', depto: '', comuna: '', region: '',
    material: 'solido', anio: null, m2: null
  },
  /* El monto asegurado no se le pide al cliente: se estima con los metros
     y el material, y queda editable. Ver datos-hogar.js §4. */
  montoEstructura: 0, montoContenido: 0,
  plan: 'completo', deducible: 3,
  /* 12 o 24. Cuidado con el nombre: `vigencia`, más abajo, es el rango de
     fechas de la póliza; esto es cuánto dura el contrato. */
  meses: 12,
  pago: { cuotas: 12, diaCargo: '' },
  vigencia: null,
  poliza: null
};

const clonar = o => JSON.parse(JSON.stringify(o));

function leer() {
  const sobre = leerAlmacen(LLAVE);
  return sobre ? { ...clonar(VACIO), ...sobre.datos } : clonar(VACIO);
}

/** Cuándo se guardó lo que hay, o null si no hay nada vigente. Lo usa el
    aviso de «tenías algo a medias» para decir cuántos días le quedan. */
export function guardadoEn() {
  return leerAlmacen(LLAVE)?.guardadoEn ?? null;
}

/** El estado de esta cotización de hogar. Mismo criterio que `estado` en
   comun.js: la forma se declara porque viene de un JSON.parse.

   @type {import('./tipos.js').EstadoHogar} */
export const estadoHogar = leer();

export function guardarHogar(parcial = {}) {
  Object.assign(estadoHogar, parcial);
  guardarAlmacen(LLAVE, estadoHogar);
  return estadoHogar;
}

export function reiniciarHogar() {
  borrarAlmacen(LLAVE);
  Object.assign(estadoHogar, clonar(VACIO));
}

/* ── PASOS ────────────────────────────────────────────────────────────
   Cinco, los mismos cinco que auto, con los mismos rótulos donde el
   significado es el mismo. Que IT pueda poner las dos barras una al lado
   de la otra y vea el mismo componente es parte del encargo. */
export const PASOS_HOGAR = [
  { id: 'datos',     n: 1, rotulo: 'Tus datos',    url: '/herramientas/hogar-facil-plus/datos/' },
  { id: 'vivienda',  n: 2, rotulo: 'Tu vivienda',  url: '/herramientas/hogar-facil-plus/vivienda/' },
  { id: 'planes',    n: 3, rotulo: 'Tu plan',      url: '/herramientas/hogar-facil-plus/planes/' },
  { id: 'confirmar', n: 4, rotulo: 'Confirmación', url: '/herramientas/hogar-facil-plus/confirmacion/' },
  { id: 'pagar',     n: 5, rotulo: 'Pago',         url: '/herramientas/hogar-facil-plus/pago/' }
];

export const pintarPasosHogar = actual => pintarPasos(actual, PASOS_HOGAR);

/* ── VIGENCIA ─────────────────────────────────────────────────────────
   Una póliza de hogar se contrata con fechas explícitas. El cotizador de
   referencia las muestra en el resumen —«Del 12/10/2026 al 12/10/2027»— y
   tiene razón: es el dato que le dice al cliente hasta cuándo está
   cubierto.

   Con vigencia bienal el término se corre dos años. Si no, la boleta
   diría 24 cuotas y la póliza doce meses de cobertura, que es justo la
   contradicción que hace desconfiar de un cotizador. */
export function vigenciaAnual(desde = new Date(), anios = 1) {
  const fin = new Date(desde);
  fin.setFullYear(fin.getFullYear() + (anios === 2 ? 2 : 1));
  return { inicio: desde.toISOString().slice(0, 10), termino: fin.toISOString().slice(0, 10),
           inicioTxt: fechaLarga(desde), terminoTxt: fechaLarga(fin) };
}

/* ── SEMILLA DE DEMOSTRACIÓN ──────────────────────────────────────────
   Con ?demo en la URL cualquier pantalla del recorrido se abre con el
   estado completo, igual que en auto. Sirve para revisar el paso 4 sin
   recorrer el formulario entero en cada iteración.

   La vivienda no está en la base de clientes: la base trae la dirección,
   no los metros ni el material. Se derivan del propio RUT con una cuenta
   estable, para que un mismo RUT abra siempre la misma casa y la demo se
   pueda mostrar dos veces sin que cambien los números. */
function numeroEstable(texto, tope) {
  let h = 0;
  for (const c of String(texto)) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h % tope;
}

function viviendaDe(cliente) {
  const esDepto = /depto/i.test(cliente.depto || '');
  const semilla = numeroEstable(cliente.rut, 1000);
  const m2 = esDepto ? 62 + (semilla % 45) : 105 + (semilla % 70);
  const material = esDepto ? 'solido' : ['solido', 'solido', 'mixto'][semilla % 3];
  const anio = 1998 + (semilla % 27);
  return {
    tipo: esDepto ? 'departamento' : 'casa',
    direccion: cliente.direccion, numero: String(cliente.numero),
    depto: cliente.depto || '', comuna: cliente.comunaDom,
    region: regionDe(cliente.comunaDom),
    material, anio, m2
  };
}

/* LA PÓLIZA DE LA DEMOSTRACIÓN
   Antes quedaba en null, y la consecuencia era que
   /herramientas/hogar-facil-plus/listo/?demo rebotaba al inicio: la
   guarda de esa pantalla exige una póliza emitida y no había ninguna. O
   sea, la última pantalla del recorrido de hogar no se podía mostrar sin
   recorrer el formulario completo y pagar. En auto sí se podía, porque su
   semilla la trae desde el principio.

   Las cifras se calculan, no se escriben: si fueran fijas, la pantalla de
   planes diría un precio y la póliza otro, y eso en una demostración se
   ve como un error. La cuenta se repite aquí en vez de pedírsela a
   cotizacion-hogar.js porque ese módulo importa este, y al revés quedaría
   circular. Es la misma decisión que tomó auto, por la misma razón.

   El número sale del RUT y no del reloj: la semilla entera está hecha para
   que un mismo RUT abra siempre lo mismo, y un número que cambia cada vez
   que se recarga rompe eso. La póliza de verdad, la que emite el paso de
   pago, sí usa el reloj. */
function polizaDemo(cliente, vivienda, estructura, meses) {
  const plan = planHogarPorId('completo');
  const anualUF = primaAnualUF({
    planId: 'completo', deducibleUF: 3,
    estructura, contenido: contenidoSugerido(estructura),
    materialId: vivienda.material, tipoViviendaId: vivienda.tipo,
    anio: vivienda.anio
  });
  const mensual = pesos(anualUF / 12);
  /* Hogar Fácil Plus no tiene promoción de cuotas publicada. */
  const descuento = 0;
  const total = mensual * meses;
  const cuotas = meses === 24 ? 24 : 12;

  return {
    numero: 'HF-' + String(10000000 + numeroEstable(cliente.rut, 89999999)),
    fecha: fechaLarga(),
    total, valorCuota: Math.round(total / cuotas), descuento, mensual, cuotas,
    montoEstructura: estructura,
    montoContenido: plan.cubreContenido ? contenidoSugerido(estructura) : 0
  };
}

function semillaDemo(rut) {
  /* El respaldo final es el primer registro de la base y no un RUT
     escrito a mano. Antes decía '30517786-5' dos veces: si alguien edita
     la base y ese registro desaparece, `cliente` queda en null y la
     semilla revienta con un error que no dice nada. Con CLIENTES[0] el
     respaldo existe mientras exista la base. */
  const cliente = buscaCliente(rut && /^[\d.\-kK]+$/.test(rut) ? rut : '30517786-5')
               || buscaCliente('30517786-5')
               || CLIENTES[0];

  const vivienda = viviendaDe(cliente);
  const estructura = estructuraUF(vivienda.m2, vivienda.material);
  /* ?meses=24 abre la demo directamente en vigencia bienal. */
  const meses = new URLSearchParams(location.search).get('meses') === '24' ? 24 : 12;

  const base = {
    rut: formateaRut(cliente.rut), origen: 'base',
    persona: { nombres: cliente.nombres, apellidos: cliente.apellidos,
               correo: cliente.correo, celular: String(cliente.celular) },
    consentimiento: true,
    vivienda,
    montoEstructura: estructura,
    montoContenido: contenidoSugerido(estructura),
    plan: 'completo', deducible: 3,
    meses,
    pago: { cuotas: 12, diaCargo: '5' },
    vigencia: vigenciaAnual(new Date(), meses === 24 ? 2 : 1),
    poliza: polizaDemo(cliente, vivienda, estructura, meses)
  };

  /* ?plan= abre directo en un plan, para revisar los tres sin recorrer
     el formulario tres veces. Solo actúa en modo demo. */
  const plan = new URLSearchParams(location.search).get('plan');
  if (plan && ['estructura', 'completo', 'premium'].includes(plan)) base.plan = plan;

  guardarHogar(base);
}

/* ── GUARDA DE PASO ───────────────────────────────────────────────────
   Si alguien entra directo a /herramientas/hogar-facil-plus/pago/ sin haber cotizado, vuelve al
   inicio en vez de mostrar una pantalla rota. Misma mecánica que auto. */
export function exigirHogar(...requisitos) {
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo !== null) semillaDemo(demo);

  const v = estadoHogar.vivienda;
  const cumple = {
    rut:       () => !!estadoHogar.rut,
    persona:   () => !!estadoHogar.persona.nombres && !!estadoHogar.persona.correo,
    consentimiento: () => estadoHogar.consentimiento === true,
    vivienda:  () => !!v.direccion && !!v.comuna && !!v.m2 && !!v.anio,
    monto:     () => Number(estadoHogar.montoEstructura) > 0,
    plan:      () => !!estadoHogar.plan,
    poliza:    () => !!estadoHogar.poliza
  };
  for (const r of requisitos) {
    if (cumple[r] && !cumple[r]()) { location.replace(PASOS_HOGAR[0].url); return false; }
  }
  return true;
}

/* Mantiene el monto asegurado coherente con la vivienda declarada. Se
   llama al salir del paso 2 y cada vez que cambian metros o material. */
export function recalcularMontos() {
  const v = estadoHogar.vivienda;
  const estructura = estructuraUF(v.m2, v.material);
  const contenido = estadoHogar.montoContenido
    ? acotaContenido(estadoHogar.montoContenido, estructura)
    : contenidoSugerido(estructura);
  guardarHogar({ montoEstructura: estructura, montoContenido: contenido });
  return { estructura, contenido };
}

export const nombreCortoHogar = () =>
  (estadoHogar.persona.nombres || '').trim().split(' ')[0] || '';

export { ANIO_ACTUAL };
