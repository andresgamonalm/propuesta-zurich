/* =====================================================================
   Cotizador de demostración · Hogar Fácil Plus — datos
   ---------------------------------------------------------------------
   ORIGEN DE CADA DATO — importante para quien revise esto:

   1. EL PRODUCTO (planes, coberturas, asistencias, requisitos)
      Fuente: zurich.cl/bienes-y-viaje/hogar-facil-plus (leída por el
      piloto el 14 de septiembre de 2026 y por el sitio el 9 de octubre).
      REAL. Hogar Fácil Plus existe y se vende: cinco
      planes (Premium, Estándar, Vacacional, Rural e Hipotecario),
      estructura y contenido, antigüedad máxima 75 años, materiales
      Sólido / Ligero / Mixto, y tres asistencias propias —Hogar al RUT,
      SOS y Mascotas—. El Plan Premium va sin deducible en rotura de
      cañerías, riesgos de la naturaleza y rotura de cristales.

      De los cinco planes, este canal cotiza los de vivienda urbana con
      ocupación permanente. Vacacional, Rural e Hipotecario son variantes
      de uso y quedan declaradas como derivación a ejecutivo.

   2. LA ESCALERA DE TRES PLANES
      Fuente: el escalón lo define la MATERIA ASEGURADA, que es como se
      contrata de verdad: «puede contratarse separadamente respecto al
      Bien Raíz o Bienes Muebles, o ambos conjuntamente» (condicionado
      POL 1 2013 1297, Consorcio, artículo 3). Estructura → estructura y
      contenido → Premium. No es una escalera de marketing.

   3. LOS SUBLÍMITES COMO PORCENTAJE DEL MONTO ASEGURADO
      Fuente: el cotizador de referencia del encargo, lámina 7. Sobre un
      monto asegurado de UF 4.900 declara Demoliciones UF 245 (5%),
      Remoción de escombros UF 98 (2%) e Inhabitabilidad UF 294 (6%).
      Esa tabla parece fija y es derivada; la nuestra lo dice y recalcula.

   4. LA REGLA DEL CONTENIDO — 10% a 60% del edificio
      Fuente: folleto Seguro Hogar de Consorcio, criterios de suscripción
      («Contenido Mínimo: 10% Edificio · Contenido Máximo: 60% Edificio»).
      REAL, de mercado. Acota el control de contenido del paso 3.

   5. RESPONSABILIDAD CIVIL FAMILIAR UF 500
      Fuente: blog de Consorcio, «El ABC del seguro hogar», y folleto de
      coberturas opcionales. Es la cifra estándar del ramo en Chile.

   6. EL COTIZADOR NUEVO DE LA COMPAÑÍA
      Fuente: «Nuevo Cotizador Hogar», 17 láminas, y una cotización de
      ejemplo emitida el 7 de octubre de 2026. REAL. De ahí salen los
      códigos de las condiciones generales depositadas en la CMF —la
      póliza POL 1 2026 0013 y sus cláusulas adicionales—, los
      deducibles cobertura por cobertura, las condiciones de
      asegurabilidad, las exclusiones, las definiciones del producto y
      la lista de materiales de construcción con sus reglas.

      Ese cotizador es la herramienta del corredor, no un canal de
      venta: habla de «tu cliente», lleva código de corredor, comisión y
      sacrificio de comisión, y el PDF lo genera el corredor para
      mandarlo después. Nada de eso se trajo. Lo que se trajo son los
      datos y la letra legal.

      Este canal vende solo HABITACIONAL. El cotizador de la compañía
      abre además Vacacional y Rural; acá los dos siguen derivando a
      ejecutivo, por decisión del negocio.

   7. [SIMULACIÓN] LA TARIFA
      ESTO NO ES TARIFA DE ZURICH. Es una regla de tres calibrada contra
      una cotización pública de mercado: UF 16,7608 al año por UF 4.900
      de estructura (lámina 6 del PPTX de referencia), o sea 0,342%.
      Nuestro producto general cubre menos que ese hipotecario, así que
      la tasa base parte más abajo y sube por plan. En producción este
      bloque completo se reemplaza por la llamada al motor de
      tarificación, igual que en el cotizador de auto.

   ===================================================================== */

import { UF, COMUNAS, pesos, ufTxt } from './datos.js';

/* El nombre comercial del canal digital. Va en la propuesta, en la
   boleta y en el comprobante. Antes decía «Seguro Hogar Fácil Plus», que es
   la familia de producto y no lo que se contrata aquí: el cotizador de
   la compañía tenía el mismo problema —emitía «Hogar Permanente»— y
   está anotado en su propio feedback. */
export const PRODUCTO = 'Seguro Hogar Fácil Plus';

