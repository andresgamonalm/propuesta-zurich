/* =====================================================================
   Cotizador de demostración · Seguro de Auto Digital — datos
   ---------------------------------------------------------------------
   Viene del piloto de ecommerce (repositorio piloto-ecommerce-zurich) y
   se viste aquí de Zurich para la maqueta Zurich–Banco BICE. En
   producción este cotizador se reemplaza por la herramienta oficial.

   ORIGEN DE CADA DATO
   1. BASE DE CLIENTES · FICTICIA. Correos @datos-ficticios.test,
      celulares 5690000000x y patentes ZZxx. Ningún dato de una persona
      real: al portar se retiraron cuatro filas que tenían nombres reales.
   2. TARIFA DE REFERENCIA (TARIFA_BASE) · capturas del cotizador, pantalla
      «Elige un plan», cotización de ejemplo Hyundai Accent 2019 (en el
      piloto, a la UF de ese día: $40.855,64). La tarifa está en UF; los
      pesos se calculan con UF (abajo).
   3. FACTORES POR MARCA Y AÑO · SIMULACIÓN. Una regla de tres para que la
      demostración muestre precios distintos por auto. No es tarifa.
   4. PROMOCIÓN · la publicada por Zurich con sus bases, leída del
      catálogo del sitio (promocion.js). Las promociones por persona del
      piloto no se trajeron: no son públicas.
   ===================================================================== */

import { CLIENTES_DEMO } from './clientes-demo.js';

/* Una sola UF para toda la maqueta: la que usa zurich.cl en sus precios
   referenciales («valor de la UF al 21/09/2026 por $40.983,58», en la
   página de Protección Urgencias). Así Auto, Hogar y Urgencias calzan.
   En producción es la UF del día que entrega el sistema de emisión. */
export const UF = 40983.58;

/* Prima mensual en UF — cotización de referencia Hyundai Accent 2019 */
export const TARIFA_BASE = {
  0:  { basico: 1.17, estandar: 1.27, premium: 1.36 },
  3:  { basico: 0.88, estandar: 0.94, premium: 1.03 },
  5:  { basico: 0.79, estandar: 0.84, premium: 0.93 },
  10: { basico: 0.68, estandar: 0.72, premium: 0.81 },
  15: { basico: 0.63, estandar: 0.66, premium: 0.75 },
  20: { basico: 0.59, estandar: 0.62, premium: 0.70 }
};

export const DEDUCIBLES = [0, 3, 5, 10, 15, 20];

/* [SIMULACIÓN] factor por marca — segmento de valor del vehículo */
const FACTOR_MARCA = {
  'Audi': 1.42, 'BMW': 1.45, 'Mercedes-Benz': 1.48, 'Volvo': 1.34,
  'Jeep': 1.18, 'Subaru': 1.14, 'Mazda': 1.06, 'Volkswagen': 1.05,
  'Honda': 1.04, 'Toyota': 1.03, 'Kia': 1.00, 'Hyundai': 1.00,
  'Nissan': 1.00, 'Ford': 1.02, 'Mitsubishi': 1.01, 'Peugeot': 1.02,
  'Suzuki': 0.96, 'Chevrolet': 1.00, 'Renault': 1.01, 'Chery': 0.95,
  'MG': 0.97, 'Great Wall': 0.98
};

/* [SIMULACIÓN] factor por año — a mayor valor comercial, mayor prima */
const FACTOR_ANIO = {
  2026: 1.18, 2025: 1.15, 2024: 1.12, 2023: 1.08, 2022: 1.05, 2021: 1.03,
  2020: 1.01, 2019: 1.00, 2018: 0.97, 2017: 0.94, 2016: 0.91, 2015: 0.88,
  2014: 0.86, 2013: 0.84, 2012: 0.82, 2011: 0.80, 2010: 0.78
};

export function primaUF(marca, anio, deducible, plan) {
  const base = TARIFA_BASE[deducible][plan];
  return base * (FACTOR_MARCA[marca] || 1) * (FACTOR_ANIO[anio] || 0.78);
}

export const pesos = u => Math.round(u * UF);

/* ── DURACIÓN DE LA COBERTURA ─────────────────────────────────────────
   Uno o dos años. Dos años son 24 cuotas del mismo valor: la prima
   mensual no cambia. Zurich Days aplica solo a la vigencia de 24 meses
   (promocion.js). */
export const MESES_OPCIONES = [12, 24];

export const PLANES = [
  {
    id: 'basico', nombre: 'Plan Básico', corto: 'Básico',
    gancho: 'Lo esencial, al precio más bajo.',
    taller: 'Multimarca', asistencia: 'Básica', reemplazo: '15 días', rc: 'UF 500',
    exclusivas: [],
    destacados: [
      ['Taller', 'Multimarca'],
      ['Auto de reemplazo', '15 días'],
      ['Respaldo a terceros', 'Hasta UF 500'],
      ['Asistencia en ruta', 'Básica 24/7']
    ]
  },
  {
    id: 'estandar', nombre: 'Plan Estándar', corto: 'Estándar',
    gancho: 'Taller oficial de tu marca por muy poco más.',
    taller: 'Oficial de la marca', asistencia: 'Básica', reemplazo: '30 días', rc: 'UF 1.000',
    exclusivas: [],
    destacados: [
      ['Taller', 'Oficial de la marca'],
      ['Auto de reemplazo', '30 días'],
      ['Respaldo a terceros', 'Hasta UF 1.000'],
      ['Asistencia en ruta', 'Básica 24/7']
    ]
  },
  {
    id: 'premium', nombre: 'Plan Premium', corto: 'Premium', recomendado: true,
    gancho: 'Todo cubierto, sin pensarlo dos veces.',
    taller: 'Oficial de la marca', asistencia: 'Full', reemplazo: 'Ilimitado', rc: 'UF 1.500',
    exclusivas: [
      'Daños al auto en viajes al extranjero',
      'Daños a terceros causados por tu carga (UF 1.500)',
      'Daños a terceros conductores dependientes (UF 1.500)',
      'Aspiración de agua'
    ],
    destacados: [
      ['Taller', 'Oficial de la marca'],
      ['Auto de reemplazo', 'Ilimitado'],
      ['Respaldo a terceros', 'Hasta UF 1.500'],
      ['Asistencia en ruta', 'Full + psicológica']
    ]
  }
];

