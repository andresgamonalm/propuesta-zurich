/* =====================================================================
   Los dos clientes para mostrar el cotizador
   ---------------------------------------------------------------------
   La base tiene un centenar de registros que sirven para probar pero no
   para demostrar: nadie se acuerda de «30.517.786-5» frente a una
   pantalla. Estos dos están hechos para dictarse:

       10111222-5  ·  AAAA11
       20111222-2  ·  BBBB22

   El dígito verificador es el que exige el módulo 11 (rutValido() en
   datos.js). Nombres y datos inventados: correos @datos-ficticios.test y
   teléfonos 5690000000x, como el resto de la base.
   ===================================================================== */

/** Van primero en la lista: son los que se ofrecen bajo el campo de RUT.
    @type {import('./tipos.js').Cliente[]} */
export const CLIENTES_DEMO = [
  {
    rut: '10111222-5',
    nombres: 'Daniela Andrea', apellidos: 'Fuentes Soto',
    comuna: 'Providencia',
    correo: 'daniela.fuentes.d1@datos-ficticios.test',
    celular: 56900000201,
    direccion: 'Avenida de Prueba', numero: 100, depto: '',
    comunaDom: 'Providencia',
    patente: 'AAAA11',
    marca: 'Toyota', modelo: 'RAV4', anio: 2024
  },
  {
    rut: '20111222-2',
    nombres: 'Ignacio Andrés', apellidos: 'Muñoz Vera',
    comuna: 'Las Condes',
    correo: 'ignacio.munoz.d2@datos-ficticios.test',
    celular: 56900000202,
    direccion: 'Calle del Ensayo', numero: 200, depto: 'Depto. 42',
    comunaDom: 'Las Condes',
    patente: 'BBBB22',
    marca: 'Volvo', modelo: 'XC60', anio: 2023
  }
];