/* Las condiciones generales depositadas en la CMF. La póliza base y cada
   cláusula adicional tienen su código, y es lo que permite a cualquiera
   leer en cmfchile.cl exactamente lo que contrató. Por eso van cobertura
   por cobertura y no una sola vez al pie. */
export const CONDICIONADO = 'POL 1 2026 0013';

/* ── DÓNDE ESTÁ LA VIVIENDA ──────────────────────────────────────────
   La región no se pregunta: se deduce de la comuna. Un dato que el
   sistema puede deducir no se le pregunta a nadie. */
const REGION_POR_COMUNA = {
  'Arica': 'Arica y Parinacota',
  'Iquique': 'Tarapacá', 'Alto Hospicio': 'Tarapacá',
  'Antofagasta': 'Antofagasta', 'Calama': 'Antofagasta',
  'Copiapó': 'Atacama',
  'La Serena': 'Coquimbo', 'Coquimbo': 'Coquimbo', 'Ovalle': 'Coquimbo',
  'Valparaíso': 'Valparaíso', 'Viña del Mar': 'Valparaíso', 'Quilpué': 'Valparaíso',
  'Villa Alemana': 'Valparaíso', 'San Antonio': 'Valparaíso', 'Quillota': 'Valparaíso',
  'Los Andes': 'Valparaíso', 'San Felipe': 'Valparaíso',
  'Rancagua': "O'Higgins", 'Machalí': "O'Higgins", 'San Fernando': "O'Higgins",
  'Curicó': 'Maule', 'Talca': 'Maule', 'Linares': 'Maule',
  'Chillán': 'Ñuble',
  'Concepción': 'Biobío', 'Talcahuano': 'Biobío', 'San Pedro de la Paz': 'Biobío',
  'Hualpén': 'Biobío', 'Coronel': 'Biobío', 'Los Ángeles': 'Biobío',
  'Temuco': 'La Araucanía', 'Padre Las Casas': 'La Araucanía', 'Villarrica': 'La Araucanía',
  'Valdivia': 'Los Ríos',
  'Osorno': 'Los Lagos', 'Puerto Montt': 'Los Lagos', 'Puerto Varas': 'Los Lagos',
  'Castro': 'Los Lagos',
  'Coyhaique': 'Aysén',
  'Punta Arenas': 'Magallanes'
};

/* Las 48 comunas restantes de la lista son de la Región Metropolitana. */
export const regionDe = comuna =>
  REGION_POR_COMUNA[comuna] || (COMUNAS.includes(comuna) ? 'Metropolitana de Santiago' : '');

export { COMUNAS };

/* ── QUÉ VIVIENDA ES ─────────────────────────────────────────────────
   Casa o departamento. Un departamento en altura tiene menos exposición
   a robo por forzamiento y no responde por el terreno, así que paga
   menos. [SIMULACIÓN] en los factores; la distinción es real. */
export const TIPOS_VIVIENDA = [
  /* `genero` no es decoración: sin él la pantalla final decía «tu
     departamento quedó asegurada». Una concordancia rota en la pantalla
     donde el cliente acaba de pagar se lee como descuido. */
  { id: 'casa',         rotulo: 'Casa',         factor: 1.10, genero: 'f', articulo: 'una' },
  { id: 'departamento', rotulo: 'Departamento', factor: 0.92, genero: 'm', articulo: 'un' }
];

/* Concuerda un participio o adjetivo con el tipo de vivienda. */
export const concuerda = (tipoId, raiz) =>
  raiz + (tipoViviendaPorId(tipoId).genero === 'f' ? 'a' : 'o');

/* ── DE QUÉ ESTÁ HECHA ───────────────────────────────────────────────
   Sólido, Ligero y Mixto son las tres categorías que usa Zurich en la
   ficha de Hogar Fácil Plus. No son «hormigón armado» ni «albañilería»,
   que es como las nombra el cotizador de referencia: si el cotizador usa
   un vocabulario y la póliza otro, el cliente no puede comprobar que
   contrató lo que cotizó.

   `ufM2` es el costo de reposición por metro cuadrado construido, y es
   lo que nos permite estimar el monto asegurado sin pedirle al cliente
   la tasación del banco. [SIMULACIÓN] en las cifras. */
