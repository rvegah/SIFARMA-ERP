import pharmacyApiClient from "../../services/api/pharmacyApiClient";

const notificationService = {
  /**
   * Fetch current notifications for the notification panel (bell)
   * GET /api/farmalink-farmacia/Traspasos/NotificacionesTraspasos?CodigoSucursal={id}
   * NOTA: El backend devuelve 400 cuando la lista está vacía — se trata como exitoso con datos:[]
   */
  getNotificaciones: async (codigoSucursal) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Traspasos/NotificacionesTraspasos",
        {
          params: { CodigoSucursal: codigoSucursal },
        },
      );
      return response.data;
    } catch (error) {
      // El backend retorna 400 con mensaje cuando no hay notificaciones — no es un error real
      if (error?.response?.status === 400) {
        return {
          exitoso: true,
          datos: [],
          mensaje: error.response.data?.mensaje ?? "",
        };
      }
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Fetch transfer details for a notification
   * GET /api/farmalink-farmacia/Traspasos/EditarTraspaso?NumeroTraspaso={numeroTraspaso}
   */
  getDetalleTraspaso: async (numeroTraspaso) => {
    try {
      const response = await pharmacyApiClient.get(
        "/Traspasos/EditarTraspaso",
        {
          params: { NumeroTraspaso: numeroTraspaso },
        },
      );
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
      const response = await pharmacyApiClient.put(
        "/Traspasos/CambiarEstado",
        null,
        {
          params: {
            NumeroTraspaso: numeroTraspaso,
            EstadoTraspaso: estadoTraspaso,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing transfer state:", error);
      throw error;
    }
  },

  aceptarTraspaso: async (payload) => {
    try {
      const response = await pharmacyApiClient.put(
        "/Traspasos/AceptarTraspaso",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error accepting transfer:", error);
      throw error;
    }
  },
};

export default notificationService;