export const planPorId = id => PLANES.find(p => p.id === id) || PLANES[1];

/* Coberturas completas — transcritas de las tarjetas del cotizador.
   '—' = la cobertura no aparece en la tarjeta de ese plan. */
export const COBERTURAS = [
  ['Daños materiales: choque, naturaleza, granizo, sismo, huelga, terrorismo y actos maliciosos', 'Valor comercial', 'Valor comercial', 'Valor comercial'],
  ['Robo, hurto o uso no autorizado', 'Valor comercial', 'Valor comercial', 'Valor comercial'],
  ['Pérdida total', 'Valor comercial', 'Valor comercial', 'Valor comercial'],
  ['Robo de accesorios', '15% tope UF 50', '15% tope UF 50', '15% tope UF 50'],
  ['Daños materiales por su propia carga', 'Valor comercial', 'Valor comercial', 'Valor comercial'],
  ['Daños materiales a conductores dependientes', 'Valor comercial', 'Valor comercial', 'Valor comercial'],
  ['Responsabilidad civil — daño emergente', 'UF 500', 'UF 1.000', 'UF 1.500'],
  ['Responsabilidad civil — daño moral', 'UF 500', 'UF 1.000', 'UF 1.500'],
  ['Responsabilidad civil — lucro cesante', 'UF 500', 'UF 1.000', 'UF 1.500'],
  ['Asiento de pasajero — muerte accidental', 'UF 200', 'UF 200', 'UF 200'],
  ['Asiento de pasajero — incapacidad total y permanente', 'UF 200', 'UF 200', 'UF 200'],
  ['Asiento de pasajero — gastos médicos', 'UF 25', 'UF 25', 'UF 25'],
  ['Defensa penal y constitución de fianzas', 'UF 150', 'UF 150', 'UF 150'],
  ['Taller de reparación', 'Multimarca', 'Oficial de la marca', 'Oficial de la marca'],
  ['Asistencia en ruta', 'UF 30 — básica', 'UF 30 — básica', 'UF 30 — full'],
  ['Vehículo de reemplazo', 'UF 30 — 15 días', 'UF 30 — 30 días', 'UF 30 — ilimitado'],
  ['Daños al vehículo en viaje al extranjero', '—', '—', 'Valor comercial'],
  ['Daños a terceros causados por la carga', '—', '—', 'UF 1.500'],
  ['Daños a terceros conductores dependientes', '—', '—', 'UF 1.500'],
  ['Aspiración de agua', '—', '—', 'Valor comercial']
];

/* Cláusula de consentimiento — transcripción del modal del cotizador
   (Flujo-Formulario-Promoción.pptx, lámina 4). POR VALIDAR con legal de
   Zurich antes de mostrarla fuera de la maqueta. */
export const CONSENTIMIENTO = {
  titulo: 'Cláusula de consentimiento',
  intro: 'Al seleccionar estas finalidades del presente documento, aceptas que Zurich y sus empresas relacionadas usen tu información personal en Chile y el extranjero. Esto aplica a la información que proporciones de cualquier manera, incluyendo este documento u otros, negociaciones, o servicios, ya sea directamente, en persona, por teléfono, en línea, a través de apps, etc.',
  marco: 'Zurich puede usar tu información cuando lo permita la ley, para cumplir con obligaciones legales o por otras razones legales. Con tu permiso, Zurich puede usar tus datos para:',
  finalidades: [
    'Ofrecerte productos o servicios.',
    'Negociar, celebrar, o ejecutar contratos o servicios, incluyendo propuestas, cotizaciones o simulaciones.',
    'Mantener tu información al día en todos tus contratos o servicios con Zurich.',
    'Corregir y actualizar tu información con fuentes de acceso público o la que tú proporciones.',
    'Compartir tu información dentro del grupo Zurich, incluso fuera de Chile, para fines administrativos, auditorías, comunicación comercial, entre otros.',
    'Compartir tu información con proveedores de Zurich que sigan sus instrucciones y mantengan la confidencialidad y seguridad.',
    'Utilizar técnicas de análisis y algoritmos de aprendizaje para procesar grandes volúmenes de datos, crear perfiles de cliente, y evaluar productos o servicios que se adecuen de mejor manera al cliente.',
    'Analizar datos y elaborar estudios estadísticos sobre intereses del cliente para mejorar la calidad del servicio y la propuesta de valor.'
  ],
  derechos: 'Al dar tu consentimiento, sigues teniendo derechos sobre tus datos, como acceder a ellos, corregirlos, cancelarlos, oponerte a su uso, o trasladarlos, en virtud de la ley o según corresponda.',
  prioridad: 'Este consentimiento no anula ni modifica otros consentimientos que hayas dado antes a Zurich. Si hay conflictos con permisos anteriores, este documento tendrá prioridad legalmente.'
};

/* Por qué pedimos cada dato — se muestra junto al campo. Es lo que el
   flujo pide como «hit de preguntas que explique por qué lo pedimos». */