export const MATERIALES = [
  { id: 'solido', rotulo: 'Sólido', factor: 1.00, ufM2: 22,
    detalle: 'Hormigón armado o albañilería en toda la vivienda',
    tipos: ['Ladrillo', 'Hormigón', 'Concreto reforzado'],
    regla: 'También es sólida la que tiene segundo piso o mansarda de madera sobre losa de concreto, y la que tiene una ampliación ligera que no pasa del 30% de los metros construidos.' },
  { id: 'mixto',  rotulo: 'Mixto',  factor: 1.18, ufM2: 18,
    detalle: 'Albañilería en el primer piso y madera o tabiquería arriba',
    tipos: ['Concreto con metalcón', 'Concreto con madera', 'Ladrillo con metalcón', 'Ladrillo con madera'],
    regla: 'También es mixta la vivienda sólida cuya ampliación ligera está entre el 30% y el 50% de los metros construidos.' },
  { id: 'ligero', rotulo: 'Ligero', factor: 1.45, ufM2: 14,
    detalle: 'Madera, tabiquería o paneles en toda la vivienda',
    tipos: ['Madera', 'Metalcón', 'Siding'],
    regla: 'También es ligera la que tiene primer piso de albañilería reforzada y segundo piso o mansarda de madera, y la que tiene una ampliación ligera sobre el 50% de los metros construidos.' },
  /* El adobe no es un material más: está excluido de la cobertura y por
     eso aparece en la lista. Si no apareciera, quien vive en una casa de
     adobe la declararía «sólida» —que es lo que parece— y el problema
     saldría recién al liquidar un siniestro. */
  { id: 'adobe',  rotulo: 'Adobe',  factor: 0, ufM2: 0, excluido: true,
    detalle: 'Adobe en toda la vivienda o en una parte',
    tipos: ['Adobe', 'Adobillo'],
    regla: 'Las construcciones hechas total o parcialmente de adobe están excluidas de esta póliza.' }
];

/* Los materiales que este canal cotiza. El adobe queda fuera de los
   selectores y de la tarifa: se ofrece para que se declare, no para que
   se cotice. */
export const MATERIALES_COTIZABLES = MATERIALES.filter(m => !m.excluido);

export const materialPorId = id => MATERIALES.find(m => m.id === id) || MATERIALES[0];
export const tipoViviendaPorId = id => TIPOS_VIVIENDA.find(t => t.id === id) || TIPOS_VIVIENDA[0];

/* ── CUÁNTOS AÑOS TIENE ──────────────────────────────────────────────
   «Antigüedad máxima 75 años» es requisito publicado de Hogar Fácil
   Plus. No es una validación inventada: es asegurabilidad. */
export const ANTIGUEDAD_MAXIMA = 75;
export const ANIO_ACTUAL = 2026;
export const ANIO_MINIMO = ANIO_ACTUAL - ANTIGUEDAD_MAXIMA;

/* [SIMULACIÓN] Una vivienda más nueva tiene instalaciones más nuevas y
   menos siniestros de agua y eléctricos. */
export function factorAnio(anio) {
  const edad = ANIO_ACTUAL - Number(anio || ANIO_ACTUAL);
  if (edad <= 5)  return 0.94;
  if (edad <= 15) return 1.00;
  if (edad <= 30) return 1.07;
  if (edad <= 50) return 1.15;
  return 1.24;
}

/* ── EL MONTO ASEGURADO ──────────────────────────────────────────────
   Aquí está la diferencia con el cotizador de referencia, que dice «para
   cotizar este seguro se debe consultar con el banco el monto asegurado»
   y pide una tasación en UF que nadie tiene a mano: es el punto donde cae la
   cotización. Nosotros lo estimamos con los metros y el material, y lo
   dejamos editable. El cliente corrige un número; no va a buscarlo. */
export function estructuraUF(m2, materialId) {
  const m = materialPorId(materialId);
  return Math.round(Number(m2 || 0) * m.ufM2);
}

/* Regla de suscripción real: el contenido se asegura entre el 10% y el
   60% del edificio. Debajo del 10% no hay póliza; encima del 60% hay
   inspección. El control del paso 3 se mueve dentro de esa banda. */
export const CONTENIDO_MIN_PCT = 0.10;
export const CONTENIDO_MAX_PCT = 0.60;
export const CONTENIDO_SUGERIDO_PCT = 0.25;

export const contenidoMin = estructura => Math.round(estructura * CONTENIDO_MIN_PCT);
export const contenidoMax = estructura => Math.round(estructura * CONTENIDO_MAX_PCT);
export const contenidoSugerido = estructura => Math.round(estructura * CONTENIDO_SUGERIDO_PCT);

export const acotaContenido = (valor, estructura) =>
  Math.min(contenidoMax(estructura), Math.max(contenidoMin(estructura), Math.round(Number(valor) || 0)));

/* ── DEDUCIBLE ───────────────────────────────────────────────────────
   En hogar el deducible se expresa en UF por evento, no en tramos como
   en auto. [SIMULACIÓN] en los factores. */
export const DEDUCIBLES_HOGAR = [
  { uf: 1, factor: 1.14 },
  { uf: 3, factor: 1.00 },
  { uf: 5, factor: 0.90 }
];
export const deduciblePorUF = uf =>
  DEDUCIBLES_HOGAR.find(d => d.uf === Number(uf)) || DEDUCIBLES_HOGAR[1];

