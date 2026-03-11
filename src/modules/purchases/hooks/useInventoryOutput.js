// src/modules/purchases/hooks/useInventoryOutput.js
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import inventoryService from "../../../services/api/inventoryService";
import purchaseService from "../services/purchaseService";
import userService from "../../../services/api/userService";
import productService from "../../../services/api/productService";
import { useAuth } from "../../../context/AuthContext";

export const useInventoryOutput = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const [viewState, setViewState] = useState("creating"); // creating, adding_products
    const [loading, setLoading] = useState(false);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Search filters (matching Sales Order design)
    const [searchFilters, setSearchFilters] = useState({
        codigo: "",
        nombre: ""
    });
    const [searchResults, setSearchResults] = useState([]);

    // Header data
    const [outputData, setOutputData] = useState({
        descripcion: "",
        codigoSucursal: "",
        codigoMotivoSalida: "",
        codigoProveedor: "",
        documentoReferencia: "",
        codigoResponsable: "",
        observaciones: "",
        fechaSalida: new Date().toISOString().split("T")[0],
    });

    // Created output (result from POST)
    const [createdOutput, setCreatedOutput] = useState(null);

    // Products table
    const [outputItems, setOutputItems] = useState([]);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Catalogs
    const [catalogs, setCatalogs] = useState({
        sucursales: [],
        motivosSalida: [],
        proveedores: [],
        responsables: []
    });

    // Load initial catalogs
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingCatalogs(true);
                const [sucRes, motRes, provRes, empRes] = await Promise.all([
                    userService.getSucursales(),
                    inventoryService.getMotivosSalida(),
                    purchaseService.getProveedores(),
                    userService.getEmpleadosUsuarios()
                ]);

                setCatalogs(prev => ({
                    ...prev,
                    sucursales: sucRes || [],
                    motivosSalida: motRes.datos || [],
                    proveedores: provRes.datos || [],
                    responsables: empRes || []
                }));
            } catch (error) {
                console.error("Error loading inventory output catalogs:", error);
                enqueueSnackbar("Error al cargar catálogos iniciales", { variant: "error" });
            } finally {
                setLoadingCatalogs(false);
            }
        };
        loadInitialData();
    }, [enqueueSnackbar]);

    const handleCreateOutput = async () => {
        if (!outputData.descripcion || !outputData.codigoSucursal || !outputData.codigoMotivoSalida || !outputData.fechaSalida) {
            enqueueSnackbar("Por favor complete los campos obligatorios", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...outputData,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001"
            };

            const res = await inventoryService.crearSalida(payload);
            if (res.exitoso) {
                enqueueSnackbar("Cabecera de salida creada con éxito", { variant: "success" });
                // El API devuelve salida_ID, lo guardamos para usarlo como codigoSalida
                setCreatedOutput(res.datos);
                setViewState("adding_products");
            } else {
                enqueueSnackbar(res.mensaje || "Error al crear la salida", { variant: "error" });
            }
        } catch (error) {
            console.error("Error in handleCreateOutput:", error);
            enqueueSnackbar("Error de red al crear la salida", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = useCallback(async () => {
        const sucursalId = createdOutput?.sucursal_ID || outputData.codigoSucursal;

        if (!sucursalId) {
            enqueueSnackbar("Debe seleccionar una sucursal para buscar productos", { variant: "warning" });
            return;
        }

        if (!searchFilters.codigo && !searchFilters.nombre) {
            enqueueSnackbar("Ingrese al menos un criterio de búsqueda (Código o Nombre)", { variant: "warning" });
            return;
        }

        try {
            setLoadingSearch(true);
            const res = await productService.buscarProductos({
                sucursalId: sucursalId,
                nombre: searchFilters.nombre,
                codigo: searchFilters.codigo
            });

            if (res.exitoso && res.datos) {
                setSearchResults(res.datos);
                if (res.datos.length === 0) {
                    enqueueSnackbar("No se encontraron productos", { variant: "info" });
                }
            } else {
                setSearchResults([]);
                enqueueSnackbar(res.mensaje || "Error en la búsqueda", { variant: "error" });
            }
        } catch (error) {
            console.error("Error searching products:", error);
            setSearchResults([]);
            enqueueSnackbar("Error de conexión al buscar productos", { variant: "error" });
        } finally {
            setLoadingSearch(false);
        }
    }, [createdOutput, outputData.codigoSucursal, searchFilters, enqueueSnackbar]);

    const addOutputItem = (product, quantity, obs) => {
        const newItem = {
            producto_ID: product.producto_ID || product.id,
            codigoProducto: product.producto_ID || product.codigoProducto || product.id,
            producto: product.producto || product.nombreProducto || product.nombre,
            nombreProducto: product.producto || product.nombreProducto || product.nombre,
            laboratorio: product.laboratorio,
            linea: product.linea,
            presentacion: product.presentacion,
            unitMeasure: product.unidadMedida,
            codigoLote: product.lote_ID || product.codigoLote,
            numeroLote: product.numeroLote,
            fechaVencimiento: product.fechaVencimiento,
            costoUnitario: product.precioCosto || 0,
            cantidad: quantity,
            observaciones: obs
        };
        setOutputItems(prev => [...prev, newItem]);
        enqueueSnackbar("Producto añadido a la lista", { variant: "success" });
    };

    const removeOutputItem = (index) => {
        setOutputItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateOutputItem = (index, field, value) => {
        setOutputItems(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleConfirmSave = async () => {
        if (outputItems.length === 0) {
            enqueueSnackbar("Debe añadir al menos un producto", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                codigoSalida: createdOutput.salida_ID,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
                productos: outputItems.map(item => ({
                    codigoProducto: item.codigoProducto,
                    codigoLote: item.codigoLote,
                    numeroLote: item.numeroLote,
                    fechaVencimiento: item.fechaVencimiento,
                    cantidad: item.cantidad,
                    costoUnitario: item.costoUnitario,
                    observaciones: item.observaciones
                }))
            };

            const res = await inventoryService.guardarSalida(payload);
            if (res.exitoso) {
                enqueueSnackbar("Salida guardada y finalizada correctamente", { variant: "success" });
                setIsReadOnly(true);
            } else {
                enqueueSnackbar(res.mensaje || "Error al guardar los productos", { variant: "error" });
            }
        } catch (error) {
            console.error("Error in handleConfirmSave:", error);
            enqueueSnackbar("Error de red al guardar la salida", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return {
        viewState,
        setViewState,
        loading,
        loadingCatalogs,
        loadingSearch,
        outputData,
        setOutputData,
        createdOutput,
        outputItems,
        isReadOnly,
        catalogs,
        handleCreateOutput,
        searchFilters,
        setSearchFilters,
        searchResults,
        searchProducts,
        addOutputItem,
        updateOutputItem,
        removeOutputItem,
        handleConfirmSave
    };
};
