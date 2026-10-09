// @ts-check
/**
 * Sesión del prototipo.
 *
 * DEMOSTRACIÓN, NO SEGURIDAD. Esto vive en el navegador y cualquiera puede
 * saltárselo: sirve para mostrar la experiencia de acceso y los dos perfiles
 * que pide el brief. En producción el acceso lo resuelve la sesión privada de
 * Banco BICE, un inicio de sesión único o un servidor; es una de las
 * «decisiones necesarias antes de producción» del brief.
 *
 * Perfiles (brief §Acceso y perfiles): administrador reservado inicialmente a
 * hola@andresgamonal.com; el resto de los correos, usuario.
 */
import { guardar, leer, borrar } from './almacen.js';

export const CORREO_ADMIN = 'hola@andresgamonal.com';
/** Minutos sin actividad antes de dar la sesión por vencida. */
export const MINUTOS_INACTIVIDAD = 120;

const CLAVE = 'sesion';

/** @typedef {{ correo: string, perfil: 'administrador'|'usuario', inicio: number, ultimo: number }} Sesion */

/** @param {string} correo */
export function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

/** @param {string} correo @returns {Sesion} */
export function iniciar(correo) {
  const limpio = correo.trim().toLowerCase();
  const ahora = Date.now();
  /** @type {Sesion} */
  const sesion = {
    correo: limpio,
    perfil: limpio === CORREO_ADMIN ? 'administrador' : 'usuario',
    inicio: ahora,
    ultimo: ahora,
  };
  guardar(CLAVE, sesion, 1);
  return sesion;
}

export function cerrar() { borrar(CLAVE); }

/**
 * @returns {{ estado: 'activa', sesion: Sesion } | { estado: 'vencida' } | { estado: 'ninguna' }}
 */
export function consultar() {
  /** @type {Sesion|null} */
  const s = leer(CLAVE, null);
  if (!s) return { estado: 'ninguna' };
  if (Date.now() - s.ultimo > MINUTOS_INACTIVIDAD * 60e3) {
    borrar(CLAVE);
    return { estado: 'vencida' };
  }
  s.ultimo = Date.now();
  guardar(CLAVE, s, 1);
  return { estado: 'activa', sesion: s };
}

/** Ruta actual, para volver a ella después de ingresar. */
export function rutaActual() {
  return location.pathname + location.search + location.hash;
}

/**
 * Ruta de vuelta segura: solo rutas internas, nunca una URL externa que
 * alguien haya puesto en el parámetro.
 * @param {string|null} vuelta
 */
export function vueltaSegura(vuelta) {
  if (!vuelta || !vuelta.startsWith('/') || vuelta.startsWith('//') || vuelta.startsWith('/login')) return '/home/';
  return vuelta;
}

/** @param {Sesion} s */
export function iniciales(s) {
  const usuario = s.correo.split('@')[0].replace(/[^a-záéíóúñ]/gi, ' ').trim();
  const partes = usuario.split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? 'U') + (partes[1]?.[0] ?? '');
  return letras.toUpperCase();
}
