// src/modules/purchases/hooks/useCreditPurchases.js
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import userService from "../../../services/api/userService";
import purchaseService from "../services/purchaseService";

export const useCreditPurchases = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [catalogs, setCatalogs] = useState({
        sucursales: [],
        formasPago: [],
        proveedores: []
    });

    const [filters, setFilters] = useState({
        CodigoSucursal: "",
        FechaCompraInicio: "",
        FechaCompraFinal: "",
        TipoFormaPago: "",
        TieneSaldoPago: "",
        CodigoProveedor: "",
        NumeroFactura: ""
    });

    // Load catalogs
    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                setLoading(true);
                const [sucursales, formasPagoRes, proveedoresRes] = await Promise.all([
                    userService.getSucursales(),
                    purchaseService.getFormasPago(),
                    purchaseService.getProveedores()
                ]);

                setCatalogs({
                    sucursales: sucursales || [],
                    formasPago: formasPagoRes.datos || [],
                    proveedores: proveedoresRes.datos || []
                });
            } catch (error) {
                console.error("Error loading credit purchases catalogs:", error);
                enqueueSnackbar("Error al cargar catálogos", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };
        loadCatalogs();
    }, [enqueueSnackbar]);

    const handleSearch = async () => {
        // Validation
        if (!filters.CodigoSucursal || !filters.TipoFormaPago || !filters.FechaCompraInicio || !filters.FechaCompraFinal || filters.TieneSaldoPago === "") {
            enqueueSnackbar("Por favor complete los campos obligatorios: Sucursal, Forma de Pago, Saldo y Fechas", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);

            // Construct params dynamically
            const params = {};

            // Mandatory ones
            params.CodigoSucursal = filters.CodigoSucursal;
            params.TipoFormaPago = filters.TipoFormaPago;
            params.FechaCompraInicio = filters.FechaCompraInicio;
            params.FechaCompraFinal = filters.FechaCompraFinal;
            params.TieneSaldoPago = filters.TieneSaldoPago === true || filters.TieneSaldoPago === "true";

            // Optional ones - only send if they have a value
            if (filters.CodigoProveedor) {
                params.CodigoProveedor = filters.CodigoProveedor;
            }
            if (filters.NumeroFactura && filters.NumeroFactura.trim() !== "") {
                params.NumeroFactura = filters.NumeroFactura.trim();
            }

            const res = await purchaseService.getComprasCredito(params);
            if (res.exitoso) {
                setResults(res.datos || []);
                if (res.datos?.length === 0) {
                    enqueueSnackbar("No se encontraron resultados", { variant: "info" });
                }
            } else {
                enqueueSnackbar(res.mensaje || "Error al buscar compras al crédito", { variant: "error" });
            }
        } catch (error) {
            console.error("Error in getComprasCredito:", error);
            enqueueSnackbar("Error de red al buscar compras", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    return {
        loading,
        filters,
        results,
        catalogs,
        updateFilter,
        onSearch: handleSearch
    };
};
