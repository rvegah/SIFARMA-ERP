// src/modules/sales/pages/SalesPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { WifiOff, Warning, Wifi } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  Add,
  Save,
  Print,
  Inventory,
  History,
  Store,
  Cancel,
  CloudOff,
  PersonAdd,
  Search,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { useSales } from "../hooks/useSales";
import ClientForm from "../components/ClientForm";
import SaleItemsTable from "../components/SaleItemsTable";
import StockModal from "../components/StockModal";
import MySalesModal from "../components/MySalesModal";
import PrintInvoiceModal from "../components/PrintInvoiceModal";
import siatApiService from "../services/siatApiService";
import CancelInvoiceModal from "../components/CancelInvoiceModal";
import ProductsModal from "../components/ProductsModal";
import { useAuth } from "../../../context/AuthContext";

// ✅ NUEVO: Hook de estado SIAT
import { useSiatStatus } from "../hooks/useSiatStatus";

const CANCELLATION_REASONS = [
  { value: 1, label: "Error en la transcripción" },
  { value: 2, label: "Devolución" },
  { value: 3, label: "Descuento o bonificación" },
  { value: 4, label: "Otro" },
];

// ─── Descripción legible del evento activo ───────────────────────────────────
// Equivalente a obtenerDescripcionEvento() de SIAT-Facturación
// Se usa catálogo hardcode mínimo como fallback (igual que el sistema certificado)
const EVENTOS_DESCRIPCION = {
  1: "Corte de energía eléctrica",
  2: "Falla en la red de comunicaciones",
  3: "Falla en el sistema informático",
  4: "Intervención de la autoridad competente",
  5: "Contingencia por otros motivos",
  6: "Contingencia - Desastres/Siniestros",
  7: "Contingencia - Otros",
};

const obtenerDescripcionEvento = (eventoId) => {
  return EVENTOS_DESCRIPCION[eventoId] || `Evento ${eventoId}`;
};

