// @ts-check
/**
 * Catálogo del mini sitio · productos, servicios, promociones y secciones.
 *
 * Ningún DOM aquí: es la única fuente de contenido. Portada, menús, páginas
 * de producto, marcos de integración y configuración leen de este archivo.
 * Si cada pantalla tuviera su copia, algún día dirían cosas distintas.
 *
 * PROCEDENCIA (leer antes de cambiar un texto)
 * 1. Productos, coberturas, precios «desde», condiciones y preguntas:
 *    páginas oficiales de zurich.cl leídas el 9 de octubre de 2026. REAL.
 *    No se redactaron coberturas, beneficios, precios ni condiciones nuevas
 *    (criterio editorial del brief). Lo único escrito aquí es el orden y los
 *    titulares de sección.
 * 2. Textos de portada, acceso, alianza y llamados a la acción: brief
 *    «Propuesta de contenidos Zurich–BICE», octubre 2026.
 * 3. `porValidar`: lo que el brief pide confirmar antes de publicar, más los
 *    hallazgos de la lectura de las fuentes. Aparece en Configuración.
 * 4. `formulario`: la dirección que es SOLO el formulario o el flujo, sin la
 *    página de producto alrededor (menú, fotos y pie de zurich.cl). Es lo que
 *    se carga dentro del sitio. Encontradas y revisadas el 9 de octubre de
 *    2026: ninguna trae `X-Frame-Options` ni `frame-ancestors` (salvo
 *    soap.zurich.cl, que no se pudo revisar). Donde no hay `formulario`, el
 *    marco queda en vista referencial: cargar la página completa del producto
 *    taparía la propuesta con la navegación de zurich.cl.
 */

export const FECHA_FUENTES = '9 de octubre de 2026';

export const ENTIDADES = {
  generales: 'Zurich Chile Seguros Generales S.A.',
  vida: 'Zurich Chile Seguros de Vida S.A.',
};

export const TELEFONO_ZURICH = { visible: '600 600 9090', enlace: 'tel:6006009090' };

/** @typedef {'digital'|'asesoria'} Modalidad */

export const RAMOS = [
  {
    id: 'auto', nombre: 'Auto', ruta: '/personas/auto/', icono: 'auto', foto: 'auto-blanco',
    bajada: 'Seguros para tu auto que puedes cotizar y contratar en línea.',
  },
  {
    id: 'hogar', nombre: 'Hogar', ruta: '/personas/hogar/', icono: 'casa', foto: 'hogar-familia-living',
    bajada: 'Protección para tu vivienda y asistencias para el día a día.',
  },
  {
    id: 'vida-y-salud', nombre: 'Vida y salud', ruta: '/personas/vida-y-salud/', icono: 'corazon', foto: 'vida-familia-playa',
    bajada: 'Seguros para cuidar tu salud y proteger a tu familia.',
  },
  {
    id: 'bienes-y-viaje', nombre: 'Bienes y viaje', ruta: '/personas/bienes-y-viaje/', icono: 'celular', foto: 'viaje-mujer-montana',
    // Texto oficial de zurich.cl/bienes-y-viaje
    bajada: 'Con Zurich, la seguridad te acompaña estés donde estés.',
  },
];

/** Los siete mundos del programa de fidelización · zurich.cl/mundo-zurich */
export const MUNDOS = [
  { nombre: 'Mundo Salud', texto: 'Telemedicina, especialistas y orientación para cuidar tu salud y la de tu familia.' },
  { nombre: 'Mundo Mascotas', texto: 'Veterinario online y servicios para cuidar la salud y bienestar de tus mascotas.' },
  { nombre: 'Mundo Bienestar', texto: 'Yoga, entrenador personal y asesorías para cuidar tu bienestar físico y mental.' },
  { nombre: 'Mundo Movilidad', texto: 'Mantención para bicicletas que te ayuda a seguir siempre en movimiento.' },
  { nombre: 'Mundo Viajes', texto: 'Asistencia en viajes para que disfrutes de tus aventuras con mayor tranquilidad.' },
  { nombre: 'Mundo Hogar', texto: 'Armado de muebles y otros servicios para ayudarte en las tareas de tu hogar.' },
  { nombre: 'Mundo Finanzas', texto: 'Cotizadores de servicios médicos y beneficios para invertir con menores costos.' },
];

export const MUNDO_ZURICH = {
  id: 'mundo-zurich',
  nombre: 'Mundo Zurich',
  ruta: '/mundo-zurich/',
  referencia: 'https://www.zurich.cl/mundo-zurich',
  foto: 'mundo-familia-parque',
  bajada: 'Por contratar tu seguro, tienes acceso a Mundo Zurich, nuestro programa de fidelización, donde encontrarás beneficios y servicios exclusivos sin costo para ti y tu familia.',
  acceso: 'Ingresa desde tu Portal de Cliente con tu RUT y clave.',
  legal: 'Mundo Zurich es un programa o plataforma de fidelización de las Compañías de Seguros del grupo Zurich, a través del cual se entregan distintos tipos de beneficios a los asegurados que se han incorporado y aceptado los términos y condiciones de Mundo Zurich. El acceso se encuentra restringido a aquellos clientes titulares con seguros vigentes en la Compañía. Dada la naturaleza de Mundo Zurich, los beneficios que se entregan son de carácter temporal y pueden ser suprimidos, sustituidos, modificados o eliminados. Este programa de fidelización no forma parte de la póliza que se contrata.',
  porValidar: [
    'El brief deja Mundo Zurich «por definir». Se usa el contenido oficial de zurich.cl/mundo-zurich.',
    'El acceso a los beneficios es desde el Portal de Clientes, que está fuera del alcance inicial.',
  ],
};

/* ------------------------------------------------------------------------ */
/* Bases oficiales de campañas vigentes (texto literal de zurich.cl)        */
/* ------------------------------------------------------------------------ */
const BASES_ZURICH_DAYS = 'Bases «Campaña Zurich Days Auto Digital 2 cuotas gratis + gift card» (*) La Compañía que asume el riesgo es Zurich Chile Seguros Generales S.A. Campaña válida sólo para Pólizas de Seguro Auto Digital contratadas en www.zurich.cl entre los días 01 de octubre de 2026 al 10 de octubre de 2026. Cuotas liberadas de pago corresponden a la N°3 y N°6, manteniendo al día las cuotas 1, 2, 4 y 5. La gift card Apprecio (1 por cliente) de $60.000 será entregada a más tardar el 30 de noviembre de 2026. El detalle de las condiciones del seguro, sus coberturas, exclusiones y otras características se encuentran detalladas en sus Condiciones Particulares y en las Condiciones Generales inscritas en la CMF bajo el código POL120160279. Productos adheridos, condiciones, exclusiones y bases de la campaña disponibles en www.zurich.cl.';

const BASES_SUPERMERCADO = 'Bases Concurso «Año de supermercado» (1) Riesgo asegurado por Zurich Chile Seguros de Vida S.A. Detalle del seguro (requisitos de asegurabilidad, coberturas, exclusiones, limitaciones, prima y otras características) en sus condiciones generales y adicionales depositadas en la CMF bajo los códigos POL320180108, CAD320250142, CAD320250201, POL220150684, POL220250140, CAD320230450, CAD320250146, CAD320230403, CAD320250201, CAD220130775, CAD220130772, CAD220130767, CAD220130766, CAD220130765, CAD220130763, CAD220130762, CAD220130761, POL220260009, CAD320230468, CAD320230469, CAD320250171, CAD320240153 y en sus condiciones particulares. Campaña comercial aplica solo a pólizas de Protección Familiar, Protección Urgencias y Oncológico Familiar contratadas entre el 21 de septiembre y 30 de noviembre de 2026 cumpliendo requisitos de las bases publicadas en zurich.cl';

