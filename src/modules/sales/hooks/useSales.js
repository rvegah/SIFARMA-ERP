// src/modules/sales/hooks/useSales.js
import { useState, useCallback } from "react";
import SalesService from "../services/salesService";
import { FACTURA_SIN_NOMBRE_LIMIT } from "../constants/salesConstants";

export const useSales = () => {
  // Estado del formulario de cliente
  const [clientForm, setClientForm] = useState({
    nit: "",
    nombre: "",
    tipoDocumento: "1",
    celular: "",
    email: "",
    complemento: "",
    fechaNacimiento: "",
    descuentoAdicional: 0,
    pagado: 0,
    cambio: 0,
  });

  // Items de la venta
  const [saleItems, setSaleItems] = useState([]);

  // Búsqueda de productos
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Buscar productos
  const searchProducts = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await SalesService.searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error buscando productos:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Buscar/crear cliente
  const handleClientSearch = useCallback(async (nit) => {
    if (!nit) return;

    try {
      const client = await SalesService.searchOrCreateClient(nit);
      setClientForm((prev) => ({
        ...prev,
        nit: client.nit,
        nombre: client.nombre || "",
        tipoDocumento: client.tipo || SalesService.detectDocumentType(nit),
        celular: client.celular || "",
        email: client.email || "",
      }));
    } catch (error) {
      console.error("Error buscando cliente:", error);
    }
  }, []);

  // Agregar producto a la venta
  const addItem = useCallback((product) => {
    setSaleItems((prev) => {
      // Verificar si ya existe
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id
      );

      if (existingIndex >= 0) {
        // Incrementar cantidad
        const updated = [...prev];
        updated[existingIndex].cantidad += 1;
        updated[existingIndex].subtotal =
          updated[existingIndex].cantidad * updated[existingIndex].precio;
        return updated;
      }

      // Agregar nuevo
      return [
        ...prev,
        {
          id: Date.now(),
          productId: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          linea: product.linea,
          presentacion: product.presentacion,
          unidadMedida: product.unidadMedida,
          stock: product.stock,
          cantidad: 1,
          precio: product.precio,
          descuento: 0,
          subtotal: product.precio,
        },
      ];
    });

    // Limpiar búsqueda
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Actualizar item
  const updateItem = useCallback((itemId, field, value) => {
    setSaleItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };

          // Recalcular subtotal
          if (
            field === "cantidad" ||
            field === "precio" ||
            field === "descuento"
          ) {
            const base = updated.cantidad * updated.precio;
            updated.subtotal = base - updated.descuento;
          }

          return updated;
        }
        return item;
      })
    );
  }, []);

  // Eliminar item
  const removeItem = useCallback((itemId) => {
    setSaleItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Calcular totales
  const calculateTotals = useCallback(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoAdicional = clientForm.descuentoAdicional || 0;
    const total = subtotal - descuentoAdicional;
    const pagado = clientForm.pagado || 0;
    const cambio = Math.max(0, pagado - total);

    return { subtotal, descuentoAdicional, total, pagado, cambio };
  }, [saleItems, clientForm.descuentoAdicional, clientForm.pagado]);

  // Validar venta antes de procesar
  const validateSale = useCallback(() => {
    const { total } = calculateTotals();

    // Validar items
    if (saleItems.length === 0) {
      return { valid: false, message: "Debe agregar al menos un producto" };
    }

    // Validar stock
    const stockIssues = saleItems.filter((item) => item.cantidad > item.stock);
    if (stockIssues.length > 0) {
      return {
        valid: false,
        message: `Stock insuficiente para: ${stockIssues
          .map((i) => i.nombre)
          .join(", ")}`,
      };
    }

    // Validar NIT si el total es >= 1000 Bs
    if (total >= FACTURA_SIN_NOMBRE_LIMIT && clientForm.nit === "4444") {
      return {
        valid: false,
        message: `Para ventas mayores a ${FACTURA_SIN_NOMBRE_LIMIT} Bs. debe ingresar NIT/CI válido`,
      };
    }

    // Validar nombre completo
    if (!clientForm.nombre || clientForm.nombre.trim() === "") {
      return { valid: false, message: "Debe ingresar el nombre del cliente" };
    }

    return { valid: true };
  }, [saleItems, clientForm, calculateTotals]);

  // Guardar venta sin facturar
  const saveSale = useCallback(async () => {
    const validation = validateSale();
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    setLoading(true);
    try {
      const saleData = {
        cliente: clientForm,
        items: saleItems,
        totales: calculateTotals(),
        userId: 1, // TODO: obtener del contexto de usuario
      };

      const result = await SalesService.saveSale(saleData);

      if (result.success) {
        // NO limpiar el formulario - mantener para entrega
        return { success: true, message: "Venta guardada exitosamente" };
      }
    } catch (error) {
      console.error("Error guardando venta:", error);
      return { success: false, message: "Error al guardar la venta" };
    } finally {
      setLoading(false);
    }
  }, [clientForm, saleItems, validateSale, calculateTotals]);

  // Facturar venta
  const invoiceSale = useCallback(async () => {
    const validation = validateSale();
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    setLoading(true);
    try {
      const saleData = {
        cliente: clientForm,
        items: saleItems,
        totales: calculateTotals(),
        userId: 1, // TODO: obtener del contexto de usuario
      };

      const result = await SalesService.invoiceSale(saleData);

      if (result.success) {
        // NO limpiar - mantener para verificación de entrega
        return {
          success: true,
          message: "Factura generada exitosamente",
          invoice: result.invoice,
        };
      }
    } catch (error) {
      console.error("Error facturando:", error);
      return { success: false, message: "Error al generar la factura" };
    } finally {
      setLoading(false);
    }
  }, [clientForm, saleItems, validateSale, calculateTotals]);

  // Limpiar formulario (solo con botón "Nueva Venta")
  const clearForm = useCallback(() => {
    setClientForm({
      nit: "",
      nombre: "",
      tipoDocumento: "1",
      celular: "",
      email: "",
      complemento: "",
      fechaNacimiento: "",
      descuentoAdicional: 0,
      pagado: 0,
      cambio: 0,
    });
    setSaleItems([]);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Actualizar descuento adicional
  const updateDiscount = useCallback(
    (value) => {
      setClientForm((prev) => {
        const newDiscount = Math.max(0, value);
        const totals = calculateTotals();

        // No permitir descuento mayor al subtotal
        if (newDiscount > totals.subtotal) {
          return { ...prev, descuentoAdicional: totals.subtotal };
        }

        return { ...prev, descuentoAdicional: newDiscount };
      });
    },
    [calculateTotals]
  );

  // Actualizar pago
  const updatePayment = useCallback(
    (value) => {
      const totals = calculateTotals();
      const pagado = Math.max(0, value);
      const cambio = Math.max(0, pagado - totals.total);

      setClientForm((prev) => ({
        ...prev,
        pagado,
        cambio,
      }));
    },
    [calculateTotals]
  );

  return {
    // Estado
    clientForm,
    saleItems,
    searchQuery,
    searchResults,
    isSearching,
    loading,

    // Funciones
    setClientForm,
    searchProducts,
    handleClientSearch,
    addItem,
    updateItem,
    removeItem,
    calculateTotals,
    saveSale,
    invoiceSale,
    clearForm,
    setSearchQuery,
    updateDiscount,
    updatePayment
  };
};
