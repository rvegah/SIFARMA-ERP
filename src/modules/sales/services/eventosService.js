// src/modules/sales/services/eventosService.js
// Traducción fiel de eventosService.ts de SIAT-Facturación
// Usa siatApiClient (apunta a VITE_SIAT_API_URL = api-facturacion.farmadinamica.com.bo)

import siatApiClient from './siatApiClient';

export const eventosService = {
  // ─── LISTAR EVENTOS ────────────────────────────────────────────────────────
  listarEventos: async (sucursalId, puntoVentaId, pagina = 1, limite = 25) => {
    const res = await siatApiClient.get('/Eventos', {
      params: { sucursalId, puntoVentaId, pagina, limite },
    });
    return res.data;
  },

  // ─── OBTENER EVENTO POR ID ─────────────────────────────────────────────────
  obtenerEvento: async (id) => {
    const res = await siatApiClient.get(`/Eventos/${id}`);
    return res.data;
  },

  // ─── OBTENER EVENTO ACTIVO ─────────────────────────────────────────────────
  obtenerEventoActivo: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get('/Eventos/activo', {
      params: { sucursalId, puntoVentaId },
    });
    return res.data;
  },

  // ─── REGISTRAR NUEVO EVENTO ────────────────────────────────────────────────
  registrarEvento: async (request) => {
    const res = await siatApiClient.post('/Eventos/registrar', request);
    return res.data;
  },

  // ─── CERRAR EVENTO ─────────────────────────────────────────────────────────
  cerrarEvento: async (id, request = {}) => {
    const res = await siatApiClient.put(`/Eventos/${id}/cerrar`, request);
    return res.data;
  },

  // ─── ESTADÍSTICAS DEL EVENTO ───────────────────────────────────────────────
  obtenerEstadisticas: async (id) => {
    const res = await siatApiClient.get(`/Eventos/${id}/estadisticas`);
    return res.data;
  },

  // ─── ENVIAR PAQUETES DE FACTURAS ───────────────────────────────────────────
  enviarPaquetes: async (id) => {
    const res = await siatApiClient.post(`/Eventos/${id}/enviar-paquetes`);
    return res.data;
  },

  // ─── CONSULTAR EVENTOS EN SIAT POR FECHA ──────────────────────────────────
  consultarEventosSiat: async (sucursalId, puntoVentaId, fecha) => {
    const res = await siatApiClient.post('/Eventos/consultar', {
      sucursalId,
      puntoVentaId,
      fecha,
    });
    return res.data;
  },

  // ─── VERIFICAR CONEXIÓN CON SIAT ──────────────────────────────────────────
  verificarConexion: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get('/Eventos/verificar-conexion', {
      params: { sucursalId, puntoVentaId },
    });
    return res.data;
  },

  // ─── VERIFICAR SINCRONIZACIÓN DE HORA ─────────────────────────────────────
  verificarSincronizacion: async () => {
    const res = await siatApiClient.get('/Eventos/debug/sincronizacion');
    return res.data;
  },

  // ─── CUFDS DISPONIBLES PARA CONTINGENCIA ──────────────────────────────────
  obtenerCufdsDisponibles: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get('/Siat/cufds/disponibles', {
      params: { sucursalId, puntoVentaId },
    });
    return res.data.data || [];
  },

  // ─── GENERAR NUEVO CUFD (para cerrar eventos) ─────────────────────────────
  generarCufd: async (sucursalId, puntoVentaId) => {
    const res = await siatApiClient.get('/Siat/cufd', {
      params: { sucursalId, puntoVentaId, renew: true },
    });
    return res.data;
  },

  // ─── FORZAR CIERRE DE EVENTO ──────────────────────────────────────────────
  forzarCerrarEvento: async (id) => {
    const res = await siatApiClient.put(`/Eventos/${id}/forzar-cierre`);
    return res.data;
  },
};