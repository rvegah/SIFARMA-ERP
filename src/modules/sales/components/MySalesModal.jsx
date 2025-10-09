// src/modules/sales/components/MySalesModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
} from "@mui/material";
import {
  Close,
  Refresh,
  Print,
  Search,
  GetApp,
  Warning,
} from "@mui/icons-material";

const farmaColors = {
  primary: "#CC6C06",
  primaryDark: "#A55505",
  secondary: "#05305A",
  secondaryDark: "#032340",
  alpha: {
    primary10: "rgba(204, 108, 6, 0.1)",
    primary20: "rgba(204, 108, 6, 0.2)",
    primary30: "rgba(204, 108, 6, 0.3)",
    secondary10: "rgba(5, 48, 90, 0.1)",
  },
};

// Mock data de ventas
const MOCK_SALES = [
  {
    id: 1,
    numeroFactura: "45645",
    fechaCreacion: "2025-10-08T10:30:00",
    cliente: {
      nit: "3723191",
      complemento: "",
      nombre: "RODRIGO VEGA HEREDIA",
      celular: "59167598791",
      email: "rodrigovegaheredia@gmail.com",
      fechaNacimiento: "1990-05-15",
      tipoDocumento: "1",
    },
    items: [
      {
        id: 1,
        codigo: "5404",
        nombre: "MENTISAN LATA 15 GR",
        cantidad: 1,
        precio: 9.0,
        descuento: 0,
        subtotal: 9.0,
        stock: 1129,
        linea: "INTI",
        laboratorio: "INTI",
        presentacion: "CAJA X 144",
        unidadMedida: "LATAS",
      },
    ],
    totales: {
      subtotal: 9.0,
      descuentoAdicional: 0,
      total: 9.0,
    },
    pagado: 10,
    cambio: 1.0,
    status: "FACTURADA",
    sucursal: "SAN MARTIN",
  },
  {
    id: 2,
    numeroFactura: "45646",
    fechaCreacion: "2025-10-08T11:15:00",
    cliente: {
      nit: "4444",
      complemento: "",
      nombre: "SIN NOMBRE",
      celular: "",
      email: "",
      fechaNacimiento: "",
      tipoDocumento: "1",
    },
    items: [
      {
        id: 1,
        codigo: "4020",
        nombre: "IBUPROFENO 800 MG COMPR",
        cantidad: 2,
        precio: 1.3,
        descuento: 0,
        subtotal: 2.6,
        stock: 732,
        linea: "COFAR",
        laboratorio: "COFAR",
        presentacion: "CAJA X 100",
        unidadMedida: "CAJA",
      },
    ],
    totales: {
      subtotal: 2.6,
      descuentoAdicional: 0,
      total: 2.6,
    },
    pagado: 5,
    cambio: 2.4,
    status: "FACTURADA",
    sucursal: "SAN MARTIN",
  },
  {
    id: 3,
    numeroFactura: null,
    fechaCreacion: "2025-10-08T12:00:00",
    cliente: {
      nit: "99001",
      complemento: "",
      nombre: "Consulados, Embajadas",
      celular: "",
      email: "",
      fechaNacimiento: "",
      tipoDocumento: "5",
    },
    items: [
      {
        id: 1,
        codigo: "5404",
        nombre: "MENTISAN LATA 15 GR",
        cantidad: 1,
        precio: 9.0,
        descuento: 0,
        subtotal: 9.0,
        stock: 1129,
        linea: "INTI",
        laboratorio: "INTI",
        presentacion: "CAJA X 144",
        unidadMedida: "LATAS",
      },
    ],
    totales: {
      subtotal: 3.5,
      descuentoAdicional: 0,
      total: 3.5,
    },
    pagado: 0,
    cambio: 0,
    status: "GUARDADA",
    sucursal: "SAN MARTIN",
  },
  {
    id: 4,
    numeroFactura: "45643",
    fechaCreacion: "2025-10-08T09:45:00",
    cliente: {
      nit: "99002",
      complemento: "",
      nombre: "Control Tributario",
      celular: "",
      email: "",
      fechaNacimiento: "",
      tipoDocumento: "5",
    },
    items: [
      {
        id: 1,
        codigo: "8573",
        nombre: "ABRILAR JARABE (HEDERA HELIX JARABE)",
        cantidad: 1,
        precio: 50.0,
        descuento: 5.0,
        subtotal: 45.0,
        stock: 15,
        linea: "MEGALABS",
        laboratorio: "ROEMMERS",
        presentacion: "FRASCO 100 ML",
        unidadMedida: "UNIDAD",
      },
    ],
    totales: {
      subtotal: 50.0,
      descuentoAdicional: 5.0,
      total: 45.0,
    },
    pagado: 50,
    cambio: 5.0,
    status: "FACTURADA",
    sucursal: "SAN MARTIN",
  },
  {
    id: 5,
    numeroFactura: "45644",
    fechaCreacion: "2025-10-08T14:20:00",
    cliente: {
      nit: "12568704",
      complemento: "",
      nombre: "MARIA PEREZ",
      celular: "59172345678",
      email: "maria.perez@gmail.com",
      fechaNacimiento: "1985-03-20",
      tipoDocumento: "1",
    },
    items: [
      {
        id: 1,
        codigo: "4020",
        nombre: "IBUPROFENO 800 MG COMPR",
        cantidad: 5,
        precio: 1.3,
        descuento: 0,
        subtotal: 6.5,
        stock: 732,
        linea: "COFAR",
        laboratorio: "COFAR",
        presentacion: "CAJA X 100",
        unidadMedida: "CAJA",
      },
    ],
    totales: {
      subtotal: 6.5,
      descuentoAdicional: 0,
      total: 6.5,
    },
    pagado: 10,
    cambio: 3.5,
    status: "ANULADA",
    sucursal: "SAN MARTIN",
  },
];

