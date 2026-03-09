// src/utils/eventBus.js
// Patrón pub/sub simple para comunicación entre módulos sin prop drilling
// Traducción fiel del eventBus.ts de SIAT-Facturación

const listeners = {};

export const eventBus = {
  /**
   * Suscribirse a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a ejecutar
   */
  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },

  /**
   * Desuscribirse de un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a remover
   */
  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter((cb) => cb !== callback);
  },

  /**
   * Emitir un evento
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos opcionales
   */
  emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach((cb) => cb(data));
  },
};