export const POR_QUE = {
  rut: 'Con tu RUT buscamos si ya tienes una oferta calculada y evitamos que escribas lo que ya sabemos.',
  correo: 'Ahí te llega la propuesta, la póliza y el link de la inspección. Es el único canal donde queda todo por escrito.',
  celular: 'Por WhatsApp te enviamos el enlace para inspeccionar tu auto desde el celular.',
  comuna: 'La comuna donde duerme el auto influye en el riesgo de robo y por lo tanto en el precio.',
  direccion: 'Va en la póliza como domicilio del asegurado y es donde llega el auto de reemplazo si lo necesitas.',
  patente: 'Con la patente completamos marca, modelo y año, y verificamos que el auto sea asegurable.',
  motor: 'El número de motor y de chasis identifican tu auto en la póliza. Están en el padrón y en el permiso de circulación.',
  cedula: 'El número de documento de tu cédula firma digitalmente la propuesta. No es una clave y no queda guardado.'
};

export const TIPOS_DOMICILIO = ['Casa', 'Departamento', 'Oficina', 'Parcela'];

export const COLORES_AUTO = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Azul', 'Rojo',
                             'Verde', 'Café', 'Beige', 'Amarillo', 'Naranjo'];

export const COMUNAS = ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Talagante", "Peñaflor", "Padre Hurtado", "El Monte", "Isla de Maipo", "Arica", "Iquique", "Alto Hospicio", "Antofagasta", "Calama", "Copiapó", "La Serena", "Coquimbo", "Ovalle", "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio", "Quillota", "Los Andes", "San Felipe", "Rancagua", "Machalí", "San Fernando", "Curicó", "Talca", "Linares", "Chillán", "Concepción", "Talcahuano", "San Pedro de la Paz", "Hualpén", "Coronel", "Los Ángeles", "Temuco", "Padre Las Casas", "Villarrica", "Valdivia", "Osorno", "Puerto Montt", "Puerto Varas", "Castro", "Coyhaique", "Punta Arenas"];

/* rut, nombres, apellidos, comuna, correo, celular, direccion,
   numero, depto, comunaDom, patente, marca, modelo, anio */