const MySalesModal = ({ open, onClose, onLoadSale, userId }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSale, setSelectedSale] = useState(null);

  const [filters, setFilters] = useState({
    fechaDesde: new Date().toISOString().split("T")[0],
    fechaHasta: new Date().toISOString().split("T")[0],
    numeroFactura: "",
    nitCliente: "",
    descuentoDesde: "",
    descuentoHasta: "",
    codigo: "",
    producto: "",
  });

  useEffect(() => {
    if (open) {
      loadSales();
    }
  }, [open]);

  const loadSales = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSales(MOCK_SALES);
      setFilteredSales(MOCK_SALES);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...sales];

    if (filters.fechaDesde) {
      filtered = filtered.filter(
        (sale) => new Date(sale.fechaCreacion) >= new Date(filters.fechaDesde)
      );
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      filtered = filtered.filter(
        (sale) => new Date(sale.fechaCreacion) <= fechaHasta
      );
    }

    if (filters.numeroFactura) {
      filtered = filtered.filter((sale) =>
        sale.numeroFactura?.includes(filters.numeroFactura)
      );
    }

    if (filters.nitCliente) {
      filtered = filtered.filter((sale) =>
        sale.cliente.nit?.includes(filters.nitCliente)
      );
    }

    if (filters.codigo) {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) => item.codigo.includes(filters.codigo))
      );
    }

    if (filters.producto) {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) =>
          item.nombre.toLowerCase().includes(filters.producto.toLowerCase())
        )
      );
    }

    setFilteredSales(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectSale = (sale) => {
    setSelectedSale(selectedSale?.id === sale.id ? null : sale);
  };

  // ============================================
  // 🔥 FUNCIÓN CRÍTICA: Preparar datos completos
  // ============================================
  const handleLoadSale = () => {
    if (!selectedSale) return;

    console.log("📤 Preparando venta para cargar:", selectedSale);

    // Estructura de datos COMPLETA para recuperar venta
    const saleDataToLoad = {
      // 1. Datos del cliente - TODOS los campos
      clientForm: {
        nit: selectedSale.cliente.nit || "",
        complemento: selectedSale.cliente.complemento || "",
        nombre: selectedSale.cliente.nombre || "",
        celular: selectedSale.cliente.celular || "",
        email: selectedSale.cliente.email || "",
        fechaNacimiento: selectedSale.cliente.fechaNacimiento || "",
        tipoDocumento: selectedSale.cliente.tipoDocumento || "1",
        descuentoAdicional: selectedSale.totales.descuentoAdicional || 0,
        pagado: selectedSale.pagado || 0,
        cambio: selectedSale.cambio || 0,
      },

      // 2. 🔥 Items/Productos - Array completo
      items: selectedSale.items.map((item) => ({
        id: item.id,
        productId: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        descuento: item.descuento || 0,
        subtotal: item.subtotal,
        stock: item.stock,
        linea: item.linea || "",
        laboratorio: item.laboratorio || "",
        presentacion: item.presentacion || "",
        unidadMedida: item.unidadMedida || "UNIDAD",
      })),

      // 3. Totales
      totales: {
        subtotal: selectedSale.totales.subtotal || 0,
        descuentoAdicional: selectedSale.totales.descuentoAdicional || 0,
        total: selectedSale.totales.total || 0,
      },

      // 4. Metadata para referencia
      metadata: {
        ventaId: selectedSale.id,
        numeroFactura: selectedSale.numeroFactura,
        fechaCreacion: selectedSale.fechaCreacion,
        status: selectedSale.status,
        sucursal: selectedSale.sucursal,
      },
    };

    console.log("✅ Datos estructurados para enviar:", saleDataToLoad);
    console.log("  → Cliente:", saleDataToLoad.clientForm.nombre);
    console.log("  → Items:", saleDataToLoad.items.length, "productos");
    console.log("  → Total:", saleDataToLoad.totales.total);

    // Enviar al componente padre (SalesPage)
    onLoadSale(saleDataToLoad);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "FACTURADA":
        return "success";
      case "GUARDADA":
        return "warning";
      case "ANULADA":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderDatosFactura = () => (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary }}
      >
        Datos Factura
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Factura ID:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.numeroFactura || "Sin factura"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Fecha:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatDate(selectedSale?.fechaCreacion)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Sucursal:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.sucursal}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Estado:
          </Typography>
          <Chip
            label={selectedSale?.status}
            size="small"
            color={getStatusColor(selectedSale?.status)}
            sx={{ mt: 0.5 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderDatosCliente = () => (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary }}
      >
        Datos Cliente
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            NIT/CI:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.cliente.nit}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Nombre:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.cliente.nombre}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Celular:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.cliente.celular || "No registrado"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Email:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedSale?.cliente.email || "No registrado"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDatosUsuario = () => (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 1, color: farmaColors.secondary }}
      >
        Datos Usuario
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">
            Vendedor:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Usuario #{userId}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDatosProducto = () => (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 1.5, color: farmaColors.secondary }}
      >
        Productos
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ maxHeight: 180 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                Código
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                Producto
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                Cant.
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                P/U
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedSale?.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                >
                  {item.codigo}
                </TableCell>
                <TableCell sx={{ fontSize: "0.75rem" }}>
                  {item.nombre}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  {item.cantidad}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.75rem" }}>
                  {item.precio.toFixed(2)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: farmaColors.primary,
                  }}
                >
                  {item.subtotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          bgcolor: farmaColors.alpha.primary10,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Bs. {selectedSale?.totales.subtotal.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Descuento:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#f44336" }}
            >
              - Bs. {selectedSale?.totales.descuentoAdicional.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Total:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: farmaColors.primary }}
            >
              Bs. {selectedSale?.totales.total.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, height: "85vh", maxHeight: "85vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: farmaColors.secondary,
          color: "white",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Sin Typography anidado, usar directamente el texto */}
          <span style={{ fontWeight: 600, fontSize: "1.25rem" }}>
            Mis Ventas
          </span>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ mt: 2, overflow: "auto", maxHeight: "calc(85vh - 160px)" }}
      >
        <Grid container spacing={2}>
          {/* COLUMNA IZQUIERDA: Filtros y Tabla */}
          <Grid item xs={12} md={8}>
            {/* Filtros */}
            <Paper
              elevation={1}
              sx={{ p: 2, mb: 2, bgcolor: farmaColors.alpha.secondary10 }}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={2.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fecha Desde"
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) =>
                      setFilters({ ...filters, fechaDesde: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fecha Hasta"
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) =>
                      setFilters({ ...filters, fechaHasta: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nº Factura"
                    value={filters.numeroFactura}
                    onChange={(e) =>
                      setFilters({ ...filters, numeroFactura: e.target.value })
                    }
                    placeholder="45645"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="NIT/CI"
                    value={filters.nitCliente}
                    onChange={(e) =>
                      setFilters({ ...filters, nitCliente: e.target.value })
                    }
                    placeholder="3723191"
                  />
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Código"
                    value={filters.codigo}
                    onChange={(e) =>
                      setFilters({ ...filters, codigo: e.target.value })
                    }
                    placeholder="5404"
                  />
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                      bgcolor: farmaColors.primary,
                      "&:hover": { bgcolor: farmaColors.primaryDark },
                      height: "40px",
                    }}
                  >
                    <Search />
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabla de Ventas */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredSales.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron ventas
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Intente ajustar los filtros de búsqueda
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer
                  component={Paper}
                  elevation={1}
                  sx={{ maxHeight: 350 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: farmaColors.alpha.secondary10 }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          Fecha
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          Nº Factura
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          Cliente
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          NIT/CI
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        >
                          Estado
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow
                          key={sale.id}
                          onClick={() => handleSelectSale(sale)}
                          sx={{
                            "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                            opacity: sale.status === "ANULADA" ? 0.6 : 1,
                            bgcolor:
                              selectedSale?.id === sale.id
                                ? farmaColors.alpha.primary20
                                : "white",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {formatDate(sale.fechaCreacion)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}
                          >
                            {sale.numeroFactura || "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {sale.cliente?.nombre}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {sale.cliente?.nit}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: farmaColors.primary,
                            }}
                          >
                            Bs. {sale.totales?.total.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={sale.status}
                              size="small"
                              color={getStatusColor(sale.status)}
                              sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Resumen */}
                <Paper
                  elevation={1}
                  sx={{ mt: 2, p: 2, bgcolor: farmaColors.alpha.primary10 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Total Ventas
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {
                          filteredSales.filter((s) => s.status === "FACTURADA")
                            .length
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Guardadas
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {
                          filteredSales.filter((s) => s.status === "GUARDADA")
                            .length
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Monto Total
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: farmaColors.primary }}
                      >
                        Bs.{" "}
                        {filteredSales
                          .filter((s) => s.status === "FACTURADA")
                          .reduce((sum, s) => sum + (s.totales?.total || 0), 0)
                          .toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}
          </Grid>

          {/* COLUMNA DERECHA: Datos de la venta seleccionada */}
          <Grid item xs={12} md={4}>
            {selectedSale ? (
              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "#fafafa", position: "sticky", top: 16 }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 700, color: farmaColors.secondary }}
                >
                  Datos de venta
                </Typography>

                {/* Alerta si la venta está anulada */}
                {selectedSale.status === "ANULADA" && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Venta Anulada</strong>
                    <br />
                    Esta venta no se puede cargar
                  </Alert>
                )}

                {/* Alerta informativa para ventas facturadas */}
                {selectedSale.status === "FACTURADA" && (
                  <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>
                    <strong>Recuperar Venta:</strong>
                    <br />
                    Al cargar esta venta, podrá agregar más productos. Al
                    imprimir la nueva factura, esta se anulará automáticamente.
                  </Alert>
                )}

                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab
                    label="Factura"
                    sx={{ fontSize: "0.75rem", minHeight: 40 }}
                  />
                  <Tab
                    label="Cliente"
                    sx={{ fontSize: "0.75rem", minHeight: 40 }}
                  />
                  <Tab
                    label="Usuario"
                    sx={{ fontSize: "0.75rem", minHeight: 40 }}
                  />
                  <Tab
                    label="Producto"
                    sx={{ fontSize: "0.75rem", minHeight: 40 }}
                  />
                </Tabs>

                <Box sx={{ minHeight: 250, maxHeight: 300, overflow: "auto" }}>
                  {activeTab === 0 && renderDatosFactura()}
                  {activeTab === 1 && renderDatosCliente()}
                  {activeTab === 2 && renderDatosUsuario()}
                  {activeTab === 3 && renderDatosProducto()}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Botón Cargar Venta */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={handleLoadSale}
                  disabled={selectedSale.status === "ANULADA"}
                  sx={{
                    bgcolor: farmaColors.primary,
                    py: 1.5,
                    fontWeight: 700,
                    "&:hover": { bgcolor: farmaColors.primaryDark },
                  }}
                >
                  Cargar Venta
                </Button>

                {selectedSale.status === "FACTURADA" && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Print />}
                    sx={{
                      mt: 1,
                      borderColor: farmaColors.secondary,
                      color: farmaColors.secondary,
                      "&:hover": {
                        borderColor: farmaColors.secondaryDark,
                        bgcolor: farmaColors.alpha.secondary10,
                      },
                    }}
                  >
                    Reimprimir Factura
                  </Button>
                )}
              </Paper>
            ) : (
              <Paper
                elevation={2}
                sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Seleccione una venta de la tabla para ver sus detalles
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
        <Button onClick={onClose} variant="outlined" sx={{ px: 3 }}>
          Cerrar
        </Button>
        <Button
          onClick={loadSales}
          variant="outlined"
          startIcon={<Refresh />}
          sx={{ px: 3 }}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MySalesModal;