/* ── LOS TRES PLANES ─────────────────────────────────────────────────
   La escalera es de materia asegurada, que es como se contrata de
   verdad. Los nombres Estándar y Premium son los del producto; el tercer
   escalón no inventa un nombre, dice qué cubre.

   `tasa` es la prima anual como fracción del monto asegurado.
   [SIMULACIÓN] calibrada contra una cotización pública de mercado. */
export const PLANES_HOGAR = [
  {
    id: 'estructura', nombre: 'Estándar · Solo estructura', corto: 'Estructura',
    materia: 'Solo estructura',
    gancho: 'Protege el edificio.',
    tasa: { estructura: 0.0018, contenido: 0 },
    cubreContenido: false, sinDeducibleEn: [], asistencia: 'hogar',
    destacados: [
      ['Qué asegura', 'El edificio'],
      ['Incendio y sismo', 'Monto asegurado'],
      ['Robo del contenido', 'No incluido'],
      ['Asistencia', 'Hogar · 3 eventos']
    ]
  },
  {
    id: 'completo', nombre: 'Estándar · Estructura y contenido', corto: 'Completo',
    materia: 'Estructura y contenido', recomendado: true,
    gancho: 'Protege el edificio y tus cosas, con robo incluido.',
    tasa: { estructura: 0.0020, contenido: 0.0032 },
    cubreContenido: true, sinDeducibleEn: [], asistencia: 'hogar',
    destacados: [
      ['Qué asegura', 'Edificio y contenido'],
      ['Incendio y sismo', 'Monto asegurado'],
      ['Robo del contenido', 'Monto de contenido'],
      ['Asistencia', 'Hogar · 3 eventos']
    ]
  },
  {
    id: 'premium', nombre: 'Premium', corto: 'Premium',
    materia: 'Estructura y contenido',
    gancho: 'Sin deducible en cañerías, naturaleza y cristales. Asistencia SOS.',
    tasa: { estructura: 0.0025, contenido: 0.0042 },
    cubreContenido: true,
    /* Publicado en la ficha de Hogar Fácil Plus, textual. */
    sinDeducibleEn: ['Rotura de cañerías', 'Riesgos de la naturaleza', 'Rotura de cristales'],
    asistencia: 'sos',
    destacados: [
      ['Qué asegura', 'Edificio y contenido'],
      ['Deducible', 'Sin deducible en 3 coberturas'],
      ['Robo del contenido', 'Monto de contenido'],
      ['Asistencia', 'Hogar + SOS']
    ]
  }
];

export const planHogarPorId = id => PLANES_HOGAR.find(p => p.id === id) || PLANES_HOGAR[1];

/* ── COBERTURAS ──────────────────────────────────────────────────────
   Escritas en minúscula y sin abreviar. La tabla de referencia dice
   «DAÑOS MAT POR INC Y EXPLOS A CONS DIRECTA DE HUELGA» y repite tres veces la fila
   «DAÑOS MATERIALES POR ROBO», una por plan, con un guion en las otras
   dos. Eso no es una tabla de coberturas, es un volcado de la base.

   `base` dice de dónde sale el monto: 'estructura', 'contenido', un
   porcentaje de la estructura, o un tope fijo en UF. Los porcentajes
   salen de la tabla de referencia. `planes` dice en cuáles va. */