const FILAS = [
  ["30.517.786-5","Sofía Belén","Navarro Mella","Las Condes","sofia.navarro.001@datos-ficticios.test",56900000001,"Avenida Prueba de Datos",110,"Depto. 101","Las Condes","ZZBB01","Toyota","RAV4",2026],
  ["50.168.305-1","Tomás Ignacio","Sepúlveda Rojas","Vitacura","tomas.sepulveda.002@datos-ficticios.test",56900000002,"Pasaje Ensayo Uno",177,"Casa 138","Vitacura","ZZBC01","Volvo","XC60",2024],
  ["30.097.719-7","Martina Paz","Arancibia Cáceres","Providencia","martina.arancibia.003@datos-ficticios.test",56900000003,"Calle Prototipo",244,"Oficina 175","Providencia","ZZBD01","Kia","Soluto",2023],
  ["40.478.884-1","Benjamín Andrés","Valdés Morales","Ñuñoa","benjamin.valdes.004@datos-ficticios.test",56900000004,"Avenida Simulación",311,"Interior 212","Ñuñoa","ZZBF01","Volkswagen","Polo",2023],
  ["40.587.147-5","Valentina Isabel","Paredes Lagos","La Reina","valentina.paredes.005@datos-ficticios.test",56900000005,"Pasaje Código Azul",378,"Torre 249","La Reina","ZZBG01","Mazda","Mazda2",2023],
  ["50.626.102-3","Matías Javier","Contreras Vergara","Lo Barnechea","matias.contreras.006@datos-ficticios.test",56900000006,"Calle Registro Ficticio",445,"Unidad 286","Lo Barnechea","ZZBH01","Mercedes-Benz","GLC",2026],
  ["50.164.163-4","Antonia Javiera","Maldonado Soto","Santiago","antonia.maldonado.007@datos-ficticios.test",56900000007,"Avenida Campo de Pruebas",512,"Depto. 323","Santiago","ZZBJ01","Volvo","XC60",2026],
  ["40.955.286-2","Vicente Alonso","Figueroa Pino","Macul","vicente.figueroa.008@datos-ficticios.test",56900000008,"Pasaje Datos Seguros",579,"Casa 360","Macul","ZZBK01","Audi","Q5",2026],
  ["30.570.440-7","Catalina Andrea","Carvajal Reyes","Peñalolén","catalina.carvajal.009@datos-ficticios.test",56900000009,"Calle Validación Digital",646,"Oficina 397","Peñalolén","ZZBL01","Kia","Soluto",2026],
  ["40.076.917-6","Diego Felipe","Bustamante Cofré","La Florida","diego.bustamante.010@datos-ficticios.test",56900000010,"Avenida Escenario Demo",713,"Interior 434","La Florida","ZZBM01","BMW","X3",2019],
  ["30.859.999-K","Josefa Antonia","Henríquez Bustos","San Miguel","josefa.henriquez.011@datos-ficticios.test",56900000011,"Pasaje Muestra Controlada",780,"Torre 471","San Miguel","ZZCB02","Kia","Soluto",2023],
  ["50.439.312-7","Nicolás Esteban","Leiva Fuentes","Quilicura","nicolas.leiva.012@datos-ficticios.test",56900000012,"Calle Bitácora",847,"Unidad 508","Quilicura","ZZCC02","Toyota","Hilux",2024],
  ["40.364.057-3","Florencia Belén","Cornejo Palma","Las Condes","florencia.cornejo.013@datos-ficticios.test",56900000013,"Avenida Prueba de Datos",914,"Depto. 545","Las Condes","ZZCD02","Chery","Tiggo 2 Pro",2026],
  ["30.767.649-4","Gabriel Alejandro","Barría Salas","Vitacura","gabriel.barria.014@datos-ficticios.test",56900000014,"Pasaje Ensayo Uno",981,"Casa 582","Vitacura","ZZCF02","Chevrolet","Groove",2023],
  ["30.216.339-1","Emilia Fernanda","Jara Cifuentes","Providencia","emilia.jara.015@datos-ficticios.test",56900000015,"Calle Prototipo",1048,"Oficina 619","Providencia","ZZCG02","Toyota","Hilux",2024],
  ["50.568.977-1","Cristóbal Martín","Zúñiga Olivares","Ñuñoa","cristobal.zuniga.016@datos-ficticios.test",56900000016,"Avenida Simulación",1115,"Interior 656","Ñuñoa","ZZCH02","Suzuki","Ignis",2026],
  ["50.262.911-5","Isidora Paz","Tobar Riquelme","La Reina","isidora.tobar.017@datos-ficticios.test",56900000017,"Pasaje Código Azul",1182,"Torre 693","La Reina","ZZCJ02","Renault","Duster",2018],
  ["30.929.290-1","Sebastián Andrés","Mardones Escobar","Lo Barnechea","sebastian.mardones.018@datos-ficticios.test",56900000018,"Calle Registro Ficticio",1249,"Unidad 730","Lo Barnechea","ZZCK02","Toyota","Hilux",2016],
  ["50.494.133-7","Amanda Valentina","Godoy Tapia","Santiago","amanda.godoy.019@datos-ficticios.test",56900000019,"Avenida Campo de Pruebas",1316,"Depto. 767","Santiago","ZZCL02","Nissan","Versa",2024],
  ["40.615.884-5","Francisco Javier","Cárdenas San Martín","Macul","francisco.cardenas.020@datos-ficticios.test",56900000020,"Pasaje Datos Seguros",1383,"Casa 804","Macul","ZZCM02","Toyota","Hilux",2024],
  ["30.566.298-4","Trinidad Elena","Vera Orellana","Peñalolén","trinidad.vera.021@datos-ficticios.test",56900000021,"Calle Validación Digital",1450,"Oficina 841","Peñalolén","ZZDB03","Mitsubishi","L200",2018],
  ["50.222.236-8","Joaquín Tomás","Garrido Baeza","La Florida","joaquin.garrido.022@datos-ficticios.test",56900000022,"Avenida Escenario Demo",1517,"Interior 878","La Florida","ZZDC03","Changan","CS15",2026],
  ["50.505.835-6","Milenka Sofía","Núñez Lillo","San Miguel","milenka.nunez.023@datos-ficticios.test",56900000023,"Pasaje Muestra Controlada",1584,"Torre 915","San Miguel","ZZDD03","BMW","X3",2024],
  ["50.689.168-K","Álvaro Nicolás","Manríquez Acuña","Quilicura","alvaro.manriquez.024@datos-ficticios.test",56900000024,"Calle Bitácora",1651,"Unidad 952","Quilicura","ZZDF03","Ford","Territory",2026],
  ["40.365.694-1","Manuela Ignacia","Molina Carreño","Las Condes","manuela.molina.025@datos-ficticios.test",56900000025,"Avenida Prueba de Datos",1718,"Depto. 989","Las Condes","ZZDG03","Toyota","Hilux",2019],
  ["30.137.694-4","Pablo Esteban","Sanhueza Araya","Vitacura","pablo.sanhueza.026@datos-ficticios.test",56900000026,"Pasaje Ensayo Uno",1785,"Casa 1026","Vitacura","ZZDH03","Ford","Territory",2023],
  ["40.511.524-7","Renata Josefina","Roco Cisternas","Providencia","renata.roco.027@datos-ficticios.test",56900000027,"Calle Prototipo",1852,"Oficina 1063","Providencia","ZZDJ03","Suzuki","Baleno",2023],
  ["30.974.264-8","Felipe Ignacio","Bravo Neira","Ñuñoa","felipe.bravo.028@datos-ficticios.test",56900000028,"Avenida Simulación",1919,"Interior 1100","Ñuñoa","ZZDK03","Hyundai","Venue",2026],
  ["40.342.294-0","Maite Alejandra","Alarcón Quezada","La Reina","maite.alarcon.029@datos-ficticios.test",56900000029,"Pasaje Código Azul",1986,"Torre 1137","La Reina","ZZDL03","Toyota","RAV4",2019],
  ["50.013.808-4","Samuel Matías","Ávila Villalobos","Lo Barnechea","samuel.avila.030@datos-ficticios.test",56900000030,"Calle Registro Ficticio",2053,"Unidad 1174","Lo Barnechea","ZZDM03","Citroën","C3",2026],
  ["40.354.240-7","Olivia Camila","Campos Lemaitre","Santiago","olivia.campos.031@datos-ficticios.test",56900000031,"Avenida Campo de Pruebas",2120,"Depto. 1211","Santiago","ZZFB04","Suzuki","Ignis",2024],
  ["50.984.931-5","Lucas Benjamín","Poblete Miranda","Macul","lucas.poblete.032@datos-ficticios.test",56900000032,"Pasaje Datos Seguros",2187,"Casa 1248","Macul","ZZFC04","Kia","Soluto",2026],
  ["50.999.959-7","Amparo Isabel","Lorca Carrasco","Peñalolén","amparo.lorca.033@datos-ficticios.test",56900000033,"Calle Validación Digital",2254,"Oficina 1285","Peñalolén","ZZFD04","Jeep","Grand Cherokee",2026],
  ["50.482.302-4","Daniel Ricardo","Sáez Bello","La Florida","daniel.saez.034@datos-ficticios.test",56900000034,"Avenida Escenario Demo",2321,"Interior 1322","La Florida","ZZFF04","Toyota","Land Cruiser",2026],
  ["30.230.072-0","Julieta Fernanda","Villagra Salgado","San Miguel","julieta.villagra.035@datos-ficticios.test",56900000035,"Pasaje Muestra Controlada",2388,"Torre 1359","San Miguel","ZZFG04","Renault","Duster",2026],
  ["30.886.652-1","Simón Eduardo","Gómez Pizarro","Quilicura","simon.gomez.036@datos-ficticios.test",56900000036,"Calle Bitácora",2455,"Unidad 1396","Quilicura","ZZFH04","Chevrolet","Groove",2026],
  ["40.790.926-7","Elena María","Labbé Romo","Las Condes","elena.labbe.037@datos-ficticios.test",56900000037,"Avenida Prueba de Datos",2522,"Depto. 1433","Las Condes","ZZFJ04","Toyota","RAV4",2017],
  ["40.900.563-2","Maximiliano José","Donoso Mansilla","Vitacura","maximiliano.donoso.038@datos-ficticios.test",56900000038,"Pasaje Ensayo Uno",2589,"Casa 1470","Vitacura","ZZFK04","Ford","Territory",2026],
  ["30.007.927-K","Constanza Victoria","Silva Peña","Providencia","constanza.silva.039@datos-ficticios.test",56900000039,"Calle Prototipo",2656,"Oficina 1507","Providencia","ZZFL04","Mitsubishi","L200",2026],
  ["50.749.150-2","Rafael Ignacio","Peñaloza Vidal","Ñuñoa","rafael.penaloza.040@datos-ficticios.test",56900000040,"Avenida Simulación",2723,"Interior 1544","Ñuñoa","ZZFM04","Range Rover","Evoque",2026],
  ["50.664.731-2","Camila Andrea","Torres Gallardo","La Reina","camila.torres.041@datos-ficticios.test",56900000041,"Pasaje Código Azul",2790,"Torre 1581","La Reina","ZZGB05","Kia","Morning",2023],
  ["50.265.872-7","Ignacio Felipe","Espinoza Farfán","Lo Barnechea","ignacio.espinoza.042@datos-ficticios.test",56900000042,"Calle Registro Ficticio",2857,"Unidad 1618","Lo Barnechea","ZZGC05","Mitsubishi","L200",2026],
  ["50.960.902-0","Paula Beatriz","Abarca Del Río","Santiago","paula.abarca.043@datos-ficticios.test",56900000043,"Avenida Campo de Pruebas",2924,"Depto. 1655","Santiago","ZZGD05","Porsche","Macan",2024],
  ["40.113.261-9","Rodrigo Alejandro","Muñoz Hidalgo","Macul","rodrigo.munoz.044@datos-ficticios.test",56900000044,"Pasaje Datos Seguros",2991,"Casa 1692","Macul","ZZGF05","Chery","Tiggo 2 Pro",2026],
  ["40.182.361-1","Daniela Paz","Parra Cañete","Peñalolén","daniela.parra.045@datos-ficticios.test",56900000045,"Calle Validación Digital",3058,"Oficina 1729","Peñalolén","ZZGG05","Volkswagen","Polo",2026],
  ["40.428.657-9","Andrés Javier","Bahamondes Rivas","La Florida","andres.bahamondes.046@datos-ficticios.test",56900000046,"Avenida Escenario Demo",3125,"Interior 1766","La Florida","ZZGH05","Hyundai","Grand i10",2026],
  ["40.828.191-1","María José","Serrano Lara","San Miguel","maria.serrano.047@datos-ficticios.test",56900000047,"Pasaje Muestra Controlada",3192,"Torre 1803","San Miguel","ZZGJ05","Mercedes-Benz","GLC",2024],
  ["30.183.179-K","Eduardo Tomás","Bórquez Rendic","Quilicura","eduardo.borquez.048@datos-ficticios.test",56900000048,"Calle Bitácora",3259,"Unidad 1840","Quilicura","ZZGK05","Mitsubishi","L200",2026],
  ["30.992.714-1","Josefina Elena","Sanhueza Mora","Las Condes","josefina.sanhueza.049@datos-ficticios.test",56900000049,"Avenida Prueba de Datos",3326,"Depto. 1877","Las Condes","ZZGL05","Peugeot","208",2026],
  ["40.791.475-9","Gonzalo Martín","Mella Rojas","Vitacura","gonzalo.mella.050@datos-ficticios.test",56900000050,"Pasaje Ensayo Uno",3393,"Casa 1914","Vitacura","ZZGM05","Toyota","Hilux",2026],
  ["30.873.786-1","Mariana Belén","Valenzuela Bustos","Providencia","mariana.valenzuela.051@datos-ficticios.test",56900000051,"Calle Prototipo",3460,"Oficina 1951","Providencia","ZZHB06","Mitsubishi","L200",2024],
  ["50.666.161-7","Héctor Alonso","Oyarzún Cea","Ñuñoa","hector.oyarzun.052@datos-ficticios.test",56900000052,"Avenida Simulación",3527,"Interior 1988","Ñuñoa","ZZHC06","Kia","Soluto",2026],
  ["50.544.922-3","Alejandra Inés","Santander Vera","La Reina","alejandra.santander.053@datos-ficticios.test",56900000053,"Pasaje Código Azul",3594,"Torre 126","La Reina","ZZHD06","Fiat","Pulse",2026],
  ["50.826.241-8","Javier Matías","Hernández Paz","Lo Barnechea","javier.hernandez.054@datos-ficticios.test",56900000054,"Calle Registro Ficticio",3661,"Unidad 163","Lo Barnechea","ZZHF06","Honda","Fit",2019],
  ["30.830.635-6","Carolina Isabel","Cifuentes Núñez","Santiago","carolina.cifuentes.055@datos-ficticios.test",56900000055,"Avenida Campo de Pruebas",3728,"Depto. 200","Santiago","ZZHG06","Citroën","C3",2024],
  ["40.215.919-7","Bruno Esteban","Durán Silva","Macul","bruno.duran.056@datos-ficticios.test",56900000056,"Pasaje Datos Seguros",3795,"Casa 237","Macul","ZZHH06","Kia","K3",2026],
  ["30.547.008-2","Lorena Paz","Gutiérrez Olate","Peñalolén","lorena.gutierrez.057@datos-ficticios.test",56900000057,"Calle Validación Digital",3862,"Oficina 274","Peñalolén","ZZHJ06","Toyota","Hilux",2026],
  ["30.039.104-4","Manuel Andrés","Farias Riquelme","La Florida","manuel.farias.058@datos-ficticios.test",56900000058,"Avenida Escenario Demo",3929,"Interior 311","La Florida","ZZHK06","MG","ZS",2024],
  ["40.902.008-9","Verónica Alejandra","Bravo Solís","San Miguel","veronica.bravo.059@datos-ficticios.test",56900000059,"Pasaje Muestra Controlada",3996,"Torre 348","San Miguel","ZZHL06","Toyota","RAV4",2024],
  ["40.574.550-K","Ricardo Javier","Martínez Parada","Quilicura","ricardo.martinez.060@datos-ficticios.test",56900000060,"Calle Bitácora",4063,"Unidad 385","Quilicura","ZZHM06","Mitsubishi","L200",2017],
  ["50.053.482-6","Claudia Fernanda","Rojas Llanos","Las Condes","claudia.rojas.061@datos-ficticios.test",56900000061,"Avenida Prueba de Datos",4130,"Depto. 422","Las Condes","ZZJB07","Ford","Territory",2026],
  ["30.891.909-9","Mauricio Felipe","Castro Mella","Vitacura","mauricio.castro.062@datos-ficticios.test",56900000062,"Pasaje Ensayo Uno",4197,"Casa 459","Vitacura","ZZJC07","Mazda","Mazda2",2018],
  ["40.401.856-6","Viviana Isabel","Rivera Maldonado","Providencia","viviana.rivera.063@datos-ficticios.test",56900000063,"Calle Prototipo",4264,"Oficina 496","Providencia","ZZJD07","Ford","Territory",2023],
  ["50.520.228-7","Pablo Andrés","Zamora Oliva","Ñuñoa","pablo.zamora.064@datos-ficticios.test",56900000064,"Avenida Simulación",4331,"Interior 533","Ñuñoa","ZZJF07","Chevrolet","Onix",2023],
  ["50.412.164-K","Macarena Sofía","Aguilera Rebolledo","La Reina","macarena.aguilera.065@datos-ficticios.test",56900000065,"Pasaje Código Azul",4398,"Torre 570","La Reina","ZZJG07","BMW","X5",2026],
  ["40.827.574-1","Ángel Eduardo","Correa Palacios","Lo Barnechea","angel.correa.066@datos-ficticios.test",56900000066,"Calle Registro Ficticio",4465,"Unidad 607","Lo Barnechea","ZZJH07","Toyota","Hilux",2017],
  ["40.865.638-9","Francisca Elena","Méndez Rojas","Santiago","francisca.mendez.067@datos-ficticios.test",56900000067,"Avenida Campo de Pruebas",4532,"Depto. 644","Santiago","ZZJJ07","Chery","Tiggo 2 Pro",2024],
  ["30.050.097-8","Patricio Javier","Barrera Soto","Macul","patricio.barrera.068@datos-ficticios.test",56900000068,"Pasaje Datos Seguros",4599,"Casa 681","Macul","ZZJK07","Toyota","Hilux",2026],
  ["40.917.598-8","Marcela Paz","Gajardo Pavez","Peñalolén","marcela.gajardo.069@datos-ficticios.test",56900000069,"Calle Validación Digital",4666,"Oficina 718","Peñalolén","ZZJL07","Toyota","RAV4",2026],
  ["30.212.424-8","Hernán Ignacio","San Martín Cortés","La Florida","hernan.sanmartin.070@datos-ficticios.test",56900000070,"Avenida Escenario Demo",4733,"Interior 755","La Florida","ZZJM07","Lexus","RX",2023],
  ["30.866.084-2","Paola Andrea","Beltrán Vásquez","San Miguel","paola.beltran.071@datos-ficticios.test",56900000071,"Pasaje Muestra Controlada",4800,"Torre 792","San Miguel","ZZKB08","BMW","X3",2026],
  ["30.301.073-4","Felipe Martín","Villanueva Mora","Quilicura","felipe.villanueva.072@datos-ficticios.test",56900000072,"Calle Bitácora",4867,"Unidad 829","Quilicura","ZZKC08","Toyota","RAV4",2026],
  ["30.455.527-0","Andrea Belén","Gálvez Valdés","Las Condes","andrea.galvez.073@datos-ficticios.test",56900000073,"Avenida Prueba de Datos",4934,"Depto. 866","Las Condes","ZZKD08","MG","ZS",2026],
  ["40.131.372-9","Carlos Andrés","Cordero Arriagada","Vitacura","carlos.cordero.074@datos-ficticios.test",56900000074,"Pasaje Ensayo Uno",5001,"Casa 903","Vitacura","ZZKF08","Nissan","Versa",2026],
  ["50.934.427-2","Beatriz Elena","Riquelme Díaz","Providencia","beatriz.riquelme.075@datos-ficticios.test",56900000075,"Calle Prototipo",5068,"Oficina 940","Providencia","ZZKG08","Chevrolet","Groove",2026],
  ["50.599.316-0","Oscar Javier","Pino Jara","Ñuñoa","oscar.pino.076@datos-ficticios.test",56900000076,"Avenida Simulación",5135,"Interior 977","Ñuñoa","ZZKH08","Suzuki","Baleno",2023],
  ["30.564.749-7","Natalia Paz","Lagos Roa","La Reina","natalia.lagos.077@datos-ficticios.test",56900000077,"Pasaje Código Azul",5202,"Torre 1014","La Reina","ZZKJ08","Chevrolet","Groove",2026],
  ["50.179.333-7","Roberto Felipe","Esquivel Arancibia","Lo Barnechea","roberto.esquivel.078@datos-ficticios.test",56900000078,"Calle Registro Ficticio",5269,"Unidad 1051","Lo Barnechea","ZZKK08","Toyota","RAV4",2024],
  ["30.154.370-0","Bárbara Isabel","Yáñez Carvajal","Santiago","barbara.yanez.079@datos-ficticios.test",56900000079,"Avenida Campo de Pruebas",5336,"Depto. 1088","Santiago","ZZKL08","Toyota","Hilux",2018],
  ["30.086.326-4","Cristian Esteban","Pedreros Sepúlveda","Macul","cristian.pedreros.080@datos-ficticios.test",56900000080,"Pasaje Datos Seguros",5403,"Casa 1125","Macul","ZZKM08","Volvo","XC90",2026],
  ["40.924.643-5","Mónica Alejandra","Bustos Alfaro","Peñalolén","monica.bustos.081@datos-ficticios.test",56900000081,"Calle Validación Digital",5470,"Oficina 1162","Peñalolén","ZZLB09","Kia","Morning",2026],
  ["30.954.134-0","Jorge Ignacio","Villalobos Roco","La Florida","jorge.villalobos.082@datos-ficticios.test",56900000082,"Avenida Escenario Demo",5537,"Interior 1199","La Florida","ZZLC09","Nissan","Versa",2019],
  ["40.636.042-3","Paulina Fernanda","Cortés Figueroa","San Miguel","paulina.cortes.083@datos-ficticios.test",56900000083,"Pasaje Muestra Controlada",5604,"Torre 1236","San Miguel","ZZLD09","Mitsubishi","L200",2019],
  ["50.761.174-5","Luis Alonso","Araya Mardones","Quilicura","luis.araya.084@datos-ficticios.test",56900000084,"Calle Bitácora",5671,"Unidad 1273","Quilicura","ZZLF09","Audi","Q7",2026],
  ["40.344.626-2","Silvia Belén","Saavedra Zúñiga","Las Condes","silvia.saavedra.085@datos-ficticios.test",56900000085,"Avenida Prueba de Datos",5738,"Depto. 1310","Las Condes","ZZLG09","Chery","Tiggo 2 Pro",2026],
  ["30.201.557-0","Fernando Javier","Ramos Chávez","Vitacura","fernando.ramos.086@datos-ficticios.test",56900000086,"Pasaje Ensayo Uno",5805,"Casa 1347","Vitacura","ZZLH09","Chevrolet","Onix",2026],
  ["50.046.099-7","Patricia Isabel","Mondaca Paredes","Providencia","patricia.mondaca.087@datos-ficticios.test",56900000087,"Calle Prototipo",5872,"Oficina 1384","Providencia","ZZLJ09","Audi","Q5",2024],
  ["40.345.975-5","Sergio Andrés","Poblete Vera","Ñuñoa","sergio.poblete.088@datos-ficticios.test",56900000088,"Avenida Simulación",5939,"Interior 1421","Ñuñoa","ZZLK09","Mitsubishi","L200",2024],
  ["30.471.030-6","Rocío Paz","Echeverría Molina","La Reina","rocio.echeverria.089@datos-ficticios.test",56900000089,"Pasaje Código Azul",6006,"Torre 1458","La Reina","ZZLL09","Chery","Tiggo 2 Pro",2024],
  ["40.557.596-5","Matías Eduardo","Mora Alarcón","Lo Barnechea","matias.mora.090@datos-ficticios.test",56900000090,"Calle Registro Ficticio",6073,"Unidad 1495","Lo Barnechea","ZZLM09","Suzuki","Baleno",2026],
  ["30.659.437-0","Teresa Elena","Paz Cáceres","Santiago","teresa.paz.091@datos-ficticios.test",56900000091,"Avenida Campo de Pruebas",6140,"Depto. 1532","Santiago","ZZMB10","Suzuki","Baleno",2026],
  ["50.470.092-5","Eduardo Martín","Vega Villar","Macul","eduardo.vega.092@datos-ficticios.test",56900000092,"Pasaje Datos Seguros",6207,"Casa 1569","Macul","ZZMC10","Chevrolet","Groove",2023],
  ["40.219.428-6","Lorena Andrea","Téllez Cornejo","Peñalolén","lorena.tellez.093@datos-ficticios.test",56900000093,"Calle Validación Digital",6274,"Oficina 1606","Peñalolén","ZZMD10","Renault","Duster",2023],
  ["50.148.944-1","Cristóbal Javier","Olivares Garrido","La Florida","cristobal.olivares.094@datos-ficticios.test",56900000094,"Avenida Escenario Demo",6341,"Interior 1643","La Florida","ZZMF10","Toyota","Land Cruiser Prado",2023],
  ["30.707.630-6","Susana Belén","Lillo Cárcamo","San Miguel","susana.lillo.095@datos-ficticios.test",56900000095,"Pasaje Muestra Controlada",6408,"Torre 1680","San Miguel","ZZMG10","Suzuki","Baleno",2026],
  ["50.711.200-5","Alejandro Felipe","Fuentes Leiva","Quilicura","alejandro.fuentes.096@datos-ficticios.test",56900000096,"Calle Bitácora",6475,"Unidad 1717","Quilicura","ZZMH10","Hyundai","Grand i10",2024],
  ["40.451.208-0","Inés Paz","Baeza Lagos","Las Condes","ines.baeza.097@datos-ficticios.test",56900000097,"Avenida Prueba de Datos",6542,"Depto. 1754","Las Condes","ZZMJ10","Toyota","Land Cruiser Prado",2026],
  ["50.547.253-5","Nicolás Andrés","Salas Pino","Vitacura","nicolas.salas.098@datos-ficticios.test",56900000098,"Pasaje Ensayo Uno",6609,"Casa 1791","Vitacura","ZZMK10","Peugeot","208",2024],
  ["30.885.215-6","Cecilia Elena","Miranda Tobar","Providencia","cecilia.miranda.099@datos-ficticios.test",56900000099,"Calle Prototipo",6676,"Oficina 1828","Providencia","ZZML10","Mazda","Mazda2",2026],
  ["40.016.058-9","Tomás Martín","Vidal Araya","Ñuñoa","tomas.vidal.100@datos-ficticios.test",56900000100,"Avenida Simulación",6743,"Interior 1865","Ñuñoa","ZZMM10","Toyota","RAV4",2018],
  ["33.333.333-3","Valeria Paz","Montes Leiva","Providencia","valeria.montes.101@datos-ficticios.test",56900000101,"Avenida Registro Ficticio",3333,"Depto. 704","Providencia","ZZNB11","Porsche","Macan",2026],
  ["44.444.444-4","Felipe Andrés","Cifuentes Mora","Las Condes","felipe.cifuentes.102@datos-ficticios.test",56900000102,"Pasaje Muestra Controlada",4444,"Casa 12","Las Condes","ZZNC11","Mercedes-Benz","GLC",2026],
  ["55.555.555-5","Camila Elena","Rojas Valdés","Ñuñoa","camila.rojas.103@datos-ficticios.test",56900000103,"Calle Validación Digital",5555,"Depto. 309","Ñuñoa","ZZND11","Nissan","Versa",2023]
];