const CONCURSO_SUPERMERCADO = {
  id: 'ano-de-supermercado',
  etiqueta: 'Concurso',
  titulo: 'Contrata y participa por 1 de los 12 premios de un año de supermercado',
  detalle: 'Equivalente a $300.000 mensuales (1).',
  desde: '2026-09-21',
  hasta: '2026-11-30',
  bases: BASES_SUPERMERCADO,
};

/* ------------------------------------------------------------------------ */
/* Productos                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Orden de cada página de producto (brief §Modelo para las páginas de
 * producto), con una sola licencia de lógica promocional: el precio o la
 * promoción suben a la cabecera, junto al nombre, porque es el dato que
 * decide si la persona sigue leyendo. El resto respeta el orden del brief:
 * descripción → beneficios → coberturas → antes de contratar (exclusiones y
 * requisitos) → precio → documentación → llamado → continuación.
 */
export const PRODUCTOS = [
  {
    id: 'auto-digital',
    nombre: 'Seguro de Auto Digital',
    corto: 'Auto Digital',
    ramo: 'auto',
    modalidad: /** @type {Modalidad} */ ('digital'),
    ruta: '/personas/auto/auto-digital/',
    referencia: 'https://www.zurich.cl/seguros-auto/auto-digital',
    foto: 'auto-familia-viaje',
    icono: 'auto',
    entidad: ENTIDADES.generales,
    tarjeta: 'Conoce el producto y comienza tu cotización.',
    cta: 'Cotizar Seguro de Auto Digital',
    bajada: 'Tranquilidad, ahorro y comodidad en un solo plan, pensado para que cotices y contrates tu seguro de auto sin filas ni trámites presenciales.',
    gancho: { etiqueta: 'Zurich Days', valor: '2 cuotas gratis + gift card de $60.000*', nota: 'Contrata 100% online con vigencia de 24 meses. Válido hasta el 10 de octubre de 2026.' },
    ganchoBase: { etiqueta: '100% online', valor: 'Cotiza y contrata sin filas', nota: 'Planes Básico, Estándar y Premium.' },
    promocion: {
      id: 'zurich-days',
      etiqueta: 'Oferta del mes',
      titulo: '2 cuotas gratis + gift card de $60.000',
      detalle: 'Contrata 100% online tu seguro con vigencia 24 meses y obtén las cuotas 3 y 6 gratis más $60.000 en una gift card Apprecio.',
      desde: '2026-10-01',
      hasta: '2026-10-10',
      boton: 'Conocer oferta',
      bases: BASES_ZURICH_DAYS,
    },
    beneficios: [
      { icono: 'escudo', titulo: 'Tranquilidad', texto: 'Te respaldamos ante robo, daños materiales y responsabilidad civil.' },
      { icono: 'ahorro', titulo: 'Ahorro', texto: 'Accede sin costo a beneficios exclusivos al contratar tu seguro de auto.' },
      { icono: 'celular', titulo: 'Comodidad', texto: 'Asegura tu auto de forma 100% online, fácil y rápido donde estés.' },
    ],
    coberturas: {
      titulo: 'Principales coberturas por plan',
      columnas: ['Plan Básico', 'Plan Estándar', 'Plan Premium'],
      filas: [
        ['Daños a tu auto', true, true, true],
        ['Pérdida total por robo o daños', true, true, true],
        ['Responsabilidad civil (daño emergente, lucro cesante y daño moral)', 'UF 500', 'UF 1.000', 'UF 1.500'],
        ['Robo de accesorios', true, true, true],
        ['Deducible inteligente', true, true, true],
        ['Daños materiales a conductores dependientes', true, true, true],
        ['Defensa penal y constitución de fianzas', true, true, true],
        ['Asiento de pasajeros por muerte accidental, incapacidad total y permanente y gastos médicos', true, true, true],
        ['Daños materiales causados por la propia carga', true, true, true],
        ['Daños al vehículo durante viaje al extranjero', false, false, true],
        ['Daños causados por conductor dependiente', false, false, true],
        ['Aspiración de agua', false, false, true],
        ['Asistencia', 'Básica', 'Básica', 'Full'],
        ['Taller', 'Multimarca', 'Marca', 'Marca'],
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: [
        'Si tu auto es nuevo —factura de primera compra emitida hace no más de 48 horas al contratar— no necesitas inspeccionarlo.',
        'En cualquier otro caso, la inspección la haces desde tu celular con el enlace que te enviamos por WhatsApp.',
        'Vehículos nuevos: las coberturas comienzan desde el momento de la contratación. Vehículos usados: se activan una vez que la autoinspección es aprobada por la Compañía.',
      ],
      condiciones: [
        'El deducible es el dinero que la compañía no indemniza en caso de siniestro: si tu deducible es $100.000 y la reparación cuesta $180.000, la compañía paga $80.000.',
        'En caso de pérdida total debes pagar todas las cuotas que resten hasta cumplir la vigencia de la póliza para recibir la indemnización.',
        'La cobertura fuera del país aplica solo si tu póliza incluye «Daños en viaje al extranjero» (Plan Premium).',
      ],
    },
    precio: 'El valor de tu seguro depende de las características de tu vehículo y del plan que elijas: Básico, Estándar o Premium. Puedes cotizar 100% online y revisar el precio asociado a tu cotización antes de contratar.',
    documentos: ['Condiciones Generales inscritas en la CMF bajo el código POL120160279.'],
    preguntas: [
      { p: '¿Cómo activo mi seguro en caso de accidente?', r: ['Si existen solo daños materiales, da aviso a la compañía dentro de los 10 días corridos desde que ocurrió el siniestro. Si hay otros autos involucrados, anota marca, modelo, patente, nombre y RUT del conductor, teléfono y correo de contacto.', 'En caso de robo, hurto o lesiones a personas, realiza de inmediato la denuncia en Carabineros y da aviso a la Compañía por el formulario en línea, llamando al 600 600 9090 o en cualquiera de las sucursales.'] },
      { p: '¿Qué es la inspección y para qué sirve?', r: ['Es el proceso que permite establecer el estado en que se encuentra tu vehículo al momento de contratar el seguro y establecer las coberturas, excluyendo así los daños que se constaten durante la inspección.'] },
      { p: '¿Cómo solicito una asistencia?', r: ['Para solicitar una asistencia de Auto solo debes llamar al proveedor del servicio. El número de tu asistencia también aparece en tu póliza, que puedes descargar desde el Portal de Clientes.'] },
    ],
    flujo: {
      titulo: 'Cotiza tu Seguro de Auto Digital',
      ruta: '/personas/auto/cotizador/auto-digital/datos/',
      pasos: ['datos', 'vehiculo', 'planes', 'confirmacion', 'pago', 'listo'],
      etiquetas: ['Tus datos', 'Tu vehículo', 'Planes', 'Confirmación', 'Pago', 'Listo'],
      referencia: 'https://www.zurich.cl/seguros-auto/auto-digital',
      previa: [
        { etiqueta: 'RUT', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
        { etiqueta: 'Nombre y apellido', tipo: 'text' },
        { etiqueta: 'Correo electrónico', tipo: 'email' },
        { etiqueta: 'Celular', tipo: 'tel', ayuda: '+56 9' },
      ],
      necesitas: ['Tu RUT y datos de contacto.', 'La patente de tu auto.', 'Tu celular a mano: si el auto es usado, la inspección se hace desde ahí.'],
    },
    porValidar: [
      'Vigencia y condiciones de «Zurich Days» para clientes de Banco BICE: las bases oficiales dicen 2 cuotas gratis (N°3 y N°6) + gift card $60.000, del 1 al 10 de octubre de 2026. La página del producto dice «3 cuotas gratis»: se usó lo que dicen las bases.',
      'Dirección del cotizador sin la página del producto alrededor (versión para marco): no es pública. Las cabeceras de zurich.cl permiten cargarse dentro de otro sitio (revisado el 9 de octubre de 2026).',
      'Enlace a la ficha del producto (zurich.cl lo publica, la URL no está en el brief).',
    ],
  },

  {
    id: 'soap',
    nombre: 'Seguro SOAP 2026',
    corto: 'SOAP 2026',
    ramo: 'auto',
    modalidad: /** @type {Modalidad} */ ('digital'),
    ruta: '/personas/auto/soap/',
    referencia: 'https://www.zurich.cl/seguros-auto/soap',
    foto: 'soap-ruta',
    icono: 'documento',
    entidad: '',
    tarjeta: 'Contrata 100% online, en pocos pasos y a un precio único.',
    cta: 'Contratar SOAP 2026',
    bajada: 'Contrata 100% online, en pocos pasos y a un precio único. Seguro exigido para poder circular en territorio nacional.',
    gancho: { etiqueta: 'Precio online', valor: 'Desde $5.690*', nota: 'Vigencia desde el 01 de abril 2026 hasta el 31 de marzo 2027.' },
    promocion: {
      id: 'soap-destacado',
      etiqueta: 'Producto destacado',
      titulo: 'Tu SOAP 2026 desde $5.690*',
      detalle: 'Contrata 100% online, en pocos pasos y a un precio único.',
      desde: '2026-04-01',
      hasta: '2027-03-31',
      boton: 'Ver SOAP',
      bases: '(*) Precios válidos para venta online. Vigencia desde el 01 de abril 2026 hasta el 31 de marzo 2027. Venta exclusiva para automóviles livianos particulares y comerciales que no sean utilizados para el transporte de pasajeros. De acuerdo con lo dispuesto en el Capítulo II numeral 2 de la Circular 1459 de la CMF, los precios listados son meramente referenciales.',
    },
    beneficios: [
      { icono: 'salud', titulo: 'Gastos hospitalarios y médicos', texto: 'Cubre hasta 600 UF por persona afectada.' },
      { icono: 'escudo', titulo: 'Incapacidad permanente', texto: 'Hasta 400 UF por persona en caso de incapacidad parcial y 600 UF en caso de incapacidad total.' },
      { icono: 'corazon', titulo: 'Fallecimiento accidental', texto: 'Cubre 600 UF por cada fallecido.' },
    ],
    coberturas: {
      titulo: '¿Qué cubre el SOAP?',
      lista: [
        'Fallecimiento accidental, incapacidad permanente y gastos médicos producto de lesiones sufridas a consecuencia de accidentes de tránsito en que intervenga el vehículo asegurado, sus remolques o sus cargas.',
        'Los gastos médicos comprenden atención prehospitalaria, transporte sanitario, hospitalización, atención médica y quirúrgica, dental, prótesis e implantes, gastos farmacéuticos y rehabilitación de las víctimas.',
        'Cubre al conductor, a las personas transportadas en el vehículo asegurado y a cualquier tercero afectado en el accidente.',
        'Con la Ley Jacinta, las pólizas contratadas desde el 9 de febrero de 2026 cubren UF 600 por muerte, UF 600 por incapacidad permanente total, hasta UF 400 por incapacidad permanente parcial y hasta UF 600 en gastos médicos.',
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: [
        'Ten a mano la patente de tu vehículo.',
        'Venta exclusiva para automóviles livianos particulares y comerciales que no sean utilizados para el transporte de pasajeros.',
      ],
      condiciones: [
        'El SOAP no cubre los daños materiales causados al vehículo.',
        'Una vez contratado el seguro no es posible modificar los datos, salvo que así lo disponga una sentencia judicial (artículo 5° de la Ley N° 18.490 y Dictamen 7.778 de la CMF).',
        'La vigencia es de un año, excepto en el caso de vehículos nuevos o usados que no cuenten con su certificado al día.',
      ],
    },
    precio: 'Precio único para venta online, desde $5.690. Los precios son meramente referenciales (Circular 1459 de la CMF).',
    documentos: ['SOAP: seguro obligatorio de accidentes personales exigido por la Ley 18.490.'],
    preguntas: [
      { p: '¿Cómo obtengo una copia de mi póliza SOAP?', r: ['Puedes consultar o reimprimir tu póliza en soap.zurich.cl/soap/reimpresion.'] },
      { p: '¿Cuáles son los plazos para cobrar el SOAP?', r: ['Un año a contar de la fecha del accidente o de la muerte del afectado. En caso de incapacidad permanente, un año desde la fecha de emisión del certificado médico.'] },
      { p: '¿Cambia la obligatoriedad del SOAP con la Ley Jacinta?', r: ['No. El SOAP sigue siendo obligatorio para todos los vehículos motorizados y es requisito para obtener o renovar el permiso de circulación. La Ley Jacinta aumenta coberturas y reduce de 10 a 7 días el plazo de pago de la indemnización por fallecimiento.'] },
    ],
    flujo: {
      titulo: 'Contrata tu SOAP 2026',
      ruta: '/personas/auto/cotizador/soap/patente/',
      pasos: ['patente', 'datos', 'pago', 'listo'],
      etiquetas: ['Patente', 'Tus datos', 'Pago', 'Listo'],
      referencia: 'https://www.zurich.cl/seguros-auto/soap',
      // Portal de compra del SOAP: arranca pidiendo la patente.
      formulario: 'https://soap.zurich.cl/',
      previa: [{ etiqueta: 'Ingresa tu patente', tipo: 'text', ayuda: 'Ej.: ABCD12' }],
      necesitas: ['La patente de tu vehículo.', 'Un medio de pago para la contratación online.'],
    },
    porValidar: [
      'Precio «desde» y vigencia para clientes de Banco BICE.',
      'El portal de compra soap.zurich.cl se carga dentro del sitio, pero no se pudo confirmar que lo permita: su filtro de seguridad bloqueó la revisión. Probarlo en el navegador; si no carga, se vuelve a la vista referencial en Configuración.',
      'Pasarela de pago del SOAP: si lleva a un dominio que no es de Zurich, ese paso no carga dentro del marco.',
    ],
  },

  {
    id: 'celular-protegido',
    nombre: 'Seguro Celular Protegido',
    corto: 'Celular Protegido',
    ramo: 'bienes-y-viaje',
    modalidad: /** @type {Modalidad} */ ('digital'),
    ruta: '/personas/bienes-y-viaje/celular-protegido/',
    referencia: 'https://www.zurich.cl/bienes-y-viaje/celular-protegido',
    foto: 'celular-mujer',
    icono: 'celular',
    entidad: '',
    tarjeta: 'Reparación o reemplazo si tu celular sufre daño accidental o es robado.',
    cta: 'Cotizar Seguro Celular Protegido',
    bajada: 'La protección que tu equipo necesita, con coberturas de reparación o reemplazo para que sigas conectado sin interrupciones.',
    gancho: { etiqueta: 'Seguro de temporada', valor: 'Desde $29.990*', nota: 'Valor referencial. Ver condiciones al pie.' },
    promocion: {
      id: 'celular-temporada',
      etiqueta: 'Promoción de temporada',
      titulo: 'Protege tu celular desde $29.990*',
      detalle: 'Contrata 100% online y protege tu equipo en caso de robo o daño accidental.',
      desde: '2026-07-09',
      hasta: '',
      boton: 'Conocer seguro',
      bases: 'Seguro Celular Protegido: (*) Valor referencial en $ a la UF del día 09/07/2026 por $40.845. Referencia válida para IPhone 17 256 GB / Black, deducible 20%, vigencia 12 meses, plan básico.',
    },
    beneficios: [
      { icono: 'escudo', titulo: 'Tranquilidad', texto: 'Si tu celular sufre daño accidental o es robado, lo reparamos o reemplazamos.' },
      { icono: 'ajustes', titulo: 'Flexibilidad', texto: 'Elige el plan y las coberturas que mejor se adapten a tus necesidades y sigue conectado.' },
      { icono: 'estrella', titulo: 'Beneficios', texto: 'Al contratar, accede a Mundo Zurich para disfrutar de beneficios exclusivos.' },
    ],
    coberturas: {
      titulo: 'Coberturas de tu seguro',
      columnas: ['Plan Básico', 'Plan Estándar', 'Plan Premium'],
      filas: [
        ['Daño parcial o total', true, false, true],
        ['Robo', false, true, true],
      ],
    },
    pasosPrevios: {
      titulo: 'Antes de cotizar tu seguro para el celular',
      bajada: 'El proceso es sencillo y te acompañamos paso a paso. Ten listo esto:',
      pasos: [
        { titulo: 'Modelo y versión', texto: 'Marca, modelo y capacidad de memoria. Lo encuentras en Ajustes > Acerca del teléfono, en la caja o en la factura.' },
        { titulo: 'El celular contigo', texto: 'La inspección se hace desde el equipo que quieres asegurar: encendido, con batería, internet y cámara funcionando.' },
        { titulo: 'Número de IMEI', texto: 'Marca *#06# y aparecerá en pantalla. Son 15 dígitos, sin espacios.' },
        { titulo: 'Cédula de identidad', texto: 'Se solicita el número de serie para validar tu identidad y que eres mayor de 18 años.' },
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: ['Ser mayor de 18 años.', 'Tener el equipo contigo para la inspección desde el mismo celular.'],
      condiciones: [
        'El monto asegurado es el valor comercial que tiene tu celular en el momento del siniestro.',
        'Se cubren daños accidentales que afecten el funcionamiento del equipo, excepto aquellos por uso normal, desgaste o falta de uso.',
        'En caso de daño accidental total o robo con violencia, intimidación o por sorpresa, recibirás un equipo reacondicionado equivalente en marca, modelo y características.',
        'Este seguro no tiene período de carencia: puedes usar tus coberturas desde el momento en que contratas.',
      ],
    },
    precio: 'Valor referencial desde $29.990*, calculado para un iPhone 17 256 GB, deducible 20%, vigencia 12 meses y plan básico. El precio final depende del equipo y del plan.',
    documentos: [],
    preguntas: [
      { p: '¿Qué hago en caso de robo o daño de mi celular?', r: ['Ingresa los datos del asegurado, selecciona el tipo de siniestro y la fecha, completa la información, relata lo ocurrido y carga los documentos solicitados. Tu solicitud será gestionada.'] },
      { p: '¿Qué tipo de equipo recibiré si debo reemplazar mi celular?', r: ['Un equipo reacondicionado, equivalente en marca, modelo y características al celular asegurado, y en correcto estado de funcionamiento.'] },
    ],
    flujo: {
      titulo: 'Cotiza tu Seguro Celular Protegido',
      ruta: '/personas/bienes-y-viaje/cotizador/celular-protegido/equipo/',
      pasos: ['equipo', 'datos', 'planes', 'inspeccion', 'pago', 'listo'],
      etiquetas: ['Tu equipo', 'Tus datos', 'Planes', 'Inspección', 'Pago', 'Listo'],
      referencia: 'https://www.zurich.cl/bienes-y-viaje/celular-protegido',
      // Cotizador propio del producto: abre un recorrido nuevo en cada visita.
      formulario: 'https://celularprotegido.zurich.cl/cl/',
      previa: [
        { etiqueta: 'Marca', tipo: 'text', ayuda: 'Samsung, Apple, Motorola, Xiaomi…' },
        { etiqueta: 'Modelo', tipo: 'text' },
        { etiqueta: 'Capacidad', tipo: 'text', ayuda: '128 GB, 256 GB…' },
        { etiqueta: 'IMEI', tipo: 'text', ayuda: '15 dígitos' },
      ],
      necesitas: ['Marca, modelo y capacidad del equipo.', 'El IMEI (marca *#06#).', 'El celular a mano para la inspección.', 'Tu cédula de identidad.'],
    },
    porValidar: [
      'Moneda, referencia temporal y vigencia de «Desde $29.990» (dato del brief). El valor publicado en zurich.cl no se pudo leer como texto: su nota oficial lo refiere a un iPhone 17 256 GB, plan básico, 12 meses.',
      'Modalidad de contratación: el brief la deja «por confirmar»; zurich.cl la ofrece 100% online.',
      'El cotizador celularprotegido.zurich.cl permite cargarse dentro de otro sitio (revisado el 9 de octubre de 2026). Confirmar con TI que la inspección del equipo y el pago funcionan dentro del marco.',
    ],
  },

  {
    id: 'hogar-facil-plus',
    nombre: 'Seguro Hogar Fácil Plus',
    corto: 'Hogar Fácil Plus',
    ramo: 'hogar',
    modalidad: /** @type {Modalidad} */ ('digital'),
    ruta: '/personas/hogar/hogar-facil-plus/',
    referencia: 'https://www.zurich.cl/bienes-y-viaje/hogar-facil-plus',
    foto: 'hogar-familia-living',
    icono: 'casa',
    entidad: '',
    tarjeta: 'Conoce el producto y comienza tu cotización.',
    cta: 'Cotizar Seguro Hogar Fácil Plus',
    bajada: 'Diseñado para proteger y asegurar de mejor manera tu inversión, incluyendo asistencias muy completas que podrán facilitar la vida en tu hogar.',
    gancho: { etiqueta: '5 planes', valor: 'Incendio, sismo y robo', nota: 'Premium, Estándar, Vacacional, Rural e Hipotecario.' },
    beneficios: [
      { icono: 'casa', titulo: 'Estructura y contenido', texto: 'Cobertura para viviendas con una antigüedad máxima de 75 años, de material sólido, ligero o mixto.' },
      { icono: 'escudo', titulo: 'Incendio, sismo y robo', texto: 'Además de cobertura para daños de aparatos eléctricos y electrónicos.' },
      { icono: 'herramienta', titulo: '3 tipos de asistencia', texto: 'Hogar básica al RUT, SOS y Mascotas, según el plan que contrates.' },
    ],
    coberturas: {
      titulo: 'Principales características y coberturas',
      lista: [
        'Cobertura de Estructura y Contenido para viviendas con una antigüedad máxima de 75 años.',
        'Cobertura viviendas de material: Sólido, Ligero y Mixto.',
        'Cobertura para viviendas de riesgo urbano, rural y de uso permanente y vacacional.',
        '3 tipos de asistencia: Hogar básica al RUT / SOS / Mascotas.',
        'Cobertura para daños de aparatos eléctricos y electrónicos.',
        'Cobertura de Incendio, Sismo y Robo.',
        'Sin deducible en el Plan Premium para Rotura de Cañerías, Riesgos de la naturaleza y Rotura de Cristales.',
      ],
    },
    asistencias: [
      { titulo: 'Asistencia 3 eventos al RUT', items: ['Gasfitería', 'Electricidad', 'Cerrajería', 'Cristalería', 'Mudanza', 'Custodia', 'Alojamiento y alimentación'] },
      { titulo: 'Asistencia SOS', items: ['Limpieza de alfombras', 'Instalaciones de muros', 'Mantención de pisos', 'Pintor de interiores', 'Instalaciones eléctricas', 'Instalaciones de gas y plomería'] },
      { titulo: 'Asistencia Mascotas', items: ['Gastos veterinarios por accidente', 'Orientación médica veterinaria telefónica', 'Conexión con clínicas veterinarias', 'Asistencia legal telefónica ilimitada', 'Reembolso por hospitalización de la mascota por accidente', 'Reembolso por hotelería / hospitalización en caso de viaje del dueño'] },
    ],
    antes: {
      titulo: '¿Qué viviendas se pueden asegurar?',
      requisitos: [
        'Viviendas con ocupación permanente (excepto para el producto Vacacional).',
        'Viviendas ubicadas en sectores urbanos (excepto producto Rural).',
      ],
      condiciones: [
        'No se aseguran viviendas ubicadas en zonas excluidas según políticas de suscripción de la compañía.',
        'No se aseguran viviendas colindantes a sitios, terrenos o predios deshabitados, sin vigilancia o abandonados, ni ubicadas dentro de reservas o parques nacionales.',
        'No se aseguran viviendas consideradas monumento nacional ni ubicadas en islas en general.',
        'Las viviendas deben estar a más de 200 metros de fuentes o cursos de agua, fábricas, industrias o similares.',
      ],
    },
    precio: 'El precio depende del plan elegido y de las características de tu vivienda. Lo conoces al cotizar.',
    documentos: [],
    preguntas: [
      { p: '¿Qué debo hacer si sufro un daño en mi hogar?', r: ['Primero da aviso a Bomberos o Carabineros, quienes dejarán constancia escrita del siniestro.', 'Luego denuncia el siniestro en la página de Denuncia de Siniestros, sección «Denuncias de Siniestros de Otros Seguros», o llama al 600 600 9090. Un ejecutivo se contactará contigo y comenzará la liquidación del caso.'] },
      { p: '¿Cómo solicito una asistencia?', r: ['Solo debes llamar al proveedor del servicio. El número de tu asistencia aparece en tu póliza, que puedes descargar desde el Portal de Clientes.'] },
    ],
    flujo: {
      titulo: 'Cotiza tu Seguro Hogar Fácil Plus',
      ruta: '/personas/hogar/cotizador/hogar-facil-plus/datos/',
      pasos: ['datos', 'vivienda', 'planes', 'confirmacion', 'pago', 'listo'],
      etiquetas: ['Tus datos', 'Tu vivienda', 'Planes', 'Confirmación', 'Pago', 'Listo'],
      referencia: 'https://www.zurich.cl/bienes-y-viaje/hogar-facil-plus',
      previa: [
        { etiqueta: 'RUT', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
        { etiqueta: 'Nombre y apellido', tipo: 'text' },
        { etiqueta: 'Correo electrónico', tipo: 'email' },
        { etiqueta: 'Celular', tipo: 'tel', ayuda: '+56 9' },
      ],
      necesitas: ['Tu RUT y datos de contacto.', 'La comuna y el tipo de vivienda.', 'El material y la antigüedad de la construcción.'],
    },
    porValidar: [
      'Nombre y URL oficial: el brief dice «Seguro de Hogar» con URL pendiente. La página pública vigente es «Seguro Hogar Fácil Plus»; existe además un «Seguro Hogar Digital» que solo aparece en el Centro de Ayuda.',
      'Mecanismo de contratación digital y dirección del cotizador sin la página del producto alrededor (no es pública).',
    ],
  },

  {
    id: 'proteccion-urgencias',
    nombre: 'Seguro Protección Urgencias',
    corto: 'Protección Urgencias',
    ramo: 'vida-y-salud',
    modalidad: /** @type {Modalidad} */ ('digital'),
    ruta: '/personas/vida-y-salud/proteccion-urgencias/',
    referencia: 'https://www.zurich.cl/vida-y-salud/salud/proteccion-urgencias',
    foto: 'urgencias-familia-sofa',
    icono: 'salud',
    entidad: ENTIDADES.vida,
    tarjeta: 'Revisa la información del producto y conoce sus opciones de contratación.',
    cta: 'Conocer Protección Urgencias',
    ctaFlujo: 'Contratar Protección Urgencias',
    bajada: 'Protege a tu familia con un seguro de vida y salud, con atención de urgencias médicas, telemedicina ilimitada y descuentos en farmacias.',
    gancho: { etiqueta: 'Precio referencial', valor: 'Desde $13.900*', nota: 'Desde UF 0,339 en el Plan Básico.' },
    concurso: CONCURSO_SUPERMERCADO,
    beneficios: [
      { icono: 'ajustes', titulo: 'A tu medida', texto: 'Elige entre 3 planes y encuentra la protección adecuada para ti y tu familia.' },
      { icono: 'escudo', titulo: 'Flexible', texto: 'Elige el monto asegurado según tus necesidades, desde UF 150 hasta UF 500.' },
      { icono: 'celular', titulo: 'Telemedicina', texto: 'Accede a consultas ilimitadas en psicología, fonoaudiología, nutriología y más.' },
    ],
    coberturas: {
      titulo: 'Coberturas de tu seguro',
      columnas: ['Plan Básico', 'Plan Estándar', 'Plan Premium'],
      filas: [
        ['Fallecimiento', 'UF 150', 'UF 250', 'UF 500'],
        ['Muerte accidental', 'UF 150', 'UF 250', 'UF 500'],
        ['Invalidez accidental', 'UF 150', 'UF 250', 'UF 500'],
        ['Acto quirúrgico por urgencia', 'UF 10', 'UF 15', 'UF 20'],
        ['Sala de urgencia', true, true, true],
        ['Descuentos en farmacias', true, true, true],
        ['Precio UF', 'Desde UF 0,339', 'Desde UF 0,369', 'Desde UF 0,420'],
        ['Precio $', 'Desde $13.900*', 'Desde $15.122*', 'Desde $17.213*'],
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: [
        'Estás cubierto desde el momento en que realizas la contratación.',
        'Puedes incorporar hasta 3 miembros de tu grupo familiar a la cobertura Sala de Urgencia; los hijos, hasta los 24 años y 364 días.',
      ],
      condiciones: [
        'Sala de Urgencia por enfermedad tiene un período de carencia: está disponible a partir de 45 días hábiles después de la emisión de la póliza.',
        'Solo el titular de la póliza accede a los descuentos en medicamentos, en línea o presencial en Farmacias Ahumada.',
        'Los beneficiarios para Sala de Urgencia se pueden incorporar 7 días hábiles después de la contratación.',
      ],
    },
    precio: 'Desde $13.900* en el Plan Básico, $15.122* en el Estándar y $17.213* en el Premium. (*) Precio referencial equivalente al valor de la UF al 21/09/2026 por $40.983,58.',
    documentos: ['La Compañía que asegura el riesgo es Zurich Chile Seguros de Vida S.A. Condiciones generales y cláusulas adicionales incorporadas en el Depósito de Pólizas de la Comisión para el Mercado Financiero.'],
    preguntas: [
      { p: '¿Cómo activo mi cobertura Sala de Urgencia?', r: ['Ingresa al sitio del prestador vdoc.geasa.cl, crea tu usuario con la opción «¿aún no tienes acceso?», valida tus datos y establece una contraseña. Desde tu cuenta podrás agendar video consultas, agregar beneficiarios, revisar tu historial y descargar recetas y órdenes médicas.'] },
      { p: '¿Cómo uso mis descuentos en farmacias?', r: ['En línea: ingresa a farmaciasahumada.cl, entra a «Mi cuenta», elige tu medicamento y selecciona tu convenio. Presencial: en cualquier sucursal de Farmacias Ahumada presenta tu cédula de identidad.'] },
      { p: '¿Cómo designo o modifico a mis beneficiarios?', r: ['Desde tu Portal de Clientes: selecciona la póliza, haz clic en «Agregar beneficiarios», completa la información, indica el porcentaje de distribución y valida con tu contraseña.'] },
    ],
    flujo: {
      titulo: 'Contrata tu Seguro Protección Urgencias',
      ruta: '/personas/vida-y-salud/cotizador/proteccion-urgencias/datos/',
      pasos: ['datos', 'planes', 'beneficiarios', 'pago', 'listo'],
      etiquetas: ['Tus datos', 'Planes', 'Beneficiarios', 'Pago', 'Listo'],
      referencia: 'https://www.zurich.cl/vida-y-salud/salud/proteccion-urgencias',
      previa: [
        { etiqueta: 'RUT', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
        { etiqueta: 'Fecha de nacimiento', tipo: 'text', ayuda: 'dd/mm/aaaa' },
        { etiqueta: 'Correo electrónico', tipo: 'email' },
        { etiqueta: 'Celular', tipo: 'tel', ayuda: '+56 9' },
      ],
      necesitas: ['Tu RUT y fecha de nacimiento.', 'Datos de contacto.', 'Datos de tus beneficiarios, si quieres designarlos.'],
    },
    porValidar: [
      'Modalidad: el brief la deja «digital por confirmar»; zurich.cl la ofrece 100% online.',
      'Nombre oficial: «Seguro Protección Urgencias» (el brief dice «Protección de Urgencias»).',
      'Concurso «Año de supermercado»: confirmar si aplica a clientes de Banco BICE.',
      'Dirección del cotizador sin la página del producto alrededor (no es pública).',
    ],
  },

  {
    id: 'oncologico-familiar',
    nombre: 'Seguro Oncológico Familiar Directo',
    corto: 'Oncológico Familiar Directo',
    ramo: 'vida-y-salud',
    modalidad: /** @type {Modalidad} */ ('asesoria'),
    ruta: '/personas/vida-y-salud/oncologico-familiar/',
    referencia: 'https://www.zurich.cl/vida-y-salud/salud/oncologico-familiar-directo',
    foto: 'oncologico-familia-paseo',
    icono: 'corazon',
    entidad: ENTIDADES.vida,
    tarjeta: 'Apoyo para el tratamiento oncológico, exámenes preventivos sin costo y descuentos en farmacias.',
    cta: 'Solicitar asesoría',
    bajada: 'Cuida tu salud y la de tu familia con un seguro que incluye apoyo para el tratamiento oncológico, exámenes preventivos y descuentos en farmacias.',
    gancho: { etiqueta: 'Prevención incluida', valor: '4 exámenes preventivos sin costo', nota: 'Sin deducible ni copago fijo en la cobertura oncológica.' },
    concurso: CONCURSO_SUPERMERCADO,
    beneficios: [
      { icono: 'lupa', titulo: 'Prevención', texto: 'Accede a 4 exámenes preventivos de cáncer sin costo.' },
      { icono: 'corazon', titulo: 'Apoyo', texto: 'Te ayudamos a cubrir gastos de tu tratamiento contra el cáncer.' },
      { icono: 'salud', titulo: 'Salud', texto: 'Disfruta descuentos en farmacias para cuidar tu bienestar.' },
    ],
    coberturas: {
      titulo: 'Coberturas de accidentes personales y salud',
      lista: [
        'Fallecimiento accidental: Zurich pagará a los beneficiarios una indemnización por UF 50 en caso de fallecimiento del asegurado titular a consecuencia directa e inmediata de un accidente.',
        'Oncológica: cubre todos los tipos de cánceres, incluso cáncer in situ y cáncer de piel. Cubre todo el tratamiento médico del primer cáncer, sus recurrencias en cualquier tiempo y cualquier 2do, 3ro o más cánceres que desarrolle el asegurado durante toda la vida.',
        'Incluye procedimientos diagnósticos, tratamientos y prestaciones médicas (exámenes, radiología, escáner, resonancias, radioterapia, quimioterapia, cirugías y honorarios), consultas de seguimiento hasta 6 meses después de concluir la terapia y acceso a nuevos tratamientos.',
        'Solo dos topes: UF 4 por insumos y medicamentos estando hospitalizado, por cada hospitalización, y hasta UF 100 en total para medicamentos de quimioterapia.',
        'Descuentos en farmacias.',
      ],
    },
    pasosPrevios: {
      titulo: 'Exámenes preventivos sin costo',
      bajada: 'Para detectar a tiempo distintos tipos de cáncer. Se coordinan con Clínica IRAM.',
      pasos: [
        { titulo: 'Mamografía', texto: 'Detección precoz del cáncer de mama. Mujeres desde los 35 años, una vez al año.' },
        { titulo: 'Antígeno Prostático (PSA)', texto: 'Detección precoz del cáncer de próstata. Hombres desde los 45 años, una vez al año.' },
        { titulo: 'VPH por PCR', texto: 'Cáncer cérvico uterino. Mujeres de 21 a 29 años cada 3 años, y de 30 a 65 años cada 5 años.' },
        { titulo: 'Sangre oculta en deposiciones', texto: 'Cáncer colorrectal. Mujeres y hombres entre 45 y 75 años, una vez al año.' },
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: [
        'La cobertura oncológica comienza cuando Zurich confirma el diagnóstico mediante una biopsia y valida que no existan antecedentes que impidan el acceso a la cobertura.',
        'Luego, el caso es derivado a la Clínica IRAM, que coordina la primera atención en un plazo de 1 a 2 días hábiles.',
      ],
      condiciones: [
        'La cobertura oncológica tiene un período de carencia de 1 mes desde el inicio de vigencia de la póliza o su rehabilitación. Aplica también a los exámenes preventivos.',
        'Todos los exámenes y procedimientos deben coordinarse previamente con la Clínica IRAM: si te realizas atenciones sin seguir este proceso, pierdes tu cobertura oncológica.',
        'Este seguro no contempla deducibles.',
      ],
    },
    precio: 'El valor se informa durante la asesoría, según tu perfil y el grupo familiar a proteger.',
    documentos: ['Riesgo asegurado por Zurich Chile Seguros de Vida S.A.'],
    preguntas: [
      { p: '¿En qué consiste la cobertura con el prestador IRAM?', r: ['Incluye exámenes preventivos sin costo y cobertura para distintos tipos de cáncer, con una red de especialistas y centros médicos. Las cirugías oncológicas se realizan en clínicas como Alemana, Santa María, Las Condes, Universidad de los Andes, Indisa y Redsalud Vitacura.'] },
      { p: '¿Cómo solicito los exámenes preventivos?', r: ['Comunícate con Clínica IRAM al +56 2 2754 1796, +56 2 2754 1700 o examen.preventivo@iram.cl para coordinar tu cita en un centro médico en convenio.'] },
    ],
    porValidar: [
      'Mecanismo de contacto con el agente, datos solicitados, consentimiento y confirmación al cliente (brief).',
      'Nombre oficial: «Seguro Oncológico Familiar Directo» (el brief dice «Seguro Oncológico Familiar»).',
      'Concurso «Año de supermercado»: confirmar si aplica a clientes de Banco BICE.',
    ],
  },

  {
    id: 'temporal-plus',
    nombre: 'Seguro Temporal Plus',
    corto: 'Temporal Plus',
    ramo: 'vida-y-salud',
    modalidad: /** @type {Modalidad} */ ('asesoria'),
    ruta: '/personas/vida-y-salud/temporal-plus/',
    referencia: 'https://www.zurich.cl/vida-y-salud/salud/temporal-plus',
    foto: 'temporal-familia-juego',
    icono: 'escudo',
    entidad: '',
    tarjeta: 'Protege los ingresos de tu familia, aun cuando no estés.',
    cta: 'Solicitar asesoría',
    bajada: 'Te permite proteger los ingresos de tu familia, aun cuando no estés. Además, podrás solventar gastos inesperados producto de una incapacidad física, enfermedad o accidente.',
    gancho: { etiqueta: 'Fallecimiento', valor: 'Cobertura de hasta UF 30.000', nota: 'Tus beneficiarios reciben la indemnización en un solo pago.' },
    beneficios: [
      { icono: 'escudo', titulo: 'Fallecimiento e invalidez', texto: 'Cobertura de hasta UF 30.000 por fallecimiento, y protección si contratas las coberturas de invalidez (incapacidad temporal o parcial 2/3) o invalidez a causa de un accidente.' },
      { icono: 'salud', titulo: 'Gastos por enfermedad', texto: 'Si contratas esta cobertura, estás protegido ante enfermedades de alto costo, un accidente o enfermedades oncológicas.' },
      { icono: 'personas', titulo: 'Flexibilidad', texto: 'Eliges libremente tus beneficiarios, quienes recibirán la indemnización en un solo pago.' },
    ],
    coberturas: {
      titulo: 'Qué protege',
      lista: [
        'Fallecimiento: hasta UF 30.000.',
        'Invalidez: incapacidad temporal o parcial 2/3, o invalidez a causa de un accidente, si contratas estas coberturas.',
        'Gastos por enfermedades de alto costo, accidente o enfermedades oncológicas, si contratas esta cobertura.',
      ],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: ['En general, se puede contratar desde los 18 hasta los 64 años, según el plan y las condiciones generales de la póliza.'],
      condiciones: [
        'En la mayoría de los seguros de vida no se paga la indemnización si el fallecimiento es causado por situaciones extremas o inusuales, como suicidio, participación en actividades peligrosas o delictivas o deportes de alto riesgo (se evalúa al tomar la póliza). Revisa el detalle en tu póliza.',
        'Si no hay beneficiarios designados, se solicitará la posesión efectiva y se pagará a los beneficiarios legales.',
      ],
    },
    precio: 'El valor se informa durante la asesoría, según las coberturas y el monto asegurado que elijas.',
    documentos: [],
    preguntas: [
      { p: '¿Cómo designo o modifico a mis beneficiarios?', r: ['Desde tu Portal de Clientes: selecciona la póliza, haz clic en «Agregar beneficiarios», completa la información, indica el porcentaje de distribución y valida con tu contraseña. Puedes modificarlos en cualquier momento.'] },
      { p: '¿Cómo conozco el detalle de mis coberturas?', r: ['Descarga un duplicado de tu póliza desde el Portal de Clientes.'] },
    ],
    porValidar: ['Mecanismo de contacto con el agente, datos solicitados, consentimiento y confirmación al cliente (brief).'],
  },

  {
    id: 'vida-mas-salud',
    nombre: 'Seguro Zurich Mi Vida + Salud',
    corto: 'Mi Vida + Salud',
    ramo: 'vida-y-salud',
    modalidad: /** @type {Modalidad} */ ('asesoria'),
    ruta: '/personas/vida-y-salud/vida-mas-salud/',
    referencia: 'https://www.zurich.cl/vida-y-salud/salud/vida-mas-salud',
    foto: 'vida-familia-playa',
    icono: 'personas',
    entidad: '',
    tarjeta: 'Cuida tu salud y la de tu familia a un precio accesible.',
    cta: 'Solicitar asesoría',
    bajada: 'Enfrentar una situación grave y no poder pagar es una gran preocupación. Protégete a un precio accesible: este seguro cuida tu salud y la de tu familia, y deja asegurados a quienes más quieres en caso de que no estés.',
    gancho: { etiqueta: 'Prima mensual', valor: 'Desde $8.049*', nota: 'Valor publicado en zurich.cl.' },
    beneficios: [
      { icono: 'escudo', titulo: 'Fallecimiento', texto: 'UF 200 en caso de tu fallecimiento, con UF 200 extra si es ocasionado por un accidente.' },
      { icono: 'salud', titulo: 'Actos quirúrgicos', texto: 'Cobertura de hasta el 100% de gastos por acto quirúrgico, con tope de 10 UF por evento según tu sistema de salud.' },
      { icono: 'corazon', titulo: 'Diagnóstico de cáncer', texto: 'Indemnización de UF 50 ante un primer diagnóstico de cáncer.' },
    ],
    coberturas: {
      titulo: 'Coberturas y capital asegurado',
      columnas: ['Capital asegurado'],
      filas: [
        ['Reembolso de gastos por cirugía del titular, hijos y cónyuge', 'Hasta 100% (1)'],
        ['Fondos de libre disposición ante un primer diagnóstico de cáncer del titular, hijos y cónyuge', 'UF 50'],
        ['Invalidez accidental del titular', 'UF 100'],
        ['Fallecimiento del titular', 'UF 200'],
        ['Fallecimiento accidental del titular (2)', 'UF 200'],
        ['Gastos funerarios por fallecimiento cónyuge o conviviente', 'UF 40'],
        ['Gastos funerarios por fallecimiento hijo', 'UF 20'],
      ],
      notas: ['(1) El porcentaje depende de la cobertura del sistema de salud primario.', '(2) La indemnización se realizará conforme a las condiciones tributarias vigentes al momento de llevarse a cabo.'],
    },
    antes: {
      titulo: 'Antes de contratar',
      requisitos: ['Para los gastos funerarios, el cónyuge o conviviente y los hijos deben estar incorporados como asegurados dependientes.'],
      condiciones: ['Si no hay beneficiarios designados, se solicitará la posesión efectiva y se pagará a los beneficiarios legales.'],
    },
    precio: 'Prima mensual desde $8.049*. El valor final se confirma durante la asesoría.',
    documentos: [],
    preguntas: [
      { p: '¿Cómo designo o modifico a mis beneficiarios?', r: ['Desde tu Portal de Clientes: selecciona la póliza, haz clic en «Agregar beneficiarios», completa la información, indica el porcentaje de distribución y valida con tu contraseña.'] },
    ],
    porValidar: [
      'Nombre oficial: «Seguro Zurich Mi Vida + Salud» (el brief dice «Vida Más Salud»).',
      'Referencia del asterisco de «desde $8.049»: la nota no se pudo leer en zurich.cl.',
      'Mecanismo de contacto con el agente (brief).',
    ],
  },
];

/* ------------------------------------------------------------------------ */
/* Servicios · acceso directo, sin página informativa intermedia (brief)    */
/* ------------------------------------------------------------------------ */
export const SERVICIOS = [
  {
    id: 'denuncia-vehiculo',
    nombre: 'Denunciar un siniestro de vehículo',
    corto: 'Siniestro de vehículo',
    ruta: '/servicios/denuncia-vehiculo/',
    icono: 'auto',
    cta: 'Iniciar denuncia',
    bajada: 'Da aviso de un choque, robo o daño de tu vehículo asegurado.',
    referencia: 'https://clientes.zurich.cl/Portalclientes/denuncios/motors',
    formulario: 'https://clientes.zurich.cl/Portalclientes/denuncios/motors',
    // Texto de zurich.cl (preguntas de Auto Digital: «¿Cómo activo mi seguro en caso de accidente?»).
    aviso: { titulo: 'Antes de denunciar', texto: 'En caso de robo, hurto o lesiones a personas, realiza de inmediato la denuncia en Carabineros. Si hay solo daños materiales, da aviso dentro de los 10 días corridos desde que ocurrió.' },
    pasos: ['identificacion', 'siniestro', 'relato', 'documentos', 'listo'],
    etiquetas: ['Asegurado', 'Siniestro', 'Relato', 'Documentos', 'Listo'],
    previa: [
      { etiqueta: 'RUT del asegurado', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
      { etiqueta: 'Patente del vehículo', tipo: 'text' },
      { etiqueta: 'Fecha del siniestro', tipo: 'text', ayuda: 'dd/mm/aaaa' },
      { etiqueta: 'Tipo de siniestro', tipo: 'text', ayuda: 'Choque, robo, daño…' },
    ],
    necesitas: [
      'RUT del asegurado y patente del vehículo.',
      'Fecha y tipo de siniestro: choque, robo o daño.',
      'Si hay otros autos involucrados: marca, modelo, patente, nombre y RUT del conductor, teléfono y correo.',
    ],
    porValidar: ['El formulario permite cargarse dentro de otro sitio (revisado el 9 de octubre de 2026). Sus cookies no declaran «SameSite»: confirmar con TI que la sesión se mantiene dentro del marco, sobre todo en Safari.'],
  },
  {
    id: 'denuncia-vida',
    nombre: 'Denunciar un siniestro de vida',
    corto: 'Siniestro de vida',
    ruta: '/servicios/denuncia-vida/',
    icono: 'corazon',
    cta: 'Iniciar denuncia',
    bajada: 'Inicia el aviso de un siniestro de un seguro de vida o salud.',
    referencia: 'https://www9.zurich.cl/vida/web/Portal/productos/life/reembolso/0',
    formulario: 'https://www9.zurich.cl/vida/web/Portal/productos/life/reembolso/0',
    pasos: ['identificacion', 'siniestro', 'documentos', 'listo'],
    etiquetas: ['Asegurado', 'Siniestro', 'Documentos', 'Listo'],
    previa: [
      { etiqueta: 'RUT del asegurado', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
      { etiqueta: 'Correo electrónico', tipo: 'email' },
    ],
    necesitas: ['RUT del asegurado.', 'Antecedentes del siniestro y documentos de respaldo.'],
    porValidar: [
      'La ruta entregada incluye «reembolso»: zurich.cl indica que los reembolsos de salud y vida se hacen en el portal de cliente, así que esta URL parece corresponder a reembolsos y no a denuncias. Confirmar el destino correcto.',
    ],
  },
  {
    id: 'reembolso',
    nombre: 'Solicitar un reembolso',
    corto: 'Reembolso',
    ruta: '/servicios/reembolso/',
    icono: 'documento',
    cta: 'Solicitar reembolso',
    bajada: 'Pide el reembolso de un gasto cubierto por tu seguro.',
    referencia: 'https://edge.sitecorecloud.io/zurichinsurf8c0-zwpshared-prod-d824/media/project/zurich-headless/chile/docs/formularios/formulario-reembolso-asistencia-gi-zchnov2022.pdf',
    formulario: 'https://edge.sitecorecloud.io/zurichinsurf8c0-zwpshared-prod-d824/media/project/zurich-headless/chile/docs/formularios/formulario-reembolso-asistencia-gi-zchnov2022.pdf',
    documento: { titulo: 'Solicitud de Reembolso para Asistencia Vehicular, Hogar y Asistencia de Viaje', formato: 'PDF' },
    aviso: { titulo: 'Cómo se envía', texto: 'Formulario oficial en PDF. Se completa, se firma y se envía con los comprobantes del gasto.' },
    pasos: ['formulario', 'envio', 'listo'],
    etiquetas: ['Formulario', 'Envío', 'Listo'],
    previa: [],
    necesitas: ['Nombre, RUT, póliza y teléfono del asegurado.', 'Tipo de prestación y relato de los hechos.', 'Comprobantes del gasto.', 'Cuenta bancaria del titular de la póliza para el pago.'],
    porValidar: [
      'El PDF entregado es para asistencias (vehicular, hogar y viaje). Los reembolsos de salud y vida se hacen en el portal de cliente: definir cuál corresponde a este acceso.',
      'Definir si se descarga el PDF o si existe un flujo transaccional para integrar (brief).',
      'En celulares un PDF dentro de un marco se ve incompleto o no se ve: por eso el botón de descarga queda siempre a la vista.',
    ],
  },
  {
    id: 'pago',
    nombre: 'Pagar mi seguro',
    corto: 'Pagar mi seguro',
    ruta: '/servicios/pago/',
    icono: 'tarjeta',
    cta: 'Ir al pago',
    bajada: 'Paga tus cuotas atrasadas o adelanta el pago de ellas de manera simple y segura.',
    referencia: 'https://www.zurich.cl/conocenos/pago-en-linea',
    // El formulario de «Pago en línea» de zurich.cl vive en este dominio.
    formulario: 'https://www9.chilena.cl/vida/web/Portal/pagoexpress/ingreso',
    // Texto de zurich.cl (preguntas de Auto Digital y formulario de pago).
    aviso: { titulo: 'Antes de pagar', texto: 'El comprobante de pago llega al correo que ingreses. Para adelantar cuotas, en el detalle de los pagos de tu póliza elige «Adelanta tus cuotas».' },
    pasos: ['identificacion', 'poliza', 'pago', 'listo'],
    etiquetas: ['Tus datos', 'Póliza', 'Pago', 'Listo'],
    previa: [
      { etiqueta: 'Correo electrónico', tipo: 'email', ayuda: 'El comprobante de pago llega a este correo.' },
      { etiqueta: 'RUT del contratante', tipo: 'text', ayuda: 'Ej.: 12.345.678-9' },
    ],
    necesitas: ['Correo y RUT del contratante de la póliza.', 'Medio de pago: Webpay o convenios con Banco de Chile, Santander, BancoEstado y BCI.'],
    porValidar: [
      'Herramienta de pago que se integrará (el brief la deja pendiente). Se propone la de «Pago en línea» de zurich.cl, cuyo formulario está en www9.chilena.cl y permite cargarse dentro de otro sitio (revisado el 9 de octubre de 2026).',
      'Pasarela de pago (Webpay u otra): si lleva a un dominio que no es de Zurich, ese paso no carga dentro del marco. Confirmar con TI cuál usa y si se abre en una ventana aparte.',
    ],
  },
];

/* ------------------------------------------------------------------------ */
/* Portada · promociones (orden del brief)                                  */
/* ------------------------------------------------------------------------ */
export const PROMOCIONES = ['auto-digital', 'celular-protegido', 'soap'];

/** Productos con contratación en línea, en el orden de la portada. */
export const EN_LINEA = ['auto-digital', 'soap', 'celular-protegido', 'hogar-facil-plus', 'proteccion-urgencias'];
export const CON_ASESORIA = ['oncologico-familiar', 'temporal-plus', 'vida-mas-salud'];

/* ------------------------------------------------------------------------ */
/* La alianza · texto del brief                                              */
/* ------------------------------------------------------------------------ */
export const ALIANZA = {
  titulo: 'Zurich y Banco BICE',
  texto: 'Zurich pone a disposición de los clientes de Banco BICE una selección de seguros, servicios digitales y alternativas con asesoría. Este espacio reúne información, cotizadores y trámites para facilitar el acceso desde el entorno privado del banco. Los productos conservan su nombre e identidad Zurich.',
  roles: [
    { quien: 'Zurich', rol: 'Es el proveedor de los seguros: ofrece los productos, emite las pólizas y atiende las cotizaciones, los pagos y los siniestros con sus herramientas oficiales.' },
    { quien: 'Banco BICE', rol: 'Facilita el acceso a la oferta de Zurich para sus clientes, desde su espacio privado.' },
  ],
  porValidar: [
    'Texto legal aprobado sobre la función y responsabilidad de cada compañía.',
    'Canales de atención de Banco BICE definidos para esta experiencia.',
    'Avisos de privacidad, datos personales, cookies y consentimientos.',
  ],
};

/* ------------------------------------------------------------------------ */
/* Búsquedas                                                                 */
/* ------------------------------------------------------------------------ */
/** @param {string} id */
export const producto = (id) => PRODUCTOS.find((p) => p.id === id);
/** @param {string} id */
export const servicio = (id) => SERVICIOS.find((s) => s.id === id);
/** @param {string} id */
export const ramo = (id) => RAMOS.find((r) => r.id === id);
/** @param {string} id */
export const productosDeRamo = (id) => PRODUCTOS.filter((p) => p.ramo === id);
/** @param {string} id */
export const asesoriaRuta = (id) => `/personas/vida-y-salud/asesoria/${id}/`;