// ─── Banner de estado SIAT ────────────────────────────────────────────────────
// Componente interno que muestra el estado de conexión y evento activo
// Replica fielmente la alerta de FacturacionPage.tsx de SIAT-Facturación
const SiatStatusBanner = ({
  siatOnline,
  eventoActivo,
  loading,
  isContingencia,
}) => {
  // No mostrar nada mientras carga la primera vez
  if (loading && siatOnline === null) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {/* ── Indicador de conexión (solo cuando está offline) ── */}
      <Collapse in={siatOnline === false && !eventoActivo}>
        <Alert
          severity="error"
          icon={<WifiOff fontSize="inherit" />}
          sx={{
            mb: 1,
            borderLeft: "4px solid #d32f2f",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>SIAT Fuera de Línea</AlertTitle>
          <Typography variant="body2">
            No hay conexión con el servicio de facturación electrónica. Las
            facturas se almacenarán localmente hasta restablecer la conexión.
          </Typography>
        </Alert>
      </Collapse>

      {/* ── Alerta de evento/contingencia activa ── */}
      <Collapse in={!!eventoActivo}>
        {eventoActivo && (
          <Alert
            severity="warning"
            icon={<Warning fontSize="inherit" />}
            sx={{
              borderLeft: "4px solid #f57c00",
              backgroundColor: "#fff8e1",
              "& .MuiAlert-message": { width: "100%" },
            }}
            action={
              <Chip
                label={isContingencia ? "CONTINGENCIA" : "EVENTO"}
                size="small"
                sx={{
                  backgroundColor: isContingencia ? "#e53935" : "#f57c00",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            }
          >
            <AlertTitle sx={{ fontWeight: 700, color: "#e65100" }}>
              ⚠️ Evento/Contingencia Activa!!!
            </AlertTitle>

            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#bf360c" }}
            >
              {eventoActivo.eventoId}:{" "}
              {obtenerDescripcionEvento(eventoActivo.eventoId)}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "#e65100", display: "block", mt: 0.5 }}
            >
              <strong>Desde:</strong>{" "}
              {eventoActivo.fechaInicio
                ? new Date(eventoActivo.fechaInicio).toLocaleString("es-BO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
              {eventoActivo.fechaFin && (
                <>
                  {" — "}
                  <strong>Hasta:</strong>{" "}
                  {new Date(eventoActivo.fechaFin).toLocaleString("es-BO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "#bf360c", display: "block", mt: 0.5 }}
            >
              {isContingencia ? (
                <>
                  <strong>MODO CONTINGENCIA:</strong> Debe ingresar el número de
                  factura, fecha y hora del talonario manual. Las facturas se
                  enviarán a SIAT al cerrar la contingencia.
                </>
              ) : (
                <>
                  Todas las facturas generadas se almacenarán localmente y no se
                  enviarán a SIAT hasta cerrar el evento/contingencia.
                </>
              )}
            </Typography>
          </Alert>
        )}
      </Collapse>
    </Box>
  );
};

// ─── Modal de conflicto de actividad ─────────────────────────────────────────
const ActivityConflictModal = ({ open, onClose, onConfirm, productoNuevo, actividadActual }) => {
  if (!open || !productoNuevo) return null;

  const ACTIVIDADES = {
    4772100: "Venta al por menor de productos farmacéuticos",
    6810110: "Alquiler de bienes inmuebles",
  };

  const descActual = ACTIVIDADES[actividadActual] || `Actividad ${actividadActual}`;
  const descNueva = ACTIVIDADES[productoNuevo.codigoActividad] || `Actividad ${productoNuevo.codigoActividad}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#f57c00", color: "white", fontWeight: 700 }}>
        ⚠️ Conflicto de Actividad
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pueden mezclar productos de diferentes actividades en una misma factura.
        </Alert>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Actividad actual:</strong> {actividadActual} — {descActual}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Actividad nueva:</strong> {productoNuevo.codigoActividad} — {descNueva}
        </Typography>
        <Typography variant="body2" color="error">
          Si continúa, se <strong>limpiarán todos los productos</strong> y se agregará el nuevo producto.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Limpiar y continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

const SalesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const isAdmin = user?.rol === "Administrador";

  // ✅ IDs de sucursal y punto de venta del usuario autenticado
  const sucursalId = user?.codigoSucursal_SIAT ?? 0;
  const puntoVentaId = user?.codigoPuntoVenta_SIAT ?? 0;

  // ✅ NUEVO: Estado de SIAT (conexión + evento activo)
  const {
    siatOnline,
    eventoActivo,
    loading: loadingSiat,
    isContingencia,
  } = useSiatStatus(sucursalId, puntoVentaId);

  const {
    clientForm,
    saleItems,
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
    saveSale,
    invoiceSale,
    clearForm,
    loadSaleData,
  } = useSales();

  const totals = React.useMemo(
    () => calculateTotals(),
    [saleItems, clientForm],
  );

  // Catálogos dinámicos SIAT
  const [tiposDocumentoIdentidad, setTiposDocumentoIdentidad] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState({});

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mySalesModalOpen, setMySalesModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [invoiceDataToPrint, setInvoiceDataToPrint] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [invoiced, setInvoiced] = useState(false);
  // ── Control de actividad mixta ────────────────────────────────────────────
  const [productoConflicto, setProductoConflicto] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  // Cargar catálogos SIAT al montar
  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [tiposDoc, infoEmpresa, mapaUnidades] = await Promise.all([
          siatApiService.getTiposDocumentoIdentidad(),
          siatApiService.getEmpresaInfo(),
          siatApiService.getUnidadesMedida(),
        ]);
        setTiposDocumentoIdentidad(tiposDoc);
        setEmpresaInfo(infoEmpresa);
        setUnidadesMedida(mapaUnidades);
        console.log(
          "✅ Unidades de medida cargadas:",
          Object.keys(mapaUnidades).length,
        );
        console.log("✅ Tipos de documento cargados:", tiposDoc.length);
        console.log("✅ Empresa info cargada:", infoEmpresa?.razonSocial);
      } catch (err) {
        console.error("❌ Error al cargar catálogos SIAT:", err);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  // Ver stock en sucursales
  const handleViewStock = () => setStockModalOpen(true);

  // Guardar venta sin facturar (< 5 Bs)
  const handleSaveSale = async () => {
    if (totals.total >= 5) {
      enqueueSnackbar("Esta opción es solo para ventas menores a 5 Bs.", {
        variant: "warning",
      });
      return;
    }
    const result = await saveSale();
    if (result.success) {
      enqueueSnackbar(result.message, { variant: "success" });
      clearForm();
    } else {
      enqueueSnackbar(result.message, { variant: "error" });
    }
  };

  const handlePrintInvoice = async () => {
    if (saleItems.length === 0) {
      enqueueSnackbar("Debe agregar al menos un producto", {
        variant: "warning",
      });
      return;
    }

    // ── Validación de pago ────────────────────────────────────────────────
    const pagado = Number(clientForm.pagado) || 0;
    if (pagado <= 0) {
      enqueueSnackbar("Debe ingresar el monto pagado por el cliente", {
        variant: "warning",
      });
      return;
    }
    if (pagado < totals.total) {
      enqueueSnackbar(
        `El monto pagado (Bs. ${pagado.toFixed(2)}) es menor al total de la venta (Bs. ${totals.total.toFixed(2)})`,
        { variant: "warning", autoHideDuration: 5000 },
      );
      return;
    }
    enqueueSnackbar("Generando factura...", { variant: "info" });
    try {
      const result = await invoiceSale();
      if (!result.success) {
        enqueueSnackbar(result.message || "Error al generar la factura", {
          variant: "error",
        });
        return;
      }
      const invoice = result.invoice;
      const invoiceData = {
        empresa: {
          razonSocial: empresaInfo?.razonSocial ?? "FARMADINAMICA S.R.L.",
          nit: empresaInfo?.nit ?? "425567025",
          direccionCasaMatriz:
            empresaInfo?.direccion ??
            "ZONA: SUDESTE, AVENIDA: SAN MARTÍN, TIPO DE ESTABLECIMIENTO: EDIFICIO BRILLANTE, NRO.: 651, BLOQUE: 1, NRO DPTO/LOCAL/OF/PUESTO: 1",
          telefono: empresaInfo?.telefono ?? "+591 70741024",
          ciudad: empresaInfo?.ciudad ?? "Cochabamba",
        },
        factura: {
          facturaId: invoice.facturaId,
          numeroFactura: invoice.numeroFactura,
          codigoAutorizacion: invoice.cuf,
          cuf: invoice.cuf,
          fechaEmision: invoice.fechaEmision,
          qrUrl: invoice.urlVerificacion,
          estado: invoice.estado,
          puntoVenta: invoice.puntoVenta ?? 0,
          esAlquiler: clientForm.codigoDocumentoSector === "2",
          periodoFacturado:
            clientForm.codigoDocumentoSector === "2"
              ? clientForm.periodoFacturado
              : null,
        },
        cliente: {
          nit: clientForm.nit,
          nombre: clientForm.nombre,
          celular: clientForm.celular,
          email: clientForm.email,
        },
        items: saleItems.map((item) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          descuento: item.descuento,
          subtotal: item.subtotal,
          unidadMedida:
            unidadesMedida[item.unidadMedida] ??
            item.unidadMedida?.toString() ??
            "UNIDAD",
        })),
        totales: {
          subtotal: totals.subtotal,
          descuentoAdicional: totals.descuentoAdicional,
          total: totals.total,
        },
        pagado: clientForm.pagado,
        cambio: clientForm.cambio,
        usuario: "Usuario Sistema",
        leyendas: {
          principal:
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY",
          ley453:
            "Ley N° 453: En caso de incumplimiento a lo ofertado o convenido, el proveedor debe reparar o sustituir el producto.",
          documentoDigital: invoice.esEnLinea
            ? "Este documento es la Representacion Grafica de un Documento Fiscal Digital emitido en una modalidad de facturacion en linea"
            : "Este documento es la Representacion Grafica de un Documento Fiscal Digital emitido fuera de linea, verifique su envio con su proveedor o en la pagina www.impuestos.gob.bo",
        },
      };
      setInvoiceDataToPrint(invoiceData);
      setPrintModalOpen(true);
      setInvoiced(true);
      enqueueSnackbar(
        invoice.estado === "VALIDATED"
          ? "✅ Factura validada por SIAT"
          : "⏳ Factura pendiente de validación",
        { variant: "success" },
      );
    } catch (error) {
      enqueueSnackbar(error.message || "Error al generar la factura", {
        variant: "error",
      });
    }
  };

  const handleNewSale = () => {
    setInvoiced(false);
    clearForm();
    enqueueSnackbar("Listo para nueva venta", { variant: "info" });
  };

  const handleLoadSale = (saleData) => {
    console.log("🔄 Recuperando venta desde modal:", saleData);
    loadSaleData(saleData);
    setMySalesModalOpen(false);

    if (saleData.metadata?.status === "FACTURADA") {
      enqueueSnackbar(
        "✅ Venta facturada cargada. Puede agregar productos y generar nueva factura (se anulará la anterior automáticamente).",
        { variant: "info", autoHideDuration: 6000 },
      );
    } else if (saleData.metadata?.status === "GUARDADA") {
      enqueueSnackbar(
        "✅ Venta guardada cargada. Puede modificar y facturar.",
        { variant: "info", autoHideDuration: 4000 },
      );
    } else {
      enqueueSnackbar("✅ Venta cargada correctamente", { variant: "success" });
    }
  };

  const handleCancelInvoice = () => {
    if (saleItems.length === 0) {
      enqueueSnackbar("No hay ninguna factura cargada para anular", {
        variant: "warning",
      });
      return;
    }
    const facturaId = invoiceDataToPrint?.factura?.facturaId;
    if (!facturaId) {
      enqueueSnackbar(
        "Cargue la factura desde 'Mis Ventas' para poder anularla",
        { variant: "warning" },
      );
      return;
    }
    setInvoiceToCancel({
      facturaId,
      numeroFactura: invoiceDataToPrint.factura.numeroFactura,
      fechaEmision: invoiceDataToPrint.factura.fechaEmision,
      cliente: { nombre: clientForm.nombre, nit: clientForm.nit },
      totales: { total: totals.total },
      items: saleItems.map((i) => ({
        nombre: i.nombre,
        cantidad: i.cantidad,
        subtotal: i.subtotal,
      })),
    });
    setCancelModalOpen(true);
  };

  const handleConfirmCancellation = async (codigoMotivo) => {
    try {
      await siatApiService.anularFactura(
        invoiceToCancel.facturaId,
        codigoMotivo,
      );
      clearForm();
      setInvoiceDataToPrint(null);
      setCancelModalOpen(false);
      setInvoiceToCancel(null);
      const motivoLabel = CANCELLATION_REASONS.find(
        (r) => r.value === codigoMotivo,
      )?.label;
      enqueueSnackbar(`✅ Factura anulada. Motivo: ${motivoLabel}`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(error.message || "Error al anular la factura", {
        variant: "error",
      });
    }
  };

  const handleViewProducts = () => setProductsModalOpen(true);

  const handlePrintOffline = () => {
    enqueueSnackbar("Impresión fuera de línea en desarrollo", {
      variant: "info",
    });
  };

  const handleSaveClient = () => {
    if (!clientForm.nit || !clientForm.nombre) {
      enqueueSnackbar("Complete NIT y Nombre para guardar el cliente", {
        variant: "warning",
      });
      return;
    }
    enqueueSnackbar("Cliente guardado correctamente", { variant: "success" });
  };

  const handlePrintComplete = (printedInvoice) => {
    console.log("✅ Factura impresa:", printedInvoice);
    enqueueSnackbar(
      "Factura generada exitosamente. Verifique la entrega de productos al cliente.",
      { variant: "success", autoHideDuration: 5000 },
    );
  };

  // ── Agregar producto con validación de actividad ──────────────────────────
  const handleAddItemConValidacion = (product) => {
    // Verificar conflicto de actividad
    if (saleItems.length > 0) {
      const actividadActual = saleItems[0].codigoActividad;
      const actividadNueva = product.codigoActividad || 4772100;
      if (actividadActual !== actividadNueva) {
        setProductoConflicto(product);
        setActivityModalOpen(true);
        return;
      }
    }
    addItem(product);
    enqueueSnackbar(`✅ ${product.nombre} agregado`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const handleConfirmActivityChange = () => {
    if (!productoConflicto) return;
    // Limpiar carrito y agregar nuevo producto
    clearForm();
    addItem(productoConflicto);
    setActivityModalOpen(false);
    setProductoConflicto(null);
    enqueueSnackbar(`✅ Limpiado. ${productoConflicto.nombre} agregado`, {
      variant: "info",
      autoHideDuration: 3000,
    });
  };

  const handleSelectProductFromModal = (product) => {
    console.log("📦 Producto seleccionado desde modal:", product);
    handleAddItemConValidacion(product);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* ✅ NUEVO: Banner de estado SIAT — visible para el vendedor */}
      <SiatStatusBanner
        siatOnline={siatOnline}
        eventoActivo={eventoActivo}
        loading={loadingSiat}
        isContingencia={isContingencia}
      />

      {/* Formulario de cliente */}
      <ClientForm
        clientForm={clientForm}
        setClientForm={setClientForm}
        handleClientSearch={handleClientSearch}
        totals={totals}
        tiposDocumentoIdentidad={tiposDocumentoIdentidad}
        loadingCatalogos={loadingCatalogos}
        isAdmin={isAdmin}
      />

      {/* Tabla de items CON búsqueda integrada */}
      <SaleItemsTable
        items={saleItems}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onAddItem={handleAddItemConValidacion}
        onSearchProducts={searchProducts}
        searchResults={searchResults}
        isSearching={isSearching}
        invoiced={invoiced}
        unidadesMedidaCatalogo={unidadesMedida}
      />

      {/* SECCIÓN DE BOTONES */}
      <Box sx={{ mt: 3 }}>
        {/* BOTÓN PRINCIPAL: Imprimir Factura */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Print />}
            onClick={handlePrintInvoice}
            disabled={loading || saleItems.length === 0 || invoiced}
            sx={{
              width: "300px",
              backgroundColor: farmaColors.primary,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              boxShadow: `0 4px 12px ${farmaColors.alpha.primary30}`,
              "&:hover": {
                backgroundColor: farmaColors.primaryDark,
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${farmaColors.alpha.primary30}`,
              },
              transition: "all 0.2s",
            }}
          >
            Imprimir Factura
          </Button>
        </Box>

        {/* Botones secundarios */}
        <Grid container spacing={1}>
          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={handleNewSale}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10,
                },
              }}
            >
              Nueva Venta
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveSale}
              disabled={loading || saleItems.length === 0}
              sx={{
                borderColor: farmaColors.secondary,
                color: farmaColors.secondary,
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: farmaColors.secondaryDark,
                  bgcolor: farmaColors.alpha.secondary10,
                },
              }}
            >
              Guardar Venta
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<History />}
              onClick={() => setMySalesModalOpen(true)}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Mis Ventas
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Store />}
              onClick={handleViewStock}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Ver Stock
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Search />}
              onClick={handleViewProducts}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Productos
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={handleSaveClient}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Guardar Cliente
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CloudOff />}
              onClick={handlePrintOffline}
              disabled={loading || saleItems.length === 0}
              sx={{
                borderColor: "#757575",
                color: "#424242",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#424242",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Imprimir FFDL
            </Button>
          </Grid>

          <Grid item xs={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancelInvoice}
              disabled={saleItems.length === 0}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "error.dark",
                  bgcolor: "rgba(244, 67, 54, 0.05)",
                },
              }}
            >
              Anular Factura
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Totales de venta */}
      <Box
        sx={{
          mt: 3,
          p: 2.5,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          border: `2px solid ${farmaColors.secondary}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Subtotal
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: farmaColors.secondary }}
              >
                Bs. {totals.subtotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Descuento
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#f44336" }}
              >
                - Bs. {totals.descuentoAdicional.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Pagado
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: farmaColors.primary }}
              >
                Bs. {totals.pagado.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Cambio
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#4caf50" }}
              >
                Bs. {totals.cambio.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Modales — sin cambios */}
      <StockModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        product={selectedProduct}
      />

      <MySalesModal
        open={mySalesModalOpen}
        onClose={() => setMySalesModalOpen(false)}
        onLoadSale={handleLoadSale}
        userId={1}
      />

      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoiceData={invoiceDataToPrint}
        onPrintComplete={handlePrintComplete}
      />

      <CancelInvoiceModal
        open={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setInvoiceToCancel(null);
        }}
        onConfirm={handleConfirmCancellation}
        invoice={invoiceToCancel}
        loading={loading}
      />

      <ProductsModal
        open={productsModalOpen}
        onClose={() => setProductsModalOpen(false)}
        onSelectProduct={handleSelectProductFromModal}
      />

      <ActivityConflictModal
        open={activityModalOpen}
        onClose={() => { setActivityModalOpen(false); setProductoConflicto(null); }}
        onConfirm={handleConfirmActivityChange}
        productoNuevo={productoConflicto}
        actividadActual={saleItems[0]?.codigoActividad}
      />
    </Container>
  );
};

export default SalesPage;
