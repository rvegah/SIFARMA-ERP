// src/modules/purchases/hooks/usePurchases.js
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import userService from "../../../services/api/userService";
import productService from "../../../services/api/productService";
import purchaseService from "../services/purchaseService";
import { useAuth } from "../../../context/AuthContext";

export const usePurchases = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const [viewState, setViewState] = useState("creating"); // 'creating' | 'paying_credit' | 'adding_products'
    const [loading, setLoading] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Header info after successful first stage
    const [createdPurchase, setCreatedPurchase] = useState(null);

    const [purchaseData, setPurchaseData] = useState({
        descripcion: "",
        fechaCompra: "",
        sucursalId: "",
        tipoFormaPago: "",
        detalleFormaPago: "",
        codigoProveedor: "",
        referencia: "",
        codigoPedido: ""
    });

    const [creditData, setCreditData] = useState({
        fecha: "",
        hora: new Date().toLocaleTimeString('es-BO', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        conceptoPago: "",
        montoDeuda: "",
        montoPago: "",
        montoSaldo: "",
        numeroRecibo: "",
        numeroCheque: "",
        bancoEmitido: "",
        numeroDiasPago: "",
        observaciones: ""
    });

    // Table elements (purchase details)
    const [purchaseItems, setPurchaseItems] = useState([]);

    // Invoice section data
    const [invoiceData, setInvoiceData] = useState({
        numeroFactura: "",
        fecha: "",
        nit: "",
        nombreProveedor: "",
        numeroPedido: "",
        totalCompra: "",
        descuentoComercial: "",
        descuentoEspecial: "",
        importePagar: ""
    });

    const [catalogs, setCatalogs] = useState({
        sucursales: [],
        formasPago: [],
        proveedores: [],
        pedidos: [],
        industrias: []
    });

    // Load initial catalogs
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [sucursales, formasPagoRes, proveedoresRes, industrias] = await Promise.all([
                    userService.getSucursales(),
                    purchaseService.getFormasPago(),
                    purchaseService.getProveedores(),
                    productService.getIndustrias()
                ]);

                setCatalogs((prev) => ({
                    ...prev,
                    sucursales,
                    formasPago: formasPagoRes.datos || [],
                    proveedores: proveedoresRes.datos || [],
                    industrias
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

    // Load orders when sucursalId changes
    useEffect(() => {
        if (!purchaseData.sucursalId) {
            setCatalogs(prev => ({ ...prev, pedidos: [] }));
            setPurchaseData(prev => ({ ...prev, codigoPedido: "" }));
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoadingOrders(true);
                const res = await purchaseService.getListaPedidos(purchaseData.sucursalId);
                if (res.exitoso) {
                    setCatalogs(prev => ({ ...prev, pedidos: res.datos || [] }));
                    setPurchaseData(prev => ({ ...prev, codigoPedido: "" }));
                } else {
                    setCatalogs(prev => ({ ...prev, pedidos: [] }));
                }
            } catch (error) {
                console.error("Error fetching pedidos:", error);
                setCatalogs(prev => ({ ...prev, pedidos: [] }));
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [purchaseData.sucursalId]);

    const handleCreatePurchase = async () => {
        if (!purchaseData.sucursalId || !purchaseData.codigoProveedor || !purchaseData.tipoFormaPago || !purchaseData.codigoPedido) {
            enqueueSnackbar("Por favor complete todos los campos obligatorios", { variant: "warning" });
            return;
        }
        if (!purchaseData.fechaCompra) {
            enqueueSnackbar("Debe seleccionar una Fecha de Compra", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                codigoPedido: purchaseData.codigoPedido,
                codigoProveedor: purchaseData.codigoProveedor,
                fechaCompra: purchaseData.fechaCompra,
                codigoSucursal: purchaseData.sucursalId,
                referencia: purchaseData.referencia,
                descripcion: purchaseData.descripcion,
                tipoFormaPago: purchaseData.tipoFormaPago,
                detalleFormaPago: purchaseData.detalleFormaPago,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001"
            };

            const res = await purchaseService.crearCompra(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Cabecera de compra creada.", { variant: "success" });
                setCreatedPurchase(res.datos);

                // If payment method is Credit (6), go to paying_credit
                if (purchaseData.tipoFormaPago === 6) {
                    setViewState("paying_credit");
                } else {
                    setViewState("adding_products");
                }
            } else {
                enqueueSnackbar(res.mensaje || "Error al crear la compra", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error al conectar con el servidor", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = useCallback(async ({ codigo, nombre }) => {
        try {
            setLoadingSearch(true);
            const res = await productService.buscarProductos({
                sucursalId: purchaseData.sucursalId,
                nombre,
                codigo
            });
            return res.datos || [];
        } catch (error) {
            console.error("Error searching products:", error);
            enqueueSnackbar("Error al buscar productos", { variant: "error" });
            return [];
        } finally {
            setLoadingSearch(false);
        }
    }, [purchaseData.sucursalId, enqueueSnackbar]);

    const searchLaboratorios = useCallback(async (nombre) => {
        if (nombre.length < 3) return [];
        try {
            setLoadingSearch(true);
            const res = await purchaseService.getLaboratorios(nombre);
            return res.datos || [];
        } catch (error) {
            console.error("Error searching laboratorios:", error);
            return [];
        } finally {
            setLoadingSearch(false);
        }
    }, []);

    // Logic for AddProductsToPurchaseSection
    const addItemRow = () => {
        setPurchaseItems(prev => [
            ...prev,
            {
                id: Date.now(),
                codigoProducto: null,
                referenciaNombre: "",
                codigo: "",
                nombreGenerico: "",
                concentracion: "",
                nombreComercial: "",
                presentacion: "",
                codigoLaboratorio: "",
                nombreLaboratorio: "",
                codigoIndustria: "",
                numeroLote: "",
                fechaVencimiento: "",
                cantidad: "",
                numeroBlister: "",
                cantidadUnidadBlister: "",
                factorUnidad: "",
                costoUnitario: "",
                precioUnitario: "",
                precioCaja: ""
            }
        ]);
    };

    const addPurchaseItem = (item) => {
        setPurchaseItems(prev => [...prev, item]);
    };

    const removeItemRow = (id) => {
        setPurchaseItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItemRow = (id, field, value) => {
        setPurchaseItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleSaveProducts = async () => {
        if (!createdPurchase?.comprobanteCompra_ID) return;
        if (purchaseItems.length === 0) {
            enqueueSnackbar("Debe añadir al menos un producto", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                codigoComprobanteCompra: createdPurchase.comprobanteCompra_ID,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
                productos: purchaseItems.map(item => ({
                    codigoProducto: item.codigoProducto || 0,
                    codigo: item.codigo,
                    nombreGenerico: item.nombreGenerico,
                    concentracion: item.concentracion,
                    nombreComercial: item.nombreComercial,
                    presentacion: item.presentacion,
                    codigoLaboratorio: Number(item.codigoLaboratorio) || 0,
                    codigoIndustria: item.codigoIndustria,
                    numeroLote: item.numeroLote,
                    fechaVencimiento: item.fechaVencimiento,
                    cantidad: Number(item.cantidad) || 0,
                    numeroBlister: Number(item.numeroBlister) || 0,
                    cantidadUnidadBlister: Number(item.cantidadUnidadBlister) || 0,
                    factorUnidad: Number(item.factorUnidad) || 0,
                    costoUnitario: Number(item.costoUnitario) || 0,
                    precioUnitario: Number(item.precioUnitario) || 0,
                    precioCaja: Number(item.precioCaja) || 0
                }))
            };

            const res = await purchaseService.guardarProductos(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Productos guardados correctamente", { variant: "success" });
            } else {
                enqueueSnackbar(res.mensaje || "Error al guardar productos", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de red al guardar productos", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInvoice = async () => {
        if (!createdPurchase?.comprobanteCompra_ID) return;
        try {
            setLoading(true);
            const payload = {
                codigoComprobanteCompra: createdPurchase.comprobanteCompra_ID,
                ...invoiceData,
                totalCompra: Number(invoiceData.totalCompra) || 0,
                descuentoComercial: Number(invoiceData.descuentoComercial) || 0,
                descuentoEspecial: Number(invoiceData.descuentoEspecial) || 0,
                importePagar: Number(invoiceData.importePagar) || 0,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001"
            };
            const res = await purchaseService.guardarFactura(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Factura guardada correctamente", { variant: "success" });
            } else {
                enqueueSnackbar(res.mensaje || "Error al guardar factura", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de red al guardar factura", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

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
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001"
            };
            const res = await purchaseService.pagarCredito(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Pago a crédito registrado.", { variant: "success" });
                setViewState("adding_products");
            } else {
                enqueueSnackbar(res.mensaje || "Error al registrar pago crédito", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Error de red al registrar pago crédito", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return {
        purchaseData,
        setPurchaseData,
        catalogs,
        loading,
        loadingOrders,
        loadingSearch,
        viewState,
        setViewState,
        onCreatePurchase: handleCreatePurchase,
        createdPurchase,
        purchaseItems,
        addItemRow,
        addPurchaseItem,
        removeItemRow,
        updateItemRow,
        searchProducts,
        searchLaboratorios,
        handleSaveProducts,
        invoiceData,
        setInvoiceData,
        handleSaveInvoice,
        creditData,
        setCreditData,
        onPagarCredito: handlePagarCredito
    };
};