export const COBERTURAS_HOGAR = [
  { nombre: 'Incendio del edificio', base: 'estructura', codigo: 'POL 1 2026 0013',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Incendio del contenido', base: 'contenido', codigo: 'POL 1 2026 0013',
    planes: ['completo', 'premium'] },
  { nombre: 'Incendio por combustión espontánea', base: 'estructura', codigo: 'CAD 1 2016 0049',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Sismo — daños al edificio', base: 'estructura', codigo: 'CAD 1 2016 0064',
    planes: ['estructura', 'completo', 'premium'], exenta: true },
  { nombre: 'Sismo — daños al contenido', base: 'contenido', codigo: 'CAD 1 2016 0064',
    planes: ['completo', 'premium'], exenta: true },
  { nombre: 'Incendio a consecuencia de sismo', base: 'estructura', codigo: 'CAD 1 2016 0066',
    deducible: '1% del monto asegurado, con un mínimo de UF 25',
    planes: ['estructura', 'completo', 'premium'], exenta: true },
  { nombre: 'Riesgos de la naturaleza: viento, inundación, desbordamiento de cauces, aluviones, deslizamientos, peso de nieve, salida de mar y erupción volcánica',
    base: 'estructura', codigo: 'CAD 1 2016 0036 · 0037 · 0038 · 0039 · 0050',
    deducible: 'UF 2 en todo y cada evento cuando hay incendio a consecuencia de un fenómeno de la naturaleza (CAD 1 2016 0035)',
    planes: ['estructura', 'completo', 'premium'], sinDeduciblePremium: true },
  { nombre: 'Explosión', base: 'estructura', codigo: 'CAD 1 2016 0044',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Colapso del edificio', base: 'estructura', codigo: 'CAD 1 2016 0040',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Choque o colisión de vehículos contra la vivienda', base: 'estructura', codigo: 'CAD 1 2016 0052',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Daños causados por aeronaves', base: 'estructura', codigo: 'CAD 1 2016 0029',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Rotura de cañerías y daños por agua', base: 'estructura', codigo: 'CAD 1 2016 0059',
    deducible: 'UF 2 en todo y cada evento',
    planes: ['estructura', 'completo', 'premium'], sinDeduciblePremium: true },
  { nombre: 'Huelga, desorden popular, saqueo y actos terroristas', base: 'estructura',
    codigo: 'CAD 1 2016 0032 · 0033',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Robo con fuerza en las cosas', base: 'contenido', codigo: 'POL 1 2026 0013',
    deducible: '5% de la pérdida, con un mínimo de UF 5',
    planes: ['completo', 'premium'] },
  { nombre: 'Daños a la vivienda a consecuencia del robo', base: 'pct', pct: 0.10,
    codigo: 'POL 1 2026 0013', planes: ['completo', 'premium'] },
  { nombre: 'Daños a aparatos eléctricos y electrónicos', base: 'fijo', uf: 30,
    codigo: 'CAD 1 2016 0060', deducible: '10% de la pérdida, con un mínimo de UF 10',
    planes: ['completo', 'premium'] },
  { nombre: 'Responsabilidad civil familiar', base: 'fijo', uf: 500,
    codigo: 'POL 1 2026 0013 · Título Cuarto',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Rotura accidental de cristales', base: 'fijo', uf: 15,
    codigo: 'POL 1 2026 0013 · Título Tercero', deducible: 'UF 2 en todo y cada evento',
    planes: ['estructura', 'completo', 'premium'], sinDeduciblePremium: true },
  /* Vale para las dos puntas del arriendo: al dueño le cubre la renta que
     deja de recibir, y al arrendatario el alojamiento mientras la vivienda
     está inhabitable. Por eso se pregunta cuál de los dos es. */
  { nombre: 'Pérdida de entradas por arriendo', base: 'pct', pct: 0.06,
    codigo: 'CAD 1 2016 0045', planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Inhabitabilidad de la vivienda y bodegaje', base: 'pct', pct: 0.06,
    codigo: 'CAD 1 2016 0065', planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Demoliciones', base: 'pct', pct: 0.05, codigo: 'POL 1 2026 0013',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Remoción de escombros y traslado de muebles', base: 'pct', pct: 0.02,
    codigo: 'CAD 1 2016 0041', planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Asistencia Hogar — 3 eventos al RUT', base: 'marca', codigo: 'CAD 1 2026 0027',
    planes: ['estructura', 'completo', 'premium'] },
  { nombre: 'Asistencia SOS', base: 'marca', codigo: 'CAD 1 2026 0027', planes: ['premium'] }
];



/* ── ASISTENCIAS ─────────────────────────────────────────────────────
   Las tres son las de la ficha de Hogar Fácil Plus, con su contenido
   textual. La de Mascotas no se vende aquí: es el beneficio de
   bienvenida, y por eso vive abajo y no en la tabla. */
export const ASISTENCIAS = {
  hogar: {
    nombre: 'Asistencia Hogar', detalle: '3 eventos al RUT',
    servicios: ['Gasfitería', 'Electricidad', 'Cerrajería', 'Cristalería',
                'Mudanza', 'Custodia', 'Alojamiento y alimentación']
  },
  sos: {
    nombre: 'Asistencia SOS', detalle: 'Incluida en el Plan Premium',
    servicios: ['Limpieza de alfombras', 'Instalaciones de muros', 'Mantención de pisos',
                'Pintor de interiores', 'Instalaciones eléctricas', 'Instalaciones de gas y plomería']
  },
  mascotas: {
    nombre: 'Asistencia Mascotas', detalle: 'Según el plan contratado',
    servicios: ['Gastos veterinarios por accidente', 'Orientación médica veterinaria telefónica',
                'Conexión con clínicas veterinarias', 'Asistencia legal telefónica ilimitada',
                'Reembolso por hospitalización de la mascota por accidente',
                'Reembolso por hotelería en caso de viaje del dueño']
  }
};

