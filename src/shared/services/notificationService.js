import pharmacyApiClient from "../../services/api/pharmacyApiClient";

const notificationService = {
  /**
   * Fetch current notifications for the notification panel (bell)
   * GET /api/farmalink-farmacia/Traspasos/NotificacionesTraspasos?CodigoSucursal={id}
   */
  getNotificaciones: async (codigoSucursal) => {
    try {
      console.log("NOTIFICACIONESSS------------------------------------------------");
      const response = await pharmacyApiClient.get("/Traspasos/NotificacionesTraspasos", {
        params: { CodigoSucursal: codigoSucursal },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Fetch all notifications for the full notifications page
   * GET /api/farmalink-farmacia/Traspasos/BuscarNotificacionesTraspasos?CodigoSucursal={id}
   */
  buscarNotificaciones: async (codigoSucursal) => {
    try {
      const response = await pharmacyApiClient.get("/Traspasos/BuscarNotificacionesTraspasos", {
        params: { CodigoSucursal: codigoSucursal },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching notifications:", error);
      throw error;
    }
  },

  /**
   * Fetch transfer details for a notification
   * GET /api/farmalink-farmacia/Traspasos/EditarTraspaso?NumeroTraspaso={numeroTraspaso}
   */
  getDetalleTraspaso: async (numeroTraspaso) => {
    try {
      const response = await pharmacyApiClient.get("/Traspasos/EditarTraspaso", {
        params: { NumeroTraspaso: numeroTraspaso },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching transfer details:", error);
      throw error;
    }
  },

  /**
   * Change status of a transfer
   * PUT /api/farmalink-farmacia/Traspasos/CambiarEstado?NumeroTraspaso={numero}&EstadoTraspaso={estado}
   */
  cambiarEstadoTraspaso: async (numeroTraspaso, estadoTraspaso) => {
    try {
      const response = await pharmacyApiClient.put("/Traspasos/CambiarEstado", null, {
        params: { NumeroTraspaso: numeroTraspaso, EstadoTraspaso: estadoTraspaso },
      });
      return response.data;
    } catch (error) {
      console.error("Error changing transfer state:", error);
      throw error;
    }
  },
};

export default notificationService;
