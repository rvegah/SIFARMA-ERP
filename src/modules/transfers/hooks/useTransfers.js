// src/modules/transfers/hooks/useTransfers.js
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import transferService from "../services/transferService";
import userService from "../../../services/api/userService";
import { useAuth } from "../../../context/AuthContext";

export const useTransfers = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const [viewState, setViewState] = useState("creating"); // creating, adding_products
    const [loading, setLoading] = useState(false);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Search filters
    const [searchFilters, setSearchFilters] = useState({
        codigo: "",
        nombre: ""
    });
    const [searchResults, setSearchResults] = useState([]);

    // Header data
    const [transferData, setTransferData] = useState({
        descripcion: "",
        codigoSucursalOrigen: "",
        codigoSucursalDestino: "",
        fechaEnvio: new Date().toISOString().split("T")[0],
        observaciones: ""
    });

    // Created transfer (result from POST)
    const [createdTransfer, setCreatedTransfer] = useState(null);

    // Products table
    const [transferItems, setTransferItems] = useState([]);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Catalogs
    const [catalogs, setCatalogs] = useState({
        sucursales: []
    });

    // Load initial catalogs
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingCatalogs(true);
                const sucRes = await userService.getSucursales();
                setCatalogs({
                    sucursales: sucRes || []
                });
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
        if (!transferData.descripcion || !transferData.codigoSucursalOrigen || !transferData.codigoSucursalDestino || !transferData.fechaEnvio) {
            enqueueSnackbar("Por favor complete los campos obligatorios", { variant: "warning" });
            return;
        }

        if (transferData.codigoSucursalOrigen === transferData.codigoSucursalDestino) {
            enqueueSnackbar("La sucursal de destino no puede ser la misma que la de origen", { variant: "error" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                codigoSucursalOrigen: transferData.codigoSucursalOrigen,
                codigoSucursalDestino: transferData.codigoSucursalDestino,
                fechaEnvio: transferData.fechaEnvio,
                usuarioEnvio: user?.usuario_ID || 1,
                observaciones: transferData.observaciones,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001"
            };

            const res = await transferService.crearTraspaso(payload);
            if (res.exitoso) {
                enqueueSnackbar(res.mensaje || "Traspaso iniciado con éxito", { variant: "success" });
                setCreatedTransfer(res.datos);
                setViewState("adding_products");
            } else {
                enqueueSnackbar(res.mensaje || "Error al iniciar el traspaso", { variant: "error" });
            }
        } catch (error) {
            console.error("Error in handleCreateTransfer:", error);
            enqueueSnackbar("Error de red al iniciar el traspaso", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = useCallback(async () => {
        const sucursalId = createdTransfer?.sucursalOrigen_ID || transferData.codigoSucursalOrigen;

        if (!sucursalId) {
            enqueueSnackbar("Debe identificar la sucursal de origen", { variant: "warning" });
            return;
        }

        if (!searchFilters.codigo && !searchFilters.nombre) {
            enqueueSnackbar("Ingrese al menos un criterio de búsqueda (Código o Nombre)", { variant: "warning" });
            return;
        }

        try {
            setLoadingSearch(true);
            const res = await transferService.buscarProductos({
                sucursalId: sucursalId,
                nombre: searchFilters.nombre,
                codigo: searchFilters.codigo
            });

            if (res.exitoso && res.datos) {
                setSearchResults(res.datos);
                if (res.datos.length === 0) {
                    enqueueSnackbar("No se encontraron productos en esta sucursal", { variant: "info" });
                }
            } else {
                setSearchResults([]);
                enqueueSnackbar(res.mensaje || "Error en la búsqueda", { variant: "error" });
            }
        } catch (error) {
            console.error("Error searching products for transfer:", error);
            setSearchResults([]);
            enqueueSnackbar("Error de conexión al buscar productos", { variant: "error" });
        } finally {
            setLoadingSearch(false);
        }
    }, [createdTransfer, transferData.codigoSucursalOrigen, searchFilters, enqueueSnackbar]);

    const addTransferItem = (product, quantity, obs) => {
        const newItem = {
            sku: product.sku,
            lote_ID: product.lote_ID,
            producto_ID: product.producto_ID,
            producto: product.producto || product.nombre,
            laboratorio: product.laboratorio,
            linea: product.linea,
            presentacion: product.presentacion,
            codigoLote: product.codigoLote || product.numeroLote,
            fechaVencimiento: product.fechaVencimiento,
            costoUnitario: product.precioCosto || product.costoUnitario || 0,
            precioUnitario: product.precioVenta || product.precioUnitario || 0,
            precioRefencial: product.precioReferencia || product.precioRefencial || 0,
            cantidad: quantity,
            observaciones: obs
        };
        setTransferItems(prev => [...prev, newItem]);
        enqueueSnackbar("Producto añadido al traspaso", { variant: "success" });
    };

    const removeTransferItem = (index) => {
        setTransferItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateTransferItem = (index, field, value) => {
        setTransferItems(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    // Purchase Copying state
    const [purchaseList, setPurchaseList] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [purchaseProducts, setPurchaseProducts] = useState([]);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [loadingPurchaseProducts, setLoadingPurchaseProducts] = useState(false);

    const fetchPurchases = async () => {
        try {
            setLoadingPurchases(true);
            const res = await transferService.listaCompras();
            if (res.exitoso) {
                // Return data is expected to be an array or inside res.datos
                setPurchaseList(res.datos || []);
            } else {
                enqueueSnackbar(res.mensaje || "Error al cargar lista de compras", { variant: "error" });
            }
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
            if (res.exitoso) {
                setPurchaseProducts(res.datos || []);
            } else {
                enqueueSnackbar(res.mensaje || "Error al cargar productos de la compra", { variant: "error" });
            }
        } catch (error) {
            console.error("Error fetching purchase products:", error);
            enqueueSnackbar("Error de red al cargar productos de compra", { variant: "error" });
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

        setTransferItems(prev => {
            const newItems = [...prev];
            
            purchaseProducts.forEach(p => {
                // Check if already in transfer (by producto_ID and lote_ID)
                const exists = newItems.some(item => 
                    item.producto_ID === p.producto_ID && 
                    item.lote_ID === p.lote_ID
                );

                if (!exists) {
                    newItems.push({
                        sku: p.sku,
                        lote_ID: p.lote_ID,
                        producto_ID: p.producto_ID,
                        producto: p.producto,
                        laboratorio: p.laboratorio,
                        linea: p.linea,
                        presentacion: p.presentacion,
                        codigoLote: p.numeroLote,
                        fechaVencimiento: p.fechaVencimiento?.split('T')[0],
                        costoUnitario: p.costoUnitario || 0,
                        precioUnitario: p.precioUnitario || 0,
                        precioRefencial: p.precioReferencial || 0,
                        cantidad: p.stockProducto > 0 ? p.stockProducto : 1, // Defaulting to stock or 1
                        observaciones: ""
                    });
                    addedCount++;
                } else {
                    skippedCount++;
                }
            });

            return newItems;
        });

        if (addedCount > 0) {
            enqueueSnackbar(`Se añadieron ${addedCount} productos${skippedCount > 0 ? ` (${skippedCount} duplicados omitidos)` : ""}`, { variant: "success" });
        } else if (skippedCount > 0) {
            enqueueSnackbar("Todos los productos ya estaban en la lista", { variant: "info" });
        }

        // Reset purchase products state after copying
        setPurchaseProducts([]);
        setSelectedPurchase(null);
    };

    const handleConfirmSave = async () => {
        if (transferItems.length === 0) {
            enqueueSnackbar("Debe añadir al menos un producto", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                numeroTraspaso: createdTransfer.numeroTraspaso,
                codigoEmpleadoAlta: user?.codigoEmpleado || "EMP-001",
                productos: transferItems.map(item => ({
                    skU_ID: item.sku,
                    lote_ID: item.lote_ID,
                    producto_ID: item.producto_ID,
                    cantidad: item.cantidad,
                    observaciones: item.observaciones,
                    costoUnitario: item.costoUnitario,
                    precioUnitario: item.precioUnitario,
                    precioRefencial: item.precioRefencial,
                }))
            };

            const res = await transferService.guardarTraspaso(payload);
            if (res.exitoso) {
                enqueueSnackbar("Traspaso guardado y finalizado correctamente", { variant: "success" });
                setIsReadOnly(true);
            } else {
                enqueueSnackbar(res.mensaje || "Error al finalizar el traspaso", { variant: "error" });
            }
        } catch (error) {
            console.error("Error in handleConfirmSave transfer:", error);
            enqueueSnackbar("Error de red al guardar el traspaso", { variant: "error" });
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
        transferData,
        setTransferData,
        createdTransfer,
        transferItems,
        isReadOnly,
        catalogs,
        handleCreateTransfer,
        searchFilters,
        setSearchFilters,
        searchResults,
        searchProducts,
        addTransferItem,
        updateTransferItem,
        removeTransferItem,
        handleConfirmSave,
        // Purchase Copying exports
        purchaseList,
        selectedPurchase,
        purchaseProducts,
        loadingPurchases,
        loadingPurchaseProducts,
        fetchPurchases,
        fetchPurchaseProducts,
        copyProductsFromPurchase
    };
};