/* ── REQUISITOS DE ASEGURABILIDAD ────────────────────────────────────
   Los siete están publicados en la ficha del producto. Son los que
   deciden si la vivienda se puede asegurar por este canal, y por eso
   el paso 2 los pregunta en vez de descubrirlos al emitir. */
export const REQUISITOS = [
  `Antigüedad máxima de ${ANTIGUEDAD_MAXIMA} años.`,
  'No construida, ni total ni parcialmente, en adobe.',
  'Ubicada en sector urbano.',
  'De ocupación permanente.',
  'No colindante a sitios, terrenos o predios abandonados, deshabitados o sin vigilancia.',
  'No declarada monumento nacional.',
  'Fuera de las zonas declaradas en conflicto étnico.',
  'Fuera de reservas y parques nacionales.',
  'No ubicada en una isla.',
  'A más de 100 metros de ríos, esteros, lagos u otros cursos de agua.',
  'A más de 200 metros de fábricas, industrias o instalaciones similares.',
  'Con una compañía de Bomberos a menos de 10 km.'
];

/* ── LA TARIFA ───────────────────────────────────────────────────────
   [SIMULACIÓN] Un solo lugar, igual que en auto. En producción esto es
   la llamada al motor de tarificación. */
export function primaAnualUF({ planId, estructura, contenido, materialId, tipoViviendaId,
                               anio, deducibleUF }) {
  const plan = planHogarPorId(planId);
  const conten = plan.cubreContenido ? Number(contenido || 0) : 0;

  const base = Number(estructura || 0) * plan.tasa.estructura
             + conten * plan.tasa.contenido;

  const factores = materialPorId(materialId).factor
                 * tipoViviendaPorId(tipoViviendaId).factor
                 * factorAnio(anio)
                 * deduciblePorUF(deducibleUF).factor;

  return base * factores;
}

/* ── LO QUE ESTE CANAL NO COTIZA ─────────────────────────────────────
   Vacacional, Rural e Hipotecario son planes reales de Hogar Fácil Plus
   y necesitan suscripción distinta. Declararlo es mejor que cotizarlos
   mal: es lo mismo que hace el asesor de auto con los casos
   particulares. */
export const DERIVACIONES = {
  vacacional: 'Este canal asegura la vivienda donde vives todo el año. Para una segunda vivienda o una casa de veraneo corresponde el plan Vacacional, que se cotiza con un ejecutivo.',
  rural: 'Este canal asegura viviendas en sector urbano. Para una vivienda rural corresponde el plan Rural, que se cotiza con un ejecutivo.',
  antigua: `Este canal asegura viviendas de hasta ${ANTIGUEDAD_MAXIMA} años. Con más antigüedad, un ejecutivo revisa el caso.`,
  adobe: 'Las construcciones de adobe, completas o en una parte, están excluidas de esta póliza. Un ejecutivo revisa qué alternativa hay.',
  isla: 'Las viviendas ubicadas en islas quedan fuera de esta póliza. Un ejecutivo revisa el caso.'
};

/* ── QUÉ VIVIENDA ENTRA POR ESTE CANAL ───────────────────────────────
   El cotizador de la compañía abre con un muro de doce condiciones y un
   botón «Sí, cumplo con todos estos requisitos». Ese botón no sirve de
   nada: nadie lee doce viñetas para llegar a un precio, y una
   declaración que no se leyó no es una declaración. El artículo 524 del
   Código de Comercio pide que el asegurado declare sinceramente lo que
   se le pregunta; para eso la pregunta tiene que poder contestarse.

   Acá las doce se reparten en tres grupos:

   DEDUCIDAS — el sistema ya tiene la respuesta y no pregunta nada.
     · antigüedad máxima de 75 años          ← el año de construcción
     · zona declarada en conflicto étnico    ← la comuna
     · ubicación en isla                     ← la comuna
     · bomberos a menos de 10 km             ← comuna urbana
     · construcción en adobe                 ← el material

   PREGUNTADAS EN EL PASO DE LA VIVIENDA — cambian el resultado, así que
   se preguntan antes del precio y no después.
     · uso permanente     → si no, es Vacacional y va a ejecutivo
     · sector urbano      → si no, es Rural y va a ejecutivo

   DECLARADAS EN LA CONFIRMACIÓN — no cambian el precio y solo las sabe
   la persona. Van donde se revisa todo lo demás, que es donde de verdad
   se firma una propuesta.
     · colindancia con sitio abandonado
     · monumento nacional, reserva o parque
     · distancia a cursos de agua y a industrias */

/* Definición real de ocupación permanente: la vivienda pasa desocupada
   noventa días al año como máximo. Decir el número evita la discusión
   de qué es «vivir ahí»; quien veranea tres semanas sabe que cumple. */
export const OCUPACION_MAX_DIAS = 90;

