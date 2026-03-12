// src/modules/sales/hooks/useSiatStatus.js
// Traducción fiel de useSiatStatus.ts de SIAT-Facturación
// Detecta estado de conexión SIAT y evento activo para informar al vendedor

import { useState, useEffect, useCallback } from 'react';
import { eventosService } from '../services/eventosService';
import { eventBus } from '../utils/eventBus';

/**
 * Hook que monitorea el estado de SIAT en tiempo real.
 *
 * @param {number} sucursal  - ID de sucursal
 * @param {number} puntoVenta - ID de punto de venta
 * @returns {{
 *   siatOnline: boolean|null,
 *   eventoActivo: object|null,
 *   loading: boolean,
 *   refresh: Function,
 *   isContingencia: boolean
 * }}
 */
export function useSiatStatus(sucursal, puntoVenta) {
  const [siatOnline, setSiatOnline] = useState(null);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (sucursal === null || sucursal === undefined) return;
    if (puntoVenta === null || puntoVenta === undefined) return;

    setLoading(true);
    try {
      const [conexion, evento] = await Promise.all([
        eventosService.verificarConexion(sucursal, puntoVenta),
        eventosService.obtenerEventoActivo(sucursal, puntoVenta),
      ]);

      setSiatOnline(conexion.siatOnline);
      setEventoActivo(
        evento.eventoActivo && evento.evento ? evento.evento : null
      );
    } catch (err) {
      console.error('❌ Error obteniendo estado SIAT:', err);
      setSiatOnline(false);
      setEventoActivo(null);
    } finally {
      setLoading(false);
    }
  }, [sucursal, puntoVenta]);

  // Carga inicial y cuando cambia sucursal/puntoVenta
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Escuchar eventos del bus para refrescar estado automáticamente
  useEffect(() => {
    const handleEventoChanged = () => {
      console.log('🔄 EventBus: Refrescando estado SIAT...');
      refresh();
    };

    eventBus.on('evento-cerrado', handleEventoChanged);
    eventBus.on('evento-creado', handleEventoChanged);
    eventBus.on('cufd-updated', handleEventoChanged);

    return () => {
      eventBus.off('evento-cerrado', handleEventoChanged);
      eventBus.off('evento-creado', handleEventoChanged);
      eventBus.off('cufd-updated', handleEventoChanged);
    };
  }, [refresh]);

  return {
    siatOnline,
    eventoActivo,
    loading,
    refresh,
    // Contingencia = eventos 5, 6 o 7 (requieren datos de talonario)
    isContingencia:
      !!eventoActivo &&
      eventoActivo.eventoId >= 5 &&
      eventoActivo.eventoId <= 7,
  };
}

export default useSiatStatus;