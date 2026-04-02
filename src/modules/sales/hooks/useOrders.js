// src/modules/reports/hooks/useOrders.js
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import productService from "../../../services/api/productService";
import userService from "../../../services/api/userService";
import orderService from "../services/orderService";
import { useAuth } from "../../../context/AuthContext";
import { useOrderStore } from "./useOrderStore";

export const useOrders = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();
    const { savePendingOrder, getPendingOrder, clearPendingOrder, hasPendingOrder } = useOrderStore();

    // Navigation state: 'initial' | 'creating' | 'adding_products'
    const [viewState, setViewState] = useState("initial");
    console.log("⚓ [useOrders] viewState:", viewState);

    // Section 1: Order Data
    const [orderData, setOrderData] = useState({
        sucursalId: "",
        fecha: "",
        descripcion: "",
        lineaId: "",
        laboratorioId: "",
        proveedorId: "",
        observaciones: "",
        pedidoProveedor_ID: null,
    });

    // Section 2: Product Addition
    const [searchFilters, setSearchFilters] = useState({
        codigo: "",
        nombre: "",
    });
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Catalogs
    const [catalogs, setCatalogs] = useState({
        sucursales: [],
        lineas: [],
        laboratorios: [],
        proveedores: [],
    });

    const [loading, setLoading] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [canEdit, setCanEdit] = useState(true);
    const [pendingOrderFound, setPendingOrderFound] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Auto-save to localStorage
    useEffect(() => {
        const currentId = orderData.numeroPedido || orderData.pedidoProveedor_ID;
        // Solo guardamos si hay cambios manuales (isDirty) y no es solo lectura
        if (isDirty && viewState !== "initial" && !isReadOnly && (selectedProducts.length > 0 || orderData.sucursalId)) {
            savePendingOrder(currentId, orderData, selectedProducts);
        }
    }, [orderData, selectedProducts, viewState, isReadOnly, isDirty]);

    // Check for pending "NEW_ORDER" on mount (if we are in initial view)
    useEffect(() => {
        if (hasPendingOrder(null) && viewState === "initial") {
            setPendingOrderFound(getPendingOrder(null));
        }
    }, []);

    // Load initial catalogs
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sucursales, lineas, proveedoresRes] = await Promise.all([
                    userService.getSucursales(),
                    productService.getLineas(),
                    orderService.getProveedores(),
                ]);
                setCatalogs((prev) => ({
                    ...prev,
                    sucursales,
                    lineas,
                    proveedores: proveedoresRes.datos || []
                }));
            } catch (error) {
                console.error("Error loading order catalogs:", error);
            }
        };
        loadInitialData();
    }, []);

    // Load laboratorios when linea changes
    useEffect(() => {
        if (orderData.lineaId) {
            productService.getLaboratorios(orderData.lineaId).then((labs) => {
                setCatalogs((prev) => ({ ...prev, laboratorios: labs }));
            });
        } else {
            setCatalogs((prev) => ({ ...prev, laboratorios: [] }));
        }
    }, [orderData.lineaId]);

    const updateData = (field, value) => {
        if (isReadOnly) return;
        setIsDirty(true);
        setOrderData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'lineaId' ? { laboratorioId: '' } : {})
        }));
    };

    const handleCreateOrder = async () => {
        if (!orderData.sucursalId || !orderData.fecha || !orderData.lineaId || !orderData.laboratorioId || !orderData.proveedorId) {
            enqueueSnackbar("Por favor complete todos los campos obligatorios", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                codigoSucursal: orderData.sucursalId,
                usuarioPedido: user?.usuario_ID || user?.userId || "SISTEMA",
                proveedorPedido: orderData.proveedorId,
                fechaPedido: orderData.fecha,
                descripcion: orderData.descripcion,
                lineaPedido: orderData.lineaId,
                laboratorioPedido: orderData.laboratorioId,
                observaciones: orderData.observaciones,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001" // SACAR DEL CONTEXTO
            };

            const res = await orderService.crearPedido(payload);
            if (res.exitoso) {
                // Aligne create with edit: load full detail after creation
                if (res.datos?.numeroPedido) {
                    await loadPedidoDetalle(res.datos.numeroPedido);
                } else {
                    setOrderData(prev => ({
                        ...prev,
                        pedidoProveedor_ID: res.datos.pedidoProveedor_ID,
                        numeroPedido: res.datos.numeroPedido
                    }));
                    setViewState("adding_products");
                }
                enqueueSnackbar(res.mensaje || "Pedido creado exitosamente.", { variant: "success" });
            } else {
                enqueueSnackbar(res.mensaje || "Error al crear el pedido", { variant: "error" });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadPedidoDetalle = async (numeroPedido) => {
        try {
            setLoading(true);
            const res = await orderService.getPedidoDetalle(numeroPedido);
            if (res.datos) {
                const detail = res.datos;
                setCanEdit(detail.puedeEditar !== false); // Default to true if not specified

                const serverOrderData = {
                    sucursalId: detail.codigoSucursal,
                    fecha: detail.fechaRegistro ? detail.fechaRegistro.split("T")[0] : "",
                    descripcion: detail.observaciones,
                    lineaId: detail.linea || "",
                    laboratorioId: detail.laboratorio || "",
                    proveedorId: detail.codigoProveedor || "",
                    observaciones: detail.observaciones || "",
                    pedidoProveedor_ID: detail.codigoPedido,
                    numeroPedido: detail.numeroPedido
                };

                const serverProducts = (detail.listaProductos || []).map(p => ({
                    producto_ID: p.producto_ID,
                    id: p.producto_ID,
                    codigoProducto: p.codigoProducto,
                    codigo: p.codigoProducto,
                    producto: p.producto,
                    nombre: p.producto,
                    presentacion: p.presentacion,
                    unidadMedida: p.unidadMedida,
                    linea: p.linea,
                    laboratorio: p.laboratorio,
                    stockProducto: p.stockProducto || p.stock || 0,
                    numeroLote: p.numeroLote,
                    fechaVencimiento: p.fechaVencimiento,
                    cantidad: p.cantidadSolicitada,
                    observacionesFila: p.observaciones,
                    isReadOnlyRow: p.estadoLinea !== "PEN"
                }));

                // Verificar cambios locales
                const localData = getPendingOrder(numeroPedido);
                console.log("⚓ [useOrders] checking localData for:", numeroPedido, localData);

                if (localData) {
                    const isDifferent = checkIfDifferent(serverProducts, localData.selectedProducts);
                    console.log("⚓ [useOrders] isDifferent?", isDifferent);

                    if (isDifferent) {
                        console.log("⚓ [useOrders] differences found, showing local storage as priority");
                        setPendingOrderFound(localData);

                        // Guardamos temporalmente los datos del servidor en un backup
                        // Pero mostramos los datos locales (storage) según petición del usuario
                        setOrderData({
                            ...localData.orderData,
                            serverBackup: { data: serverOrderData, products: serverProducts }
                        });
                        setSelectedProducts(localData.selectedProducts);

                        // Calcular estado de lectura basado en los productos locales
                        const hasPendingRec = localData.selectedProducts.some(p => !p.isReadOnlyRow);
                        setIsReadOnly(localData.selectedProducts.length > 0 && !hasPendingRec);

                        // Marcamos como sucio porque hay cambios locales no sincronizados
                        setIsDirty(true);
                        setViewState("adding_products");
                        return;
                    }
                    else {
                        console.log("⚓ [useOrders] data is identical, clearing redundant store");
                        clearPendingOrder(numeroPedido);
                    }
                }

                // Si no hay cambios locales o son iguales, cargar lo del servidor
                setOrderData(serverOrderData);
                setSelectedProducts(serverProducts);
                setIsDirty(false);

                const hasPending = serverProducts.some(p => !p.isReadOnlyRow);
                setIsReadOnly(serverProducts.length > 0 && !hasPending);

                setViewState("adding_products");
            }
        } catch (error) {
            console.error("Error loading order detail:", error);
            enqueueSnackbar("Error al cargar el detalle del pedido", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const checkIfDifferent = (serverProducts, localProducts) => {
        if (!localProducts) return false;
        if (serverProducts.length !== localProducts.length) {
            console.log("⚓ [checkIfDifferent] length mismatch:", serverProducts.length, localProducts.length);
            return true;
        }

        for (const lp of localProducts) {
            const lp_id = lp.producto_ID || lp.id;
            const sp = serverProducts.find(s => (s.producto_ID || s.id) === lp_id);

            if (!sp) {
                console.log("⚓ [checkIfDifferent] product not found in server:", lp_id);
                return true;
            }
            if (Number(sp.cantidad) !== Number(lp.cantidad)) {
                console.log("⚓ [checkIfDifferent] qty mismatch for:", lp_id, sp.cantidad, lp.cantidad);
                return true;
            }
            const sObs = (sp.observacionesFila || "").trim();
            const lObs = (lp.observacionesFila || "").trim();
            if (sObs !== lObs) {
                console.log("⚓ [checkIfDifferent] obs mismatch for:", lp_id, `'${sObs}'`, `'${lObs}'`);
                return true;
            }
        }
        return false;
    };

    const searchProducts = async () => {
        if (isReadOnly) return;
        if (!searchFilters.codigo && !searchFilters.nombre) {
            enqueueSnackbar("Ingrese al menos un criterio de búsqueda", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const res = await productService.buscarProductos({
                sucursalId: orderData.sucursalId,
                nombre: searchFilters.nombre,
                codigo: searchFilters.codigo,
                lineaId: orderData.lineaId,
                laboratorioId: orderData.laboratorioId,
            });

            if (res.exitoso) {
                setSearchResults(res.datos);
                if (res.datos.length === 0) {
                    enqueueSnackbar("No se encontraron productos", { variant: "info" });
                }
            } else {
                enqueueSnackbar(res.mensaje || "Error en la búsqueda", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error al buscar productos", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const addProductToOrder = (product) => {
        if (isReadOnly) return;
        const exists = selectedProducts.find((p) => (p.producto_ID || p.id) === (product.producto_ID || product.id));
        if (exists) {
            enqueueSnackbar("El producto ya está en el pedido", { variant: "warning" });
            return;
        }

        setSelectedProducts((prev) => [
            { ...product, cantidad: "" },
            ...prev
        ]);
        setIsDirty(true);
        enqueueSnackbar("Producto añadido", { variant: "success" });
    };

    const removeProductFromOrder = (productId) => {
        if (isReadOnly) return;
        setIsDirty(true);
        setSelectedProducts((prev) => prev.filter((p) => (p.producto_ID || p.id) !== productId));
    };

    const updateProductQuantity = (productId, cantidad, observation = null) => {
        if (isReadOnly) return;
        setIsDirty(true);
        setSelectedProducts((prev) =>
            prev.map((p) => {
                if ((p.producto_ID || p.id) === productId) {
                    if (p.isReadOnlyRow) return p;
                    return {
                        ...p,
                        cantidad: cantidad === "" ? "" : (parseInt(cantidad) || 0),
                        observacionesFila: observation !== null ? observation : p.observacionesFila
                    };
                }
                return p;
            })
        );
    };

    const handleSaveOrder = async (stayOnPage = false) => {
        if (isReadOnly) return;
        if (selectedProducts.length === 0) {
            enqueueSnackbar("Debe añadir al menos un producto al pedido", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                numeroPedido: orderData.numeroPedido || orderData.pedidoProveedor_ID.toString(),
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
                productos: selectedProducts.map(p => ({
                    productoId: p.producto_ID || p.id,
                    codigoProducto: p.codigoProducto || p.codigo,
                    cantidad: Number(p.cantidad) || 0,
                    observaciones: p.observacionesFila || ""
                }))
            };

            const res = await orderService.guardarPedido(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Pedido guardado exitosamente", { variant: "success" });
                const currentId = orderData.numeroPedido || orderData.pedidoProveedor_ID;
                clearPendingOrder(currentId);

                if (stayOnPage) {
                    setIsDirty(false);
                    // No llamamos a resetFlow para mantener al usuario en la misma página
                } else {
                    resetFlow();
                }
            } else {
                enqueueSnackbar(res.mensaje || "Error al guardar el pedido", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error al guardar el pedido", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        const currentId = orderData.numeroPedido || orderData.pedidoProveedor_ID;
        clearPendingOrder(currentId);
        setViewState("initial");
        setIsReadOnly(false);
        setIsDirty(false);
        setOrderData({
            sucursalId: "",
            fecha: "",
            descripcion: "",
            lineaId: "",
            laboratorioId: "",
            proveedorId: "",
            observaciones: "",
            pedidoProveedor_ID: null,
            numeroPedido: ""
        });
        setSelectedProducts([]);
        setSearchResults([]);
        setSearchFilters({ codigo: "", nombre: "" });
        setPendingOrderFound(null);
    };

    const recoverPendingOrder = () => {
        if (pendingOrderFound) {
            const data = pendingOrderFound;
            console.log("⚓ [useOrders] recovering pending order...", data);

            setPendingOrderFound(null);

            // Si ya los cargamos en loadPedidoDetalle (como prioridad), esto será redundante pero seguro
            setOrderData(data.orderData);
            setSelectedProducts(data.selectedProducts);

            // Marcar como sucio para que el auto-save use estos datos
            setIsDirty(true);

            // Navegar a la vista correcta según si ya tenía ID o no
            setViewState(data.orderData.pedidoProveedor_ID ? "adding_products" : "creating");

            enqueueSnackbar("Selección recuperada de cambios locales", { variant: "info" });
        }
    };

    const discardPendingOrder = () => {
        const idToClear = pendingOrderFound?.orderData?.numeroPedido ||
            pendingOrderFound?.orderData?.pedidoProveedor_ID ||
            null;

        console.log("⚓ [useOrders] discarding pending order for ID:", idToClear);
        const backup = orderData.serverBackup;

        clearPendingOrder(idToClear);
        setPendingOrderFound(null);

        // Si teníamos un backup del servidor (porque estábamos editando), cargamos eso
        if (backup) {
            console.log("⚓ [useOrders] restoring server backup:", backup);
            setOrderData(backup.data);
            setSelectedProducts(backup.products);
            setIsDirty(false);
            const hasPending = backup.products.some(p => !p.isReadOnlyRow);
            setIsReadOnly(backup.products.length > 0 && !hasPending);
            setViewState("adding_products");
        } else {
            enqueueSnackbar("Selección descartada", { variant: "info" });
            if (viewState === "initial") resetFlow();
        }
    };

    const handleCambiarEstado = async (numeroPedido, estado = 'ENV') => {
        try {
            setLoading(true);
            const res = await orderService.cambiarEstadoPedido(numeroPedido, estado);
            if (res.exitoso) {
                clearPendingOrder(numeroPedido);
                // We might want to reload detail to reflect canEdit change
                await loadPedidoDetalle(numeroPedido);
                return true;
            } else {
                enqueueSnackbar(res.mensaje || "Error al cambiar estado", { variant: "error" });
                return false;
            }
        } catch (error) {
            enqueueSnackbar("Error de red al cambiar estado", { variant: "error" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        viewState,
        setViewState,
        orderData,
        updateData,
        handleCreateOrder,
        searchFilters,
        setSearchFilters,
        searchResults,
        searchProducts,
        selectedProducts,
        addProductToOrder,
        removeProductFromOrder,
        updateProductQuantity,
        handleSaveOrder,
        loading,
        isReadOnly,
        catalogs,
        loadPedidoDetalle,
        resetFlow,
        pendingOrderFound,
        recoverPendingOrder,
        discardPendingOrder,
        canEdit,
        onCambiarEstado: handleCambiarEstado,
        clearPendingOrder
    };
};