const CAMPOS = ['rut', 'nombres', 'apellidos', 'comuna', 'correo', 'celular',
                'direccion', 'numero', 'depto', 'comunaDom', 'patente',
                'marca', 'modelo', 'anio'];

/** Los registros, como objetos con nombre en vez de posiciones.

   Se declara el tipo porque el `reduce` parte de un `{}` y el
   verificador pierde la forma: sin esto, `cliente.nombres` es un campo
   que él no sabe que existe, y un campo mal escrito pasa sin aviso.

   [DATOS FICTICIOS] Correos @datos-ficticios.test, teléfonos 5690000000x
   y patentes ZZxx. Es deliberado desde el primer día: el prototipo nunca
   trata datos personales de verdad.

   @type {import('./tipos.js').Cliente[]} */
export const CLIENTES = [
  /* Los dos de demostración van primero: son los que el cotizador
     ofrece bajo el campo de RUT, y los que se dictan en una reunión. */
  ...CLIENTES_DEMO,
  ...FILAS.map(f => CAMPOS.reduce((o, c, i) => (o[c] = f[i], o), {}))
];

export const normalizaRut = r =>
  String(r || '').replace(/[^0-9kK]/g, '').toUpperCase();

export const normalizaPatente = p =>
  String(p || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

const POR_RUT = new Map(CLIENTES.map(c => [normalizaRut(c.rut), c]));
const POR_PATENTE = new Map(CLIENTES.map(c => [normalizaPatente(c.patente), c]));

/** Busca por RUT. Devuelve null si no está, y el verificador obliga a
   comprobarlo antes de leer un campo.
   @param {string} rut
   @returns {import('./tipos.js').Cliente|null} */
export const buscaCliente = rut => POR_RUT.get(normalizaRut(rut)) || null;
export const buscaPorPatente = p => POR_PATENTE.get(normalizaPatente(p)) || null;

/* Catálogo de marcas y modelos. Sale de la base de prueba; en producción
   viene del maestro de vehículos. */
export const MARCAS = [...new Set(CLIENTES.map(c => c.marca))].sort();
export const modelosDe = marca =>
  [...new Set(CLIENTES.filter(c => c.marca === marca).map(c => c.modelo))].sort();

/* Validación de RUT chileno — módulo 11 */
export function rutValido(rut) {
  const r = normalizaRut(rut);
  if (r.length < 7 || r.length > 9) return false;
  const cuerpo = r.slice(0, -1), dv = r.slice(-1);
  if (!/^[0-9]+$/.test(cuerpo)) return false;
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const dvOk = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvOk;
}

/* Sin puntos y con guion: 12345678-9. Es como se escribe el RUT en
   Chile y es lo que espera el resto de los sistemas. */
export function formateaRut(rut) {
  const r = normalizaRut(rut);
  if (r.length < 2) return r;
  return r.slice(0, -1) + '-' + r.slice(-1);
}

/* Patente chilena: 4 letras + 2 dígitos (BBBB·11) o 2 letras + 4 dígitos */
export const patenteValida = p => {
  const v = normalizaPatente(p);
  return /^[A-Z]{4}[0-9]{2}$/.test(v) || /^[A-Z]{2}[0-9]{4}$/.test(v);
};

export const formateaPatente = p => {
  const v = normalizaPatente(p).slice(0, 6);
  return v.length > 4 ? v.slice(0, 4) + '·' + v.slice(4) : v;
};

export const clp = n =>
  '$' + Math.round(n).toLocaleString('es-CL', { maximumFractionDigits: 0 });

export const ufTxt = n =>
  'UF ' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const clpExacto = n =>
  '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