/* Los tres usos. El cotizador de la compañía los pone de entrada como
   tres productos a elegir —«¿Qué producto quieres cotizar?»—, que es
   preguntarle a la persona por nuestro catálogo. Acá se le pregunta por
   su vida: cómo usa la vivienda. La respuesta decide lo mismo, y además
   deja medido cuánta demanda se está derivando, que es el dato con el
   que se decide si abrir Vacacional y Rural por este canal. */
export const USOS = [
  { id: 'permanente', rotulo: 'Vivo aquí todo el año',
    detalle: `Desocupada ${OCUPACION_MAX_DIAS} días al año como máximo`, cotiza: true },
  { id: 'vacacional', rotulo: 'Es mi segunda vivienda',
    detalle: 'Casa de veraneo o de fin de semana', cotiza: false, deriva: 'vacacional' },
  { id: 'rural', rotulo: 'Está en sector rural',
    detalle: 'Fuera del radio urbano', cotiza: false, deriva: 'rural' }
];

export const usoPorId = id => USOS.find(u => u.id === id) || USOS[0];

/* Chiloé entra en la lista de comunas y es isla. Sin esto se cotizaría
   y el problema saldría al emitir. */
export const COMUNAS_ISLA = ['Castro'];
export const esIsla = comuna => COMUNAS_ISLA.includes(comuna);

/* Las comunas declaradas en conflicto étnico por la política de
   suscripción: Tirúa, Santa Bárbara, Quilaco, Mulchén, Collipulli,
   Ercilla, Victoria, Traiguén, Vilcún, Galvarino, Lumaco y Purén.
   Ninguna está entre las 88 que cotiza este canal, así que la condición
   se cumple sola y no se le pregunta a nadie. Queda escrita porque el
   día que se amplíe la lista de comunas hay que mirarla. */
export const COMUNAS_CONFLICTO = [
  'Tirúa', 'Santa Bárbara', 'Quilaco', 'Mulchén', 'Collipulli', 'Ercilla',
  'Victoria', 'Traiguén', 'Vilcún', 'Galvarino', 'Lumaco', 'Purén'
];

/* Las tres que se declaran en la confirmación. `afirmativa` es lo que la
   persona está diciendo que sí; redactadas en positivo porque una
   declaración en negativo —«no colinda con…»— se marca sin leer. */
export const DECLARACIONES = [
  { id: 'colindancia',
    afirmativa: 'La vivienda no colinda con un sitio, terreno o predio abandonado, deshabitado o sin vigilancia.' },
  { id: 'patrimonio',
    afirmativa: 'La vivienda no es monumento nacional ni está dentro de una reserva o un parque nacional.' },
  { id: 'distancias',
    afirmativa: 'La vivienda está a más de 100 metros de ríos, esteros, lagos u otros cursos de agua, y a más de 200 metros de fábricas o industrias.' }
];

/* ── QUÉ NO CUBRE ────────────────────────────────────────────────────
   Van en la pantalla de planes, junto a lo que sí cubre. Esconder las
   exclusiones hasta la póliza es lo que produce el reclamo: la persona
   creyó que las joyas estaban cubiertas porque nadie le dijo que no. */
export const EXCLUSIONES = [
  'Metales preciosos, perlas, joyas y piedras preciosas; obras de arte y piezas de colección; instrumentos de precisión; armas; bicicletas, motos y vehículos; dinero, cheques y documentos; animales.',
  'Los cimientos y los pretiles de piedra del edificio.',
  'Los objetos robados o hurtados durante el incendio o después de él.',
  'Los contenidos e instalaciones al aire libre que no estén diseñados para estar a la intemperie.',
  'Los contenidos e instalaciones en mal estado de conservación o con mantención inadecuada.',
  'Toda clase de animales.',
  'Las demás exclusiones indicadas en las condiciones generales y no incluidas expresamente en la póliza.'
];

/* ── CÓMO SE INDEMNIZA ───────────────────────────────────────────────
   Dos definiciones que deciden cuánto se recibe en un siniestro y que
   normalmente aparecen recién en la póliza, cuando ya no se pueden
   comparar. Primera pérdida y reposición a nuevo son, de hecho, lo
   mejor que tiene este producto: conviene decirlas antes de cobrar. */
