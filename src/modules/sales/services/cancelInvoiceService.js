export const anularFacturaSIAT = async (datosAnulacion) => {
  // Simulación del servicio SIAT para anular facturas
  console.log("📡 Enviando anulación al SIAT:", datosAnulacion);
  
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular respuesta exitosa del SIAT
    const response = {
      success: true,
      data: {
        numeroFactura: datosAnulacion.numeroFactura,
        fechaAnulacion: new Date().toISOString(),
        motivo: datosAnulacion.motivo,
        codigoAnulacion: `ANL-${Date.now()}`,
        estadoSiat: "ANULADA"
      },
      message: "Factura anulada exitosamente en el SIAT"
    };
    
    return response;
    
  } catch (error) {
    console.error("Error en SIAT:", error);
    throw new Error("Error de comunicación con el SIAT");
  }
};

export const restaurarStockProductos = async (items) => {
  console.log("📦 Restaurando stock de productos:", items);
  
  try {
    // Simular operación de BD
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stockRestaurado = items.map(item => ({
      productoId: item.id,
      cantidadRestaurada: item.cantidad,
      stockAnterior: item.stock,
      stockNuevo: item.stock + item.cantidad
    }));
    
    return {
      success: true,
      data: stockRestaurado,
      message: "Stock restaurado correctamente"
    };
    
  } catch (error) {
    console.error("Error restaurando stock:", error);
    throw new Error("Error al restaurar el stock");
  }
};