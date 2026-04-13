// src/modules/purchases/hooks/usePurchases.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useSnackbar } from "notistack";
import userService from "../../../services/api/userService";
import purchaseService from "../services/purchaseService";
import { useAuth } from "../../../context/AuthContext";
import { usePurchaseStore } from "./usePurchaseStore";

export const usePurchases = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { clearPendingPurchase } = usePurchaseStore();

  // viewState: 'creating' | 'paying_credit' | 'adding_products'
  // (los productos y la factura están en la misma pantalla — adding_products)
  const [viewState, setViewState] = useState("creating");
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Búsqueda inline con AbortController
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbortRef = useRef(null);
  const currentQueryRef = useRef("");

  // Compra creada (resultado POST /NuevaCompra)
  const [createdPurchase, setCreatedPurchase] = useState(null);

  // Cabecera
  const [purchaseData, setPurchaseData] = useState({
    descripcion: "",
    fechaCompra: "",
    sucursalId: "",
    tipoFormaPago: "",
    detalleFormaPago: "",
    codigoProveedor: "",
    referencia: "",
    codigoPedido: "",
  });

  // Ítems de la compra
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Datos de factura (misma pantalla que ítems)
  const [invoiceData, setInvoiceData] = useState({
    numeroFactura: "",
    fecha: "",
    nit: "",
    nombreProveedor: "",
    numeroPedido: "",
    totalCompra: "",
    descuentoComercial: "",
    descuentoEspecial: "",
    importePagar: "",
  });

  // Datos de crédito
  const [creditData, setCreditData] = useState({
    fecha: "",
    hora: new Date().toLocaleTimeString("es-BO", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    conceptoPago: "",
    montoDeuda: "",
    montoPago: "",
    montoSaldo: "",
    numeroRecibo: "",
    numeroCheque: "",
    bancoEmitido: "",
    numeroDiasPago: "",
    observaciones: "",
  });

  // Catálogos
  const [catalogs, setCatalogs] = useState({
    sucursales: [],
    formasPago: [],
    proveedores: [],
    pedidos: [],
  });

  // ── Cargar catálogos iniciales ──
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [sucursales, formasPagoRes, proveedoresRes] = await Promise.all([
          userService.getSucursales(),
          purchaseService.getFormasPago(),
          purchaseService.getProveedores(),
        ]);
        setCatalogs((prev) => ({
          ...prev,
          sucursales: sucursales || [],
          formasPago: formasPagoRes.datos || [],
          proveedores: proveedoresRes.datos || [],
        }));
      } catch (error) {
        console.error("Error loading purchase catalogs:", error);
        enqueueSnackbar("Error al cargar catálogos", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // ── Cargar pedidos cuando cambia la sucursal ──
  useEffect(() => {
    if (!purchaseData.sucursalId) {
      setCatalogs((prev) => ({ ...prev, pedidos: [] }));
      setPurchaseData((prev) => ({ ...prev, codigoPedido: "" }));
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await purchaseService.getListaPedidos(
          purchaseData.sucursalId,
        );
        setCatalogs((prev) => ({
          ...prev,
          pedidos: res.exitoso ? res.datos || [] : [],
        }));
        setPurchaseData((prev) => ({ ...prev, codigoPedido: "" }));
      } catch (error) {
        console.error("Error fetching pedidos:", error);
        setCatalogs((prev) => ({ ...prev, pedidos: [] }));
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [purchaseData.sucursalId]);

  // ── Búsqueda inline con AbortController + debounce ──
  const searchProducts = useCallback(
    async (query) => {
      if (!query || query.length < 3) {
        setSearchResults([]);
        return;
      }
      if (!purchaseData.sucursalId) {
        enqueueSnackbar("Seleccione una sucursal primero", {
          variant: "warning",
        });
        return;
      }

      currentQueryRef.current = query;

      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      try {
        const res = await purchaseService.buscarProductos(
          { sucursalId: purchaseData.sucursalId, nombre: query },
          controller.signal,
        );
        if (currentQueryRef.current === query) {
          setSearchResults(res.datos || []);
        }
      } catch (error) {
        if (error.name === "AbortError" || error.code === "ERR_CANCELED")
          return;
        console.error("Error buscando productos:", error);
        if (currentQueryRef.current === query) setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    },
    [purchaseData.sucursalId, enqueueSnackbar],
  );

  // ── Crear cabecera ──
  const handleCreatePurchase = async () => {
    if (
      !purchaseData.sucursalId ||
      !purchaseData.codigoProveedor ||
      !purchaseData.tipoFormaPago
    ) {
      enqueueSnackbar("Complete: Sucursal, Proveedor y Forma de Pago", {
        variant: "warning",
      });
      return;
    }
    if (!purchaseData.fechaCompra) {
      enqueueSnackbar("Seleccione una Fecha de Compra", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        codigoPedido: purchaseData.codigoPedido || 0,
        codigoProveedor: purchaseData.codigoProveedor,
        fechaCompra: purchaseData.fechaCompra,
        codigoSucursal: purchaseData.sucursalId,
        referencia: purchaseData.referencia || "",
        descripcion: purchaseData.descripcion || "",
        tipoFormaPago: purchaseData.tipoFormaPago,
        detalleFormaPago: purchaseData.detalleFormaPago || "",
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
      };

      const res = await purchaseService.crearCompra(payload);
      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "Compra creada correctamente", {
          variant: "success",
        });
        setCreatedPurchase(res.datos);
        // Crédito → pagar primero; resto → directo a productos+factura
        setViewState(
          Number(purchaseData.tipoFormaPago) === 2
            ? "paying_credit"
            : "adding_products",
        );
      } else {
        enqueueSnackbar(res.mensaje || "Error al crear la compra", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error al conectar con el servidor", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Agregar ítem a la tabla ──
  const addPurchaseItem = useCallback(
    (product) => {
      const exists = purchaseItems.some(
        (item) =>
          item.producto_ID === product.producto_ID &&
          item.numeroLote === product.numeroLote,
      );
      if (exists) {
        enqueueSnackbar("Este producto (lote) ya está en la lista", {
          variant: "warning",
        });
        return false;
      }

      setPurchaseItems((prev) => [
        ...prev,
        {
          _id: Date.now(),
          producto_ID: product.producto_ID,
          lote_ID: product.lote_ID,
          codigoProducto: product.codigoProducto,
          nombreProducto: product.producto,
          presentacion: product.presentacion,
          laboratorio: product.laboratorio,
          linea: product.linea,
          numeroLote: product.numeroLote || "",
          fechaVencimiento: product.fechaVencimiento
            ? product.fechaVencimiento.split("T")[0]
            : "",
          cantidad: 1,
          costoUnitario: 0,
          precioUnitario: product.precioUnitario || 0,
          precioCaja: 0,
          // Campos para GuardarCompra
          codigo: product.codigoProducto || "",
          nombreGenerico: "",
          concentracion: "",
          nombreComercial: "",
          codigoLaboratorio: 1,
          codigoIndustria: 5,
          numeroBlister: 0,
          cantidadUnidadBlister: 0,
          factorUnidad: 0,
        },
      ]);
      setSearchQuery("");
      setSearchResults([]);
      return true;
    },
    [purchaseItems, enqueueSnackbar],
  );

  // ── Actualizar campo de un ítem ──
  const updatePurchaseItem = useCallback((id, field, value) => {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;
        const updated = { ...item, [field]: value };
        // Recalcular total
        if (field === "cantidad" || field === "costoUnitario") {
          const qty =
            field === "cantidad" ? Number(value) : Number(item.cantidad);
          const cost =
            field === "costoUnitario"
              ? Number(value)
              : Number(item.costoUnitario);
          updated.precioCaja = qty * cost;
        }
        return updated;
      }),
    );
  }, []);

  // ── Eliminar ítem ──
  const removePurchaseItem = useCallback((id) => {
    setPurchaseItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  // ── Calcular total ──
  const calculateTotal = useCallback(() => {
    return purchaseItems.reduce(
      (sum, item) => sum + (Number(item.precioCaja) || 0),
      0,
    );
  }, [purchaseItems]);

  // ── Guardar productos (NO cambia viewState, usuario sigue en la misma pantalla) ──
  const handleSaveProducts = async () => {
    if (!createdPurchase?.comprobanteCompra_ID) return;
    if (purchaseItems.length === 0) {
      enqueueSnackbar("Debe añadir al menos un producto", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        codigoComprobanteCompra: createdPurchase.comprobanteCompra_ID,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
        productos: purchaseItems.map((item) => ({
          codigoProducto: item.producto_ID || 0,
          codigo: item.codigo || "",
          nombreGenerico: item.nombreGenerico || "",
          concentracion: item.concentracion || "",
          nombreComercial: item.nombreComercial || "",
          presentacion: item.presentacion || "",
          codigoLaboratorio: Number(item.codigoLaboratorio) || 0,
          codigoIndustria: Number(item.codigoIndustria) || 0,
          numeroLote: item.numeroLote || "",
          fechaVencimiento: item.fechaVencimiento || null,
          cantidad: Number(item.cantidad) || 0,
          numeroBlister: Number(item.numeroBlister) || 0,
          cantidadUnidadBlister: Number(item.cantidadUnidadBlister) || 0,
          factorUnidad: Number(item.factorUnidad) || 0,
          costoUnitario: Number(item.costoUnitario) || 0,
          precioUnitario: Number(item.precioUnitario) || 0,
          precioCaja: Number(item.precioCaja) || 0,
        })),
      };

      const res = await purchaseService.guardarProductos(payload);
      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "Productos guardados correctamente", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(res.mensaje || "Error al guardar productos", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error de red al guardar productos", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar factura ──
  const handleSaveInvoice = async () => {
    if (!createdPurchase?.comprobanteCompra_ID) return;
    try {
      setLoading(true);
      const payload = {
        codigoComprobanteCompra: createdPurchase.comprobanteCompra_ID,
        numeroFactura: invoiceData.numeroFactura || "",
        fecha: invoiceData.fecha || "",
        nit: invoiceData.nit || "",
        nombreProveedor: invoiceData.nombreProveedor || "",
        numeroPedido: invoiceData.numeroPedido || "",
        totalCompra: Number(invoiceData.totalCompra) || 0,
        descuentoComercial: Number(invoiceData.descuentoComercial) || 0,
        descuentoEspecial: Number(invoiceData.descuentoEspecial) || 0,
        importePagar: Number(invoiceData.importePagar) || 0,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
      };
      const res = await purchaseService.guardarFactura(payload);
      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "Factura guardada correctamente", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(res.mensaje || "Error al guardar factura", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error de red al guardar factura", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Terminar compra ──
  const handleTerminarCompra = async () => {
    if (!createdPurchase?.comprobanteCompra_ID) return false;
    try {
      setLoading(true);
      const res = await purchaseService.cambiarEstadoCompra(
        createdPurchase.comprobanteCompra_ID,
        "ENV",
      );
      if (res.exitoso) {
        enqueueSnackbar("Compra finalizada exitosamente", {
          variant: "success",
        });
        return true;
      } else {
        enqueueSnackbar(res.mensaje || "Error al finalizar compra", {
          variant: "error",
        });
        return false;
      }
    } catch (error) {
      enqueueSnackbar("Error de red al finalizar compra", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Pagar crédito ──
  const handlePagarCredito = async () => {
    if (!createdPurchase?.comprobanteCompra_ID) return;
    try {
      setLoading(true);
      const payload = {
        codigoComprobanteCompra: createdPurchase.comprobanteCompra_ID,
        ...creditData,
        montoDeuda: Number(creditData.montoDeuda) || 0,
        montoPago: Number(creditData.montoPago) || 0,
        montoSaldo: Number(creditData.montoSaldo) || 0,
        numeroDiasPago: Number(creditData.numeroDiasPago) || 0,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
      };
      const res = await purchaseService.pagarCredito(payload);
      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "Crédito registrado correctamente", {
          variant: "success",
        });
        setViewState("adding_products");
      } else {
        enqueueSnackbar(res.mensaje || "Error al registrar crédito", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error de red al registrar crédito", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompraDetalle = useCallback(
    async (numeroCompra) => {
      try {
        setLoading(true);
        const res = await purchaseService.getEditarCompra(numeroCompra);
        if (res.exitoso) {
          const data = res.datos;
          setCreatedPurchase({
            comprobanteCompra_ID: data.codigoCompra,
            numeroCompra: data.numeroCompra,
            fecha: data.fechaCompra,
            descripcion: data.observaciones,
          });
          // Cargar sucursalId para que searchProducts funcione al editar
          setPurchaseData((prev) => ({
            ...prev,
            sucursalId: data.codigoSucursal,
          }));
          if (data.facturaCompra) {
            setInvoiceData({
              numeroFactura: data.facturaCompra.numeroFactura || "",
              fecha: data.facturaCompra.fecha
                ? data.facturaCompra.fecha.split("T")[0]
                : "",
              nit: data.facturaCompra.nit || "",
              nombreProveedor: data.facturaCompra.nombreProveedor || "",
              numeroPedido: data.facturaCompra.numeroPedido || "",
              totalCompra: data.facturaCompra.totalCompra ?? "",
              descuentoComercial: data.facturaCompra.dtoComercial ?? "",
              descuentoEspecial: data.facturaCompra.dtoEspecial ?? "",
              importePagar: data.facturaCompra.importePagar ?? "",
            });
          }
          setPurchaseItems(
            (data.listaProductos || []).map((p) => ({
              _id: Date.now() + Math.random(),
              producto_ID: p.producto_ID,
              lote_ID: p.lote_ID,
              codigoProducto: p.codigoProducto,
              nombreProducto: p.producto,
              presentacion: p.presentacion,
              laboratorio: p.laboratorio || "",
              linea: p.linea || "",
              numeroLote: p.numeroLote || "",
              fechaVencimiento: p.fechaVencimiento
                ? p.fechaVencimiento.split("T")[0]
                : "",
              cantidad: p.stockProducto || 1,
              costoUnitario: p.costoUnitario || 0,
              precioUnitario: p.precioUnitario || 0,
              precioCaja: (p.costoUnitario || 0) * (p.stockProducto || 1),
              codigo: p.codigoProducto || "",
              nombreGenerico: "",
              concentracion: "",
              nombreComercial: "",
              codigoLaboratorio: 1,
              codigoIndustria: 5,
              numeroBlister: 0,
              cantidadUnidadBlister: 0,
              factorUnidad: 0,
            })),
          );
          setViewState("adding_products");
        } else {
          enqueueSnackbar(res.mensaje || "Error al cargar compra", {
            variant: "error",
          });
        }
      } catch (error) {
        enqueueSnackbar("Error al cargar la compra", { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar],
  );

  // ── Reset completo ──
  const resetFlow = useCallback(() => {
    setPurchaseData({
      descripcion: "",
      fechaCompra: "",
      sucursalId: "",
      tipoFormaPago: "",
      detalleFormaPago: "",
      codigoProveedor: "",
      referencia: "",
      codigoPedido: "",
    });
    setPurchaseItems([]);
    setInvoiceData({
      numeroFactura: "",
      fecha: "",
      nit: "",
      nombreProveedor: "",
      numeroPedido: "",
      totalCompra: "",
      descuentoComercial: "",
      descuentoEspecial: "",
      importePagar: "",
    });
    setCreditData({
      fecha: "",
      hora: new Date().toLocaleTimeString("es-BO", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      conceptoPago: "",
      montoDeuda: "",
      montoPago: "",
      montoSaldo: "",
      numeroRecibo: "",
      numeroCheque: "",
      bancoEmitido: "",
      numeroDiasPago: "",
      observaciones: "",
    });
    setCreatedPurchase(null);
    setSearchQuery("");
    setSearchResults([]);
    setViewState("creating");
  }, []);

  return {
    viewState,
    setViewState,
    loading,
    loadingOrders,
    isSearching,
    searchQuery,
    setSearchQuery,
    searchResults,
    purchaseData,
    setPurchaseData,
    purchaseItems,
    createdPurchase,
    invoiceData,
    setInvoiceData,
    creditData,
    setCreditData,
    catalogs,
    handleCreatePurchase,
    searchProducts,
    addPurchaseItem,
    updatePurchaseItem,
    removePurchaseItem,
    calculateTotal,
    handleSaveProducts,
    handleSaveInvoice,
    handleTerminarCompra,
    handlePagarCredito,
    resetFlow,
    loadCompraDetalle,
  };
};
