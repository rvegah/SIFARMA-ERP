// src/modules/transfers/hooks/useTransfers.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useSnackbar } from "notistack";
import transferService from "../services/transferService";
import userService from "../../../services/api/userService";
import { useAuth } from "../../../context/AuthContext";

export const useTransfers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [viewState, setViewState] = useState("creating");
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    codigo: "",
    nombre: "",
  });
  const [searchResults, setSearchResults] = useState([]);

  const [transferData, setTransferData] = useState({
    descripcion: "",
    codigoSucursalOrigen: "",
    codigoSucursalDestino: "",
    fechaEnvio: "",
    observaciones: "",
  });

  const [createdTransfer, setCreatedTransfer] = useState(null);
  const [transferItems, setTransferItems] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [catalogs, setCatalogs] = useState({ sucursales: [] });

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingCatalogs(true);
        const sucRes = await userService.getSucursales();
        setCatalogs({ sucursales: sucRes || [] });
      } catch (error) {
        console.error("Error loading transfer catalogs:", error);
        enqueueSnackbar("Error al cargar sucursales", { variant: "error" });
      } finally {
        setLoadingCatalogs(false);
      }
    };
    loadInitialData();
  }, [enqueueSnackbar]);

  const handleCreateTransfer = async () => {
    if (
      !transferData.codigoSucursalOrigen ||
      !transferData.codigoSucursalDestino ||
      !transferData.fechaEnvio
    ) {
      enqueueSnackbar("Por favor complete los campos obligatorios", {
        variant: "warning",
      });
      return;
    }
    if (
      transferData.codigoSucursalOrigen === transferData.codigoSucursalDestino
    ) {
      enqueueSnackbar(
        "La sucursal de destino no puede ser la misma que la de origen",
        { variant: "error" },
      );
      return;
    }
    try {
      setLoading(true);
      const now = new Date();
      const payload = {
        codigoSucursalOrigen: transferData.codigoSucursalOrigen,
        codigoSucursalDestino: transferData.codigoSucursalDestino,
        // Enviar fecha con hora actual
        fechaEnvio: transferData.fechaEnvio
          ? `${transferData.fechaEnvio}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
          : new Date().toISOString(),
        usuarioEnvio: user?.usuario_ID || 1,
        observaciones: transferData.observaciones,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
      };
      const res = await transferService.crearTraspaso(payload);
      if (res.exitoso) {
        enqueueSnackbar(res.mensaje || "Traspaso iniciado con éxito", {
          variant: "success",
        });
        setCreatedTransfer(res.datos);
        setViewState("adding_products");
      } else {
        enqueueSnackbar(res.mensaje || "Error al iniciar el traspaso", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error in handleCreateTransfer:", error);
      enqueueSnackbar("Error de red al iniciar el traspaso", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Cargar traspaso existente para editar ────────────────────────────────
  const loadTraspasoDetalle = async (numeroTraspaso) => {
    try {
      setLoading(true);
      const res = await transferService.editarTraspaso(numeroTraspaso);
      if (res.exitoso && res.datos) {
        const d = res.datos;

        // Reconstituir cabecera como createdTransfer
        setCreatedTransfer({
          numeroTraspaso: d.numeroTraspaso,
          sucursalOrigen_ID: d.sucursalOrigen,
          sucursalDestino_ID: d.sucursalDestino,
          fechaEnvio: d.fecha,
          observaciones: d.obsevacion, // typo del backend
        });

        // Mapear productos al formato de transferItems
        const items = (d.productos || []).map((p, idx) => ({
          sku: p.skU_ID || 0,
          lote_ID: p.lote_ID,
          producto_ID: p.producto_ID || idx, // no viene en el endpoint
          codigoProducto: p.codigoProducto || "",
          producto: p.producto,
          laboratorio: p.laboratorio,
          linea: p.linea,
          presentacion: p.unidad || "",
          codigoLote: p.numeroLote,
          fechaVencimiento: p.vencimiento,
          costoUnitario: p.costoUnitario || 0,
          precioUnitario: p.precioUnitario || 0,
          precioCaja: p.precioCaja || 0,
          precioRefencial: 0,
          stockProducto: 0,
          cantidad: p.cantidad || 1,
          observaciones: p.observaciones || "",
        }));

        setTransferItems(items);

        // Si estado no es PEN, poner readOnly
        setIsReadOnly(d.estado !== "PEN");
        setViewState("adding_products");
      } else {
        enqueueSnackbar(res.mensaje || "Error al cargar el traspaso", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error loading transfer detail:", error);
      enqueueSnackbar("Error de red al cargar el traspaso", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Autocomplete search ──────────────────────────────────────────────────
  const searchProductsByText = useCallback(
    async (texto) => {
      const sucursalId =
        createdTransfer?.sucursalOrigen_ID || transferData.codigoSucursalOrigen;
      if (!sucursalId) return [];

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        setLoadingSearch(true);
        const esCodigo = /^[A-Za-z]+-\d+/.test(texto.trim());
        const res = await transferService.buscarProductos({
          sucursalId,
          nombre: esCodigo ? undefined : texto,
          codigo: esCodigo ? texto : undefined,
        });
        if (res.exitoso && Array.isArray(res.datos)) {
          setSearchResults(res.datos);
          return res.datos;
        }
        setSearchResults([]);
        return [];
      } catch (error) {
        if (error.name === "AbortError" || error.name === "CanceledError")
          return [];
        console.error("Error in searchProductsByText:", error);
        setSearchResults([]);
        return [];
      } finally {
        setLoadingSearch(false);
      }
    },
    [createdTransfer, transferData.codigoSucursalOrigen],
  );

  const searchProducts = useCallback(async () => {
    const sucursalId =
      createdTransfer?.sucursalOrigen_ID || transferData.codigoSucursalOrigen;
    if (!sucursalId || (!searchFilters.codigo && !searchFilters.nombre)) return;
    try {
      setLoadingSearch(true);
      const res = await transferService.buscarProductos({
        sucursalId,
        nombre: searchFilters.nombre,
        codigo: searchFilters.codigo,
      });
      if (res.exitoso && res.datos) setSearchResults(res.datos);
      else setSearchResults([]);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [createdTransfer, transferData.codigoSucursalOrigen, searchFilters]);

  const addTransferItem = (product, quantity, obs) => {
    const newItem = {
      sku: product.sku,
      lote_ID: product.lote_ID,
      producto_ID: product.producto_ID,
      codigoProducto: product.codigoProducto || product.codigo || "",
      producto: product.producto || product.nombre,
      laboratorio: product.laboratorio,
      linea: product.linea,
      presentacion: product.presentacion,
      codigoLote: product.codigoLote || product.numeroLote,
      fechaVencimiento: product.fechaVencimiento,
      costoUnitario: product.precioCosto || product.costoUnitario || 0,
      precioUnitario: product.precioVenta || product.precioUnitario || 0,
      precioRefencial: product.precioReferencia || product.precioRefencial || 0,
      precioCaja: product.precioCaja || 0,
      stockProducto: product.stockProducto || 0,
      cantidad: quantity,
      observaciones: obs,
    };
    setTransferItems((prev) => [...prev, newItem]);
    enqueueSnackbar("Producto añadido al traspaso", { variant: "success" });
  };

  const removeTransferItem = (index) => {
    setTransferItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTransferItem = (index, field, value) => {
    setTransferItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // ── Guardar traspaso (estado PEN) — no bloquea edición ──────────────────
  const handleConfirmSave = async () => {
    if (transferItems.length === 0) {
      enqueueSnackbar("Debe añadir al menos un producto", {
        variant: "warning",
      });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        numeroTraspaso: createdTransfer.numeroTraspaso,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
        estado: "PEN",
        productos: transferItems.map((item) => ({
          skU_ID: item.sku,
          lote_ID: item.lote_ID,
          producto_ID: item.producto_ID,
          cantidad: Number(item.cantidad) || 0,
          observaciones: item.observaciones,
          costoUnitario: Number(item.costoUnitario) || 0,
          precioUnitario: Number(item.precioUnitario) || 0,
          precioRefencial: Number(item.precioRefencial) || 0,
        })),
      };
      const res = await transferService.guardarTraspaso(payload);
      if (res.exitoso) {
        enqueueSnackbar("Traspaso guardado correctamente", {
          variant: "success",
        });
        // NO setIsReadOnly — puede seguir editando
      } else {
        enqueueSnackbar(res.mensaje || "Error al guardar el traspaso", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error in handleConfirmSave:", error);
      enqueueSnackbar("Error de red al guardar el traspaso", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Terminar traspaso: guardar productos + cambiar estado a ENV ──────────
  const handleTerminarTraspaso = async () => {
    if (transferItems.length === 0) {
      enqueueSnackbar("Debe añadir al menos un producto", {
        variant: "warning",
      });
      return;
    }
    try {
      setLoading(true);

      // 1. Guardar productos con PEN
      const payloadGuardar = {
        numeroTraspaso: createdTransfer.numeroTraspaso,
        codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
        estado: "PEN",
        productos: transferItems.map((item) => ({
          skU_ID: item.sku,
          lote_ID: item.lote_ID,
          producto_ID: item.producto_ID,
          cantidad: Number(item.cantidad) || 0,
          observaciones: item.observaciones,
          costoUnitario: Number(item.costoUnitario) || 0,
          precioUnitario: Number(item.precioUnitario) || 0,
          precioRefencial: Number(item.precioRefencial) || 0,
        })),
      };
      const resGuardar = await transferService.guardarTraspaso(payloadGuardar);
      if (!resGuardar.exitoso) {
        enqueueSnackbar(resGuardar.mensaje || "Error al guardar productos", {
          variant: "error",
        });
        return;
      }

      // 2. Cambiar estado a ENV
      const resCambiar = await transferService.cambiarEstado(
        createdTransfer.numeroTraspaso,
        "ENV",
      );
      if (resCambiar.exitoso) {
        enqueueSnackbar("Traspaso enviado y finalizado correctamente", {
          variant: "success",
        });

        // 🔥 ESTA ES LA LINEA QUE TE FALTABA
        window.dispatchEvent(new Event("notifications:update"));

        setIsReadOnly(true);
      } else {
        enqueueSnackbar(resCambiar.mensaje || "Error al terminar el traspaso", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error in handleTerminarTraspaso:", error);
      enqueueSnackbar("Error de red al terminar el traspaso", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Purchase Copying ─────────────────────────────────────────────────────
  const [purchaseList, setPurchaseList] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseProducts, setPurchaseProducts] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingPurchaseProducts, setLoadingPurchaseProducts] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const res = await transferService.listaCompras();
      if (res.exitoso) setPurchaseList(res.datos || []);
      else
        enqueueSnackbar(res.mensaje || "Error al cargar lista de compras", {
          variant: "error",
        });
    } catch (error) {
      console.error("Error fetching purchase list:", error);
      enqueueSnackbar("Error de red al cargar compras", { variant: "error" });
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchPurchaseProducts = async (numeroCompra) => {
    try {
      setLoadingPurchaseProducts(true);
      setSelectedPurchase(numeroCompra);
      const res = await transferService.getProductosCompra(numeroCompra);
      if (res.exitoso) setPurchaseProducts(res.datos || []);
      else
        enqueueSnackbar(
          res.mensaje || "Error al cargar productos de la compra",
          { variant: "error" },
        );
    } catch (error) {
      console.error("Error fetching purchase products:", error);
      enqueueSnackbar("Error de red al cargar productos de compra", {
        variant: "error",
      });
    } finally {
      setLoadingPurchaseProducts(false);
    }
  };

  const copyProductsFromPurchase = () => {
    if (purchaseProducts.length === 0) {
      enqueueSnackbar("No hay productos para copiar", { variant: "warning" });
      return;
    }
    let addedCount = 0;
    let skippedCount = 0;
    setTransferItems((prev) => {
      const newItems = [...prev];
      purchaseProducts.forEach((p) => {
        const exists = newItems.some(
          (item) =>
            item.producto_ID === p.producto_ID && item.lote_ID === p.lote_ID,
        );
        if (!exists) {
          newItems.push({
            sku: p.sku,
            lote_ID: p.lote_ID,
            producto_ID: p.producto_ID,
            codigoProducto: p.codigoProducto || "",
            producto: p.producto,
            laboratorio: p.laboratorio,
            linea: p.linea,
            presentacion: p.presentacion,
            codigoLote: p.numeroLote,
            fechaVencimiento: p.fechaVencimiento?.split("T")[0],
            costoUnitario: p.costoUnitario || 0,
            precioUnitario: p.precioUnitario || 0,
            precioRefencial: p.precioReferencial || 0,
            precioCaja: p.precioCaja || 0,
            stockProducto: p.stockProducto || 0,
            cantidad: p.stockProducto > 0 ? p.stockProducto : 1,
            observaciones: "",
          });
          addedCount++;
        } else {
          skippedCount++;
        }
      });
      return newItems;
    });
    if (addedCount > 0) {
      enqueueSnackbar(
        `Se añadieron ${addedCount} productos${skippedCount > 0 ? ` (${skippedCount} duplicados omitidos)` : ""}`,
        { variant: "success" },
      );
    } else if (skippedCount > 0) {
      enqueueSnackbar("Todos los productos ya estaban en la lista", {
        variant: "info",
      });
    }
    setPurchaseProducts([]);
    setSelectedPurchase(null);
  };

  return {
    viewState,
    setViewState,
    loading,
    loadingCatalogs,
    loadingSearch,
    transferData,
    setTransferData,
    createdTransfer,
    transferItems,
    isReadOnly,
    catalogs,
    handleCreateTransfer,
    loadTraspasoDetalle,
    searchFilters,
    setSearchFilters,
    searchResults,
    searchProducts,
    searchProductsByText,
    addTransferItem,
    updateTransferItem,
    removeTransferItem,
    handleConfirmSave,
    handleTerminarTraspaso,
    purchaseList,
    selectedPurchase,
    purchaseProducts,
    loadingPurchases,
    loadingPurchaseProducts,
    fetchPurchases,
    fetchPurchaseProducts,
    copyProductsFromPurchase,
  };
};
