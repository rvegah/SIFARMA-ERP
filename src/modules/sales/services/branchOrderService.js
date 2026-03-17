import pharmacyApiClient from '../../../services/api/pharmacyApiClient';

const branchOrderService = {
  // POST /PedidosSucursal/NuevoPedido
  crearPedido: async (payload) => {
    try {
      const response = await pharmacyApiClient.post('/PedidosSucursal/NuevoPedido', payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido sucursal:', error);
      throw error;
    }
  },

  // POST /PedidosSucursal/GuardarPedido
  guardarPedido: async (payload) => {
    try {
      const response = await pharmacyApiClient.post('/PedidosSucursal/GuardarPedido', payload);
      return response.data;
    } catch (error) {
      console.error('Error al guardar pedido sucursal:', error);
      throw error;
    }
  },

  // GET /Traspasos/Productos
  buscarProductos: async (params) => {
    try {
      // Clean undefined or empty params and format properly
      const queryParams = new URLSearchParams();

      // Ensure we always have at least SuSucursal_ID=0 if not provided, just in case
      queryParams.append('CodigoSucursal', params.sucursalId || 0);

      if (params.nombre) queryParams.append('NombreProducto', params.nombre);
      if (params.codigo) queryParams.append('CodigoProducto', params.codigo);
      // if (params.grupo) queryParams.append('LineaProducto', params.grupo);
      // if (params.subgrupo) queryParams.append('Subgrupo', params.subgrupo);

      const response = await pharmacyApiClient.get(`/Traspasos/Productos?${queryParams.toString()}`);

      // Handle the case where the API returns an empty array directly vs the standard response format
      if (Array.isArray(response.data)) {
        return {
          exitoso: true,
          datos: response.data,
          mensaje: 'Productos encontrados'
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error en búsqueda de productos traspaso:', error);
      return {
        exitoso: false,
        datos: [],
        mensaje: error.response?.data?.message || 'Error al buscar productos'
      };
    }
  },

  // GET /Traspasos/ListaTraspasos
  getListaTraspasos: async () => {
    try {
      const response = await pharmacyApiClient.get('/Traspasos/ListaTraspasos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener lista de traspasos:', error);
      return { exitoso: false, datos: [], mensaje: 'Error al obtener lista de traspasos' };
    }
  },

  // GET /Traspasos/ProductosTraspaso?NumeroTraspaso=X
  getProductosTraspaso: async (numeroTraspaso) => {
    try {
      const response = await pharmacyApiClient.get(`/Traspasos/ProductosTraspaso?NumeroTraspaso=${numeroTraspaso}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos del traspaso:', error);
      return { exitoso: false, datos: [], mensaje: 'Error al obtener productos del traspaso' };
    }
  }
};

export default branchOrderService;