export const DEFINICIONES = [
  { titulo: 'A primera pérdida',
    texto: 'Ante un siniestro cubierto, la compañía paga la reconstrucción, reparación o reposición de lo asegurado hasta el monto asegurado, sin aplicar infraseguro. Si aseguraste por menos de lo que vale, igual te pagan lo que perdiste hasta ese tope.' },
  { titulo: 'Reposición a nuevo',
    texto: 'Se repone sin descontar depreciación por uso ni antigüedad, siempre que el monto asegurado corresponda al valor de reposición a nuevo. Si el monto quedó bajo ese valor, la pérdida queda afecta a depreciación y prorrateo.' },
  { titulo: 'Riesgo habitacional',
    texto: `Casas y departamentos destinados a vivienda. No son riesgo habitacional las oficinas, los locales comerciales ni los centros comerciales. La vivienda de ocupación permanente es la que pasa desocupada ${OCUPACION_MAX_DIAS} días al año como máximo.` },
  { titulo: 'Qué es el monto asegurado',
    texto: 'Es el valor que decides proteger y el máximo que pagará la compañía ante un siniestro cubierto. En una casa corresponde al costo de reconstrucción; en un departamento, al valor comercial.' }
];

/* ── EL DESGLOSE DE LA PRIMA ─────────────────────────────────────────
   La prima de seguros está afecta a IVA, con una excepción: las que
   cubren riesgo de sismo y de incendio originado en sismo están exentas
   (DL 825, artículo 12 letra E, N°4). Por eso la cotización se parte en
   tres líneas y no en una.

   El precio que se muestra en todo el sitio es el total que se paga, con
   el IVA adentro —como se muestra un precio en Chile—. Este desglose lo
   abre hacia atrás, no lo suma encima: nada cambia de valor por mostrarlo.

   [SIMULACIÓN] en el porcentaje exento. En producción lo entrega el
   motor de tarificación, que tarifica el sismo por separado; el reparto
   de acá es una proporción declarada para que el documento tenga las
   tres líneas que debe tener. */
export const IVA = 0.19;
export const PCT_PRIMA_EXENTA = 0.28;

export function desglosePrima(totalUF) {
  const total = Number(totalUF) || 0;
  const exenta = total * PCT_PRIMA_EXENTA;
  const conIva = total - exenta;
  const afecta = conIva / (1 + IVA);
  return { afecta, exenta, iva: conIva - afecta, total };
}

/* ── LA COTIZACIÓN ───────────────────────────────────────────────────
   Número y vigencia. Las dos cosas sirven para lo mismo: que la persona
   pueda volver. El número le da algo que nombrar al llamar, y la
   vigencia le pone fecha al mensaje de recuperación —«tu cotización
   N° 4172 vence el 22»— en vez de un «no olvides terminar». */
export const VALIDEZ_COTIZACION_DIAS = 15;

/* Estable por RUT: la misma persona ve siempre el mismo número, de modo
   que el mensaje de WhatsApp y la pantalla coinciden. */
export function numeroCotizacion(rut) {
  let h = 0;
  for (const c of String(rut || '')) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return 'HD-' + String(100000 + (h % 899999));
}

export function venceEl(desde = new Date()) {
  const d = new Date(desde);
  d.setDate(d.getDate() + VALIDEZ_COTIZACION_DIAS);
  return d;
}

/* ── LO QUE LA LEY OBLIGA A DECIR ────────────────────────────────────
   Textual. No se redacta de nuevo ni se resume: son transcripciones, y
   una paráfrasis de un derecho legal es un derecho distinto. */
export const AVISOS = {
  oferta: 'Oferta dirigida a personas ubicadas en el territorio nacional. Condiciones generales depositadas en la Comisión para el Mercado Financiero, www.cmfchile.cl',

  tarificacion: 'Esta prima corresponde a la tarificación para el día de hoy y tiene una vigencia anual.',

  uf: 'La prima en pesos se muestra al valor de la UF del día de hoy.',

  retracto: 'En los contratos de seguro celebrados a distancia, el contratante o asegurado tendrá la facultad de retractarse dentro del plazo de diez días hábiles, contado desde que reciba la póliza, sin expresión de causa ni cargo alguno, teniendo el derecho a la devolución de la prima que hubiere pagado. Este derecho no podrá ser ejercido si se hubiere verificado un siniestro, ni en el caso de los contratos de seguro cuyos efectos terminen antes del plazo señalado.',

  autorregulacion: 'La compañía está adherida al Código de Autorregulación de las compañías de seguros y sujeta al compendio de buenas prácticas corporativas, disponible en www.aach.cl. Acepta además la intervención del Defensor del Asegurado, ante quien se pueden presentar reclamos a través de www.ddachile.cl.',

  reclamos: 'Conforme a la Circular N° 2131 de la Comisión para el Mercado Financiero, toda presentación, consulta o reclamo se responde en el plazo más breve posible y nunca después de 20 días hábiles contados desde su recepción. Ante disconformidad o demora, se puede recurrir a la CMF, Área de Protección al Inversionista y Asegurado, Av. Libertador Bernardo O’Higgins 1449, piso 1, Santiago, o en www.cmfchile.cl'
};

export { UF, pesos, ufTxt };
