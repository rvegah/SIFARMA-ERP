// src/modules/sales/hooks/useSales.js
import { useState, useCallback } from "react";
import SalesService from "../services/salesService";
import { FACTURA_SIN_NOMBRE_LIMIT } from "../constants/salesConstants";

export const useSales = () => {
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
    codigoDocumentoSector: "1",
    periodoFacturado: "",
  });

  const [saleItems, setSaleItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── BÚSQUEDA ──────────────────────────────────────────────────────────────

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

  // ── ITEMS ─────────────────────────────────────────────────────────────────

  const addItem = useCallback((product) => {
    setSaleItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].cantidad += 1;
        updated[existingIndex].subtotal =
          updated[existingIndex].cantidad * updated[existingIndex].precio -
          updated[existingIndex].descuento;
        return updated;
      }

      return [
        ...prev,
        {
          id: Date.now(),
          productId: product.id,

          // Identificación
          codigo: product.codigo,
          sku: product.sku,
          nombre: product.nombre,

          // Info para mostrar en tabla
          descripcion: product.descripcion || "",
          categoria: product.categoria || "",
          linea: product.linea || "",
          laboratorio: product.laboratorio || "",

          // Lote y vencimiento
          numeroLote: product.numeroLote || "",
          fechaVencimiento: product.fechaVencimiento || "",
          diasProximoVencimiento: product.diasProximoVencimiento || 0,
          descuentoVencimiento: product.descuentoVencimiento || 0,

          // Campos SIAT — números directos del nuevo API
          codigoSin: product.codigoSin,
          codigoProductoSin: product.codigoProductoSin,
          codigoActividad: product.codigoActividad,
          unidadMedida: product.unidadMedida || 62, // número SIAT directo

          // Cantidades y precios
          stock: product.stock,
          cantidad: 1,
          precio: product.precio,
          precioUnitario: product.precio,
          descuento: 0,
          subtotal: product.precio,
        },
      ];
    });

    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const updateItem = useCallback((itemId, field, value) => {
    setSaleItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
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
      }),
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setSaleItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // ── TOTALES ───────────────────────────────────────────────────────────────

  const calculateTotals = useCallback(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoAdicional = clientForm.descuentoAdicional || 0;
    const total = subtotal - descuentoAdicional;
    const pagado = clientForm.pagado || 0;
    const cambio = Math.max(0, pagado - total);
    return { subtotal, descuentoAdicional, total, pagado, cambio };
  }, [saleItems, clientForm.descuentoAdicional, clientForm.pagado]);

  // ── VALIDACIÓN ────────────────────────────────────────────────────────────

  const validateSale = useCallback(() => {
    const { total } = calculateTotals();

    if (saleItems.length === 0)
      return { valid: false, message: "Debe agregar al menos un producto" };

    // Validación de stock deshabilitada temporalmente para pruebas
    // const stockIssues = saleItems.filter((item) => item.cantidad > item.stock);
    // if (stockIssues.length > 0)
    //   return { valid: false, message: `Stock insuficiente para: ${stockIssues.map((i) => i.nombre).join(", ")}` };

    if (total >= FACTURA_SIN_NOMBRE_LIMIT && clientForm.nit === "4444")
      return {
        valid: false,
        message: `Para ventas mayores a ${FACTURA_SIN_NOMBRE_LIMIT} Bs. debe ingresar NIT/CI válido`,
      };

    if (!clientForm.nombre || clientForm.nombre.trim() === "")
      return { valid: false, message: "Debe ingresar el nombre del cliente" };

    return { valid: true };
  }, [saleItems, clientForm, calculateTotals]);

  // ── GUARDAR SIN FACTURAR ──────────────────────────────────────────────────

  const saveSale = useCallback(async () => {
    const validation = validateSale();
    if (!validation.valid)
      return { success: false, message: validation.message };

    setLoading(true);
    try {
      const result = await SalesService.saveSale({
        cliente: clientForm,
        items: saleItems,
        totals: calculateTotals(), // ✅ 'totals' no 'totales'
      });
      if (result.success)
        return { success: true, message: "Venta guardada exitosamente" };
      return { success: false, message: result.message || "Error al guardar" };
    } catch (error) {
      return { success: false, message: "Error al guardar la venta" };
    } finally {
      setLoading(false);
    }
  }, [clientForm, saleItems, validateSale, calculateTotals]);

  // ── FACTURAR ──────────────────────────────────────────────────────────────

  const invoiceSale = useCallback(
    async (contingenciaData = {}) => {
      const validation = validateSale();
      if (!validation.valid)
        return { success: false, message: validation.message };

      setLoading(true);
      try {
        const result = await SalesService.invoiceSale({
          cliente: clientForm,
          items: saleItems,
          totals: calculateTotals(),
          ...contingenciaData,
        });

        if (result.success) {
          return {
            success: true,
            message: result.message || "Factura generada exitosamente",
            invoice: result.invoice,
            siatData: result.siatData,
          };
        }

        return {
          success: false,
          message: result.message || "Error al facturar",
        };
      } catch (error) {
        console.error("Error facturando:", error);
        if (error.code === "INVALID_NIT") throw error; // ← agregar esta línea
        return { success: false, message: "Error al generar la factura" };
      } finally {
        setLoading(false);
      }
    },
    [clientForm, saleItems, validateSale, calculateTotals],
  );

  // ── LIMPIAR ───────────────────────────────────────────────────────────────

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
      codigoDocumentoSector: "1",
      periodoFacturado: "",
    });
    setSaleItems([]);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const updateDiscount = useCallback(
    (value) => {
      setClientForm((prev) => {
        const newDiscount = Math.max(0, value);
        const totals = calculateTotals();
        return {
          ...prev,
          descuentoAdicional:
            newDiscount > totals.subtotal ? totals.subtotal : newDiscount,
        };
      });
    },
    [calculateTotals],
  );

  const updatePayment = useCallback(
    (value) => {
      const totals = calculateTotals();
      const pagado = Math.max(0, value);
      const cambio = Math.max(0, pagado - totals.total);
      setClientForm((prev) => ({ ...prev, pagado, cambio }));
    },
    [calculateTotals],
  );

  // ── CARGAR VENTA COMPLETA (para edición) ─────────────────────────────────

  const loadSaleData = useCallback((saleData) => {
    setClientForm({
      nit: saleData.clientForm.nit || "",
      nombre: saleData.clientForm.nombre || "",
      tipoDocumento: saleData.clientForm.tipoDocumento || "1",
      celular: saleData.clientForm.celular || "",
      email: saleData.clientForm.email || "",
      complemento: saleData.clientForm.complemento || "",
      fechaNacimiento: saleData.clientForm.fechaNacimiento || "",
      descuentoAdicional: saleData.clientForm.descuentoAdicional || 0,
      pagado: saleData.clientForm.pagado || 0,
      cambio: saleData.clientForm.cambio || 0,
      codigoDocumentoSector: saleData.clientForm.codigoDocumentoSector || "1",
      periodoFacturado: saleData.clientForm.periodoFacturado || "",
    });

    setSaleItems(
      saleData.items.map((item, index) => ({
        id: Date.now() + index,
        productId: item.productId || item.id,
        codigo: item.codigo,
        sku: item.sku,
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        categoria: item.categoria || "",
        linea: item.linea || "",
        laboratorio: item.laboratorio || "",
        numeroLote: item.numeroLote || "",
        fechaVencimiento: item.fechaVencimiento || "",
        diasProximoVencimiento: item.diasProximoVencimiento || 0,
        descuentoVencimiento: item.descuentoVencimiento || 0,
        codigoSin: item.codigoSin,
        codigoProductoSin: item.codigoProductoSin,
        codigoActividad: item.codigoActividad,
        unidadMedida: item.unidadMedida || 62, // número SIAT
        stock: item.stock || 0,
        cantidad: item.cantidad,
        precio: item.precio,
        precioUnitario: item.precio,
        descuento: item.descuento || 0,
        subtotal: item.subtotal,
      })),
    );
  }, []);

  return {
    clientForm,
    saleItems,
    searchQuery,
    searchResults,
    isSearching,
    loading,
    setClientForm,
    searchProducts,
    handleClientSearch,
    addItem,
    updateItem,
    removeItem,
    calculateTotals,
    validateSale,
    saveSale,
    invoiceSale,
    clearForm,
    setSearchQuery,
    updateDiscount,
    updatePayment,
    loadSaleData,
  };
};
