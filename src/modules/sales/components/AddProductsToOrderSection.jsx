// src/modules/sales/components/AddProductsToOrderSection.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Stack,
  Dialog,
  List,
  ListItem,
  ClickAwayListener,
  Portal,
} from "@mui/material";
import XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Delete,
  CheckCircle,
  CalendarToday,
  Store,
  LocalPostOffice,
  Inventory,
  ShoppingCart,
  FileDownload,
  PictureAsPdf,
  LocalShipping,
  Science,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const AddProductsToOrderSection = ({
  orderData,
  searchFilters,
  setSearchFilters,
  searchResults,
  onSearch, // debe ser searchProductsByText(texto) — ver nota abajo
  selectedProducts,
  onAdd,
  onRemove,
  onUpdateQty,
  onSave,
  loading,
  isReadOnly,
  canEdit,
  onStatusChange,
  clearStorage,
  catalogs,
}) => {
  // ─── Paginación ───────────────────────────────────────────────────────────
  const [selectedPage, setSelectedPage] = React.useState(0);
  const rowsPerPage = 10;

  // ─── Exportar ─────────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingExport, setPendingExport] = React.useState(null);

  // ─── Autocomplete state ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isSearching, setIsSearching] = React.useState(false);
  const [portalPosition, setPortalPosition] = React.useState(null);
  const [lastAddedId, setLastAddedId] = React.useState(null);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const searchInputRef = React.useRef(null);
  const anchorRef = React.useRef(null); // el <td> que ancla el dropdown
  const itemRefs = React.useRef([]);
  const cantidadRefsMap = React.useRef({});
  const observacionRefsMap = React.useRef({});
  const debounceTimer = React.useRef(null);

  // ─── Cabecera ─────────────────────────────────────────────────────────────
  const sucursal = (catalogs.sucursales || []).find(
    (s) => s.sucursal_ID === orderData.sucursalId,
  );
  const sucursalName = sucursal?.nombreSucursal || "Sucursal";
  const totalProducts = selectedProducts.length;

  // ─── Reset página ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(selectedProducts.length / rowsPerPage) - 1,
    );
    if (selectedPage > maxPage) setSelectedPage(maxPage);
  }, [selectedProducts.length, selectedPage]);

  React.useEffect(() => {
    setSelectedPage(0);
  }, [selectedProducts.length]);

  // ─── Focus automático en cantidad ─────────────────────────────────────────
  React.useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => {
      const el = cantidadRefsMap.current[lastAddedId];
      if (el) {
        el.focus();
        el.select();
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [lastAddedId]);

  // ─── Limpiar highlight ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => setLastAddedId(null), 1400);
    return () => clearTimeout(timer);
  }, [lastAddedId]);

  // ─── Ctrl+S ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isReadOnly && !loading && selectedProducts.length > 0)
          onSave(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, isReadOnly, loading, selectedProducts.length]);

  // ─── Posición Portal (se recalcula en scroll/resize) ─────────────────────
  React.useEffect(() => {
    const update = () => {
      if (showSuggestions && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPortalPosition({
          top: rect.bottom + 2,
          left: rect.left,
          width: rect.width,
        });
      }
    };
    if (showSuggestions) {
      update();
      window.addEventListener("scroll", update, true); // capture para detectar scroll interno
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    } else {
      setPortalPosition(null);
    }
  }, [showSuggestions]);

  // ─── Scroll sugerencias al navegar ───────────────────────────────────────
  React.useEffect(() => {
    if (showSuggestions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showSuggestions]);

  // ─── Debounce: escribe → 350ms → busca ───────────────────────────────────
  const handleSearchQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.length < 2) {
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        // onSearch debe ser searchProductsByText(texto) de useOrders
        await onSearch(value);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } catch {
        /* ignorar */
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // ─── Teclado sobre el input de búsqueda ──────────────────────────────────
  React.useEffect(() => {
    const handler = (e) => {
      if (document.activeElement !== searchInputRef.current) return;
      if (!showSuggestions || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i < searchResults.length - 1 ? i + 1 : i));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i > 0 ? i - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (searchResults[selectedIndex])
            handleSelectProduct(searchResults[selectedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          setSearchQuery("");
          break;
        case "Tab":
          e.preventDefault();
          setSelectedIndex((i) => (i < searchResults.length - 1 ? i + 1 : 0));
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSuggestions, searchResults, selectedIndex]);

  // ─── Seleccionar producto ─────────────────────────────────────────────────
  const handleSelectProduct = (product) => {
    const id = product.producto_ID || product.id;

    const existing = selectedProducts.find(
      (p) => (p.producto_ID || p.id) === id,
    );

    if (existing) {
      const nuevaCantidad = Number(existing.cantidad || 0) + 1;
      onUpdateQty(id, nuevaCantidad);
      setLastAddedId(id);
    } else {
      //  NO EXISTE → agregar con cantidad 1
      onAdd({ ...product, cantidad: 1 });
      //  FORZAR REFRESH VISUAL
      setTimeout(() => {
        setLastAddedId(id);
      }, 50);
    }

    setLastAddedId(id);
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIndex(0);
  };

  // ─── Utilidades ──────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Excel ────────────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (!selectedProducts.length) return;
    if (canEdit) {
      setPendingExport("excel");
      setConfirmOpen(true);
    } else executeExportExcel();
  };

  const executeExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const hs = {
      fill: { fgColor: { rgb: "00529B" } },
      font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
    const ss = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "E3F2FD" } },
      border: { bottom: { style: "thin", color: { rgb: "000000" } } },
    };
    const cs = {
      alignment: { vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: "CCCCCC" } } },
    };
    const data = [
      [{ v: "DETALLE DEL PEDIDO", s: hs }, "", "", ""],
      [
        { v: "Sucursal", s: ss },
        { v: sucursalName, s: cs },
        { v: "Fecha", s: ss },
        { v: orderData.fecha, s: cs },
      ],
      [
        { v: "Número Pedido", s: ss },
        {
          v:
            orderData.numeroPedido ||
            orderData.pedidoProveedor_ID ||
            "Pendiente",
          s: cs,
        },
        { v: "Descripción", s: ss },
        { v: orderData.descripcion || "Sin descripción", s: cs },
      ],
      [],
      [
        { v: "PRODUCTOS DEL PEDIDO", s: hs },
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        { v: "#", s: ss },
        { v: "Producto", s: ss },
        { v: "Presentación", s: ss },
        { v: "Unidad", s: ss },
        { v: "Laboratorio", s: ss },
        { v: "Cantidad", s: ss },
        { v: "Observación", s: ss },
      ],
    ];
    selectedProducts.forEach((p, i) =>
      data.push([
        { v: i + 1, s: cs },
        { v: p.producto || p.nombre, s: cs },
        { v: p.presentacion, s: cs },
        { v: p.unidadMedida, s: cs },
        { v: p.laboratorio, s: cs },
        { v: p.cantidad, s: cs },
        { v: p.observacionesFila || "", s: cs },
      ]),
    );
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } },
    ];
    ws["!cols"] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Pedido");
    XLSX.writeFile(
      wb,
      `Pedido_${orderData.numeroPedido || orderData.pedidoProveedor_ID || "Nuevo"}.xlsx`,
    );
  };

  // ─── PDF ──────────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!selectedProducts.length) return;
    if (canEdit) {
      setPendingExport("pdf");
      setConfirmOpen(true);
    } else executeExportPDF();
  };

  const executeExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const pc = [0, 82, 155];
    doc.setFillColor(...pc);
    doc.rect(0, 0, 297, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("SIFARMA - REPORTE DE PEDIDO", 14, 13);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DEL PEDIDO", 14, 30);
    doc.line(14, 32, 283, 32);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Sucursal: ${sucursalName}`, 14, 38);
    doc.text(`Fecha: ${orderData.fecha}`, 14, 44);
    doc.text(
      `Número Pedido: ${orderData.numeroPedido || orderData.pedidoProveedor_ID || "Pendiente"}`,
      100,
      38,
    );
    doc.text(
      `Descripción: ${orderData.descripcion || "Sin descripción"}`,
      100,
      44,
    );
    autoTable(doc, {
      startY: 53,
      head: [
        [
          "#",
          "Producto",
          "Presentación",
          "Unidad",
          "Laboratorio",
          "Cantidad",
          "Observación",
        ],
      ],
      body: selectedProducts.map((p, i) => [
        i + 1,
        p.producto || p.nombre,
        p.presentacion,
        p.unidadMedida,
        p.laboratorio,
        p.cantidad,
        p.observacionesFila || "",
      ]),
      theme: "striped",
      headStyles: { fillColor: pc, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 20 },
        6: { cellWidth: "auto" },
      },
    });
    doc.save(
      `Pedido_${orderData.numeroPedido || orderData.pedidoProveedor_ID || "Nuevo"}.pdf`,
    );
  };

  const handleConfirmExport = async () => {
    setConfirmOpen(false);
    const success = await onStatusChange(orderData.numeroPedido, "ENV");
    if (success) {
      if (clearStorage) clearStorage();
      if (pendingExport === "excel") executeExportExcel();
      else if (pendingExport === "pdf") executeExportPDF();
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* ── 1. Detalle del Pedido ── */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: farmaColors.alpha.primary10,
          border: `1px solid ${farmaColors.alpha.primary20}`,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: farmaColors.secondary,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CheckCircle sx={{ color: farmaColors.primary }} /> Detalle del
              Pedido
            </Typography>
            {/*<Stack direction="row" spacing={1}>
              <Tooltip title="Exportar a Excel">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExportExcel}
                  sx={{
                    color: "#1d6f42",
                    borderColor: "#1d6f42",
                    "&:hover": {
                      borderColor: "#145a32",
                      bgcolor: "rgba(29,111,66,0.04)",
                    },
                  }}
                >
                  Excel
                </Button>
              </Tooltip>
              <Tooltip title="Exportar a PDF">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  sx={{
                    color: "#c31b1b",
                    borderColor: "#c31b1b",
                    "&:hover": {
                      borderColor: "#9a1515",
                      bgcolor: "rgba(195,27,27,0.04)",
                    },
                  }}
                >
                  PDF
                </Button>
              </Tooltip>
            </Stack>*/}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Store color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sucursal:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {sucursalName}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {orderData.fecha || "—"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShipping color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Proveedor:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(catalogs.proveedores || []).find(
                      (p) => p.codigo === orderData.proveedorId,
                    )?.nombre ||
                      orderData.nombreProveedor ||
                      orderData.proveedorId ||
                      "—"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalPostOffice color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Número Pedido:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: farmaColors.primary }}
                  >
                    {orderData.numeroPedido ||
                      orderData.pedidoProveedor_ID ||
                      "Pendiente"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── 2. Card única: buscador sticky + tabla productos ── */}
      <Card sx={{ borderRadius: 3 }}>
        {/* Header de la card */}
        <Box
          sx={{
            background: farmaColors.secondary,
            px: 2.5,
            py: 1.5,
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body1" sx={{ color: "white", fontWeight: 700 }}>
            Productos del Pedido
          </Typography>
          <Chip
            label={`${totalProducts} item${totalProducts !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "white",
              fontWeight: 700,
            }}
          />
        </Box>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "0 0 12px 12px",
            border: `2px solid ${farmaColors.secondary}`,
            borderTop: "none",
            // overflow visible para que el Portal funcione correctamente
            overflow: "visible",
          }}
        >
          <Table size="small" stickyHeader>
            {/* ── Columnas ── */}
            <TableHead>
              <TableRow>
                {["Producto", "Cantidad", "Observación", ""].map((col, i) => (
                  <TableCell
                    key={col + i}
                    align={i === 3 ? "right" : "left"}
                    sx={{
                      fontWeight: 800,
                      color: farmaColors.secondary,
                      bgcolor: farmaColors.alpha.secondary10,
                      // sticky header para que se vea al hacer scroll
                      position: "sticky",
                      top: 0,
                      zIndex: 900,
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* ══ FILA BUSCADOR STICKY ══
                                Igual que SaleItemsTable: position sticky, zIndex alto,
                                el anchorRef va en esta celda para calcular posición del Portal */}
              {canEdit && (
                <TableRow
                  sx={{
                    position: "sticky",
                    top: 57, // justo debajo del header sticky
                    zIndex: 800,
                    bgcolor: "white",
                  }}
                >
                  <TableCell
                    colSpan={4}
                    ref={anchorRef}
                    sx={{
                      p: 1,
                      borderBottom: `2px solid ${farmaColors.primary}`,
                      bgcolor: "white",
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      inputRef={searchInputRef}
                      placeholder="Escriba nombre, código o laboratorio... (↑↓ navegar · Enter agregar · Esc cerrar)"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      disabled={isReadOnly}
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isSearching ? (
                              <CircularProgress
                                size={18}
                                sx={{ color: farmaColors.primary }}
                              />
                            ) : (
                              <Search
                                sx={{
                                  color: farmaColors.primary,
                                  fontSize: 20,
                                }}
                              />
                            )}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          fontSize: "0.88rem",
                          "& fieldset": {
                            borderColor: farmaColors.alpha.primary30,
                          },
                          "&:hover fieldset": {
                            borderColor: farmaColors.primary,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: farmaColors.primary,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}

              {/* ══ FILAS DE PRODUCTOS ══ */}
              {selectedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 6, bgcolor: "white" }}
                  >
                    <ShoppingCart
                      sx={{
                        fontSize: 44,
                        color: "text.disabled",
                        mb: 1,
                        opacity: 0.35,
                      }}
                    />
                    <Typography color="text.secondary" variant="body2">
                      No hay productos. Use el buscador para añadir.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selectedProducts
                  .slice(
                    selectedPage * rowsPerPage,
                    (selectedPage + 1) * rowsPerPage,
                  )
                  .map((p) => {
                    const productId = p.producto_ID || p.id;
                    const isHighlighted = productId === lastAddedId;

                    return (
                      <TableRow
                        key={productId}
                        sx={{
                          bgcolor: isHighlighted
                            ? "rgba(76,175,80,0.13)"
                            : "white",
                          transition: "background-color 0.5s ease",
                          "&:hover": {
                            bgcolor: isHighlighted
                              ? "rgba(76,175,80,0.13)"
                              : farmaColors.alpha.primary10,
                          },
                        }}
                      >
                        {/* Info */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: farmaColors.secondary,
                            }}
                          >
                            {p.producto || p.nombre}
                            {p.presentacion && (
                              <Box
                                component="span"
                                sx={{
                                  fontWeight: 400,
                                  color: "text.secondary",
                                }}
                              >
                                {" · "}
                                {p.presentacion}
                              </Box>
                            )}
                          </Typography>
                        </TableCell>

                        {/* Cantidad */}
                        <TableCell sx={{ width: 130 }}>
                          {canEdit && !p.isReadOnlyRow ? (
                            <TextField
                              type="number"
                              disabled={isReadOnly}
                              value={p.cantidad ?? 1}
                              onChange={(e) =>
                                onUpdateQty(
                                  productId,
                                  Number(e.target.value || 1),
                                )
                              }
                              inputProps={{ min: 1 }}
                              inputRef={(el) => {
                                if (el) cantidadRefsMap.current[productId] = el;
                                else delete cantidadRefsMap.current[productId];
                              }}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  setLastAddedId(null);
                                  const obs =
                                    observacionRefsMap.current[productId];
                                  if (obs) {
                                    obs.focus();
                                    obs.select?.();
                                  }
                                }
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  observacionRefsMap.current[
                                    productId
                                  ]?.focus();
                                }
                              }}
                              size="small"
                              sx={{ width: 100 }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {p.cantidad}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Observación */}
                        <TableCell>
                          {canEdit && !p.isReadOnlyRow ? (
                            <TextField
                              fullWidth
                              placeholder="Observación..."
                              variant="standard"
                              disabled={isReadOnly}
                              value={p.observacionesFila || ""}
                              onChange={(e) =>
                                onUpdateQty(
                                  productId,
                                  p.cantidad,
                                  e.target.value,
                                )
                              }
                              inputRef={(el) => {
                                if (el)
                                  observacionRefsMap.current[productId] = el;
                                else
                                  delete observacionRefsMap.current[productId];
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  searchInputRef.current?.focus();
                                  setSearchQuery("");
                                  setShowSuggestions(false);
                                }
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {p.observacionesFila || "—"}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Eliminar */}
                        <TableCell align="right">
                          {canEdit && !p.isReadOnlyRow && (
                            <Tooltip title="Quitar">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isReadOnly}
                                onClick={() => onRemove(productId)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Paginación */}
        {selectedProducts.length > rowsPerPage && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              borderTop: `1px solid ${farmaColors.alpha.secondary10}`,
            }}
          >
            <Button
              size="small"
              disabled={selectedPage === 0}
              onClick={() => setSelectedPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Typography variant="body2" sx={{ px: 2, color: "text.secondary" }}>
              Página {selectedPage + 1} de{" "}
              {Math.ceil(selectedProducts.length / rowsPerPage)}
            </Typography>
            <Button
              size="small"
              disabled={
                selectedPage ===
                Math.ceil(selectedProducts.length / rowsPerPage) - 1
              }
              onClick={() => setSelectedPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </Box>
        )}
        {/* Botón Guardar + Exportar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${farmaColors.alpha.secondary10}`,
          }}
        >
          {/* Exportar — solo visible cuando ya hay productos guardados o es modo lectura */}
          <Stack direction="row" spacing={1}>
            {(selectedProducts.length > 0 || !canEdit) && (
              <>
                <Tooltip title="Exportar a Excel">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={handleExportExcel}
                    sx={{
                      color: "#1d6f42",
                      borderColor: "#1d6f42",
                      "&:hover": {
                        borderColor: "#145a32",
                        bgcolor: "rgba(29,111,66,0.04)",
                      },
                    }}
                  >
                    Exportar a Excel
                  </Button>
                </Tooltip>
                <Tooltip title="Exportar a PDF">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={handleExportPDF}
                    sx={{
                      color: "#c31b1b",
                      borderColor: "#c31b1b",
                      "&:hover": {
                        borderColor: "#9a1515",
                        bgcolor: "rgba(195,27,27,0.04)",
                      },
                    }}
                  >
                    Exportar a PDF
                  </Button>
                </Tooltip>
              </>
            )}
          </Stack>

          {/* Guardar — solo si puede editar */}
          {canEdit && !isReadOnly ? (
            <Button
              variant="contained"
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircle />
                )
              }
              onClick={onSave}
              disabled={loading || selectedProducts.length === 0}
              sx={{
                background: farmaColors.gradients.primary,
                px: 5,
                height: 52,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading ? "Guardando..." : "Guardar Pedido"}
            </Button>
          ) : (
            // Espaciador para mantener los botones de exportar a la izquierda cuando no hay Guardar
            <Box />
          )}
        </Box>
      </Card>

      {/* ══ DROPDOWN PORTAL — igual a SaleItemsTable ══ */}
      {showSuggestions && searchResults.length > 0 && portalPosition && (
        <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
          <Portal>
            <Paper
              elevation={12}
              sx={{
                position: "fixed",
                top: portalPosition.top,
                left: portalPosition.left,
                width: portalPosition.width,
                maxHeight: 380,
                overflow: "auto",
                border: `3px solid ${farmaColors.primary}`,
                borderRadius: 2,
                bgcolor: "white",
                zIndex: 10000,
                boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
                "&::-webkit-scrollbar": { width: "10px" },
                "&::-webkit-scrollbar-track": {
                  background: "#f0f0f0",
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: farmaColors.primary,
                  borderRadius: "8px",
                  border: "2px solid #f0f0f0",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: farmaColors.primaryDark,
                },
              }}
            >
              {/* Header sticky del dropdown */}
              <Box
                sx={{
                  px: 2,
                  py: 0.8,
                  bgcolor: farmaColors.secondary,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "white", fontWeight: 700 }}
                >
                  {searchResults.length} resultado
                  {searchResults.length !== 1 ? "s" : ""}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.65)" }}
                >
                  ↑↓ navegar · Enter agregar · Esc cerrar
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {searchResults.map((product, index) => {
                  const id = product.producto_ID || product.id;
                  const isAdded = selectedProducts.some(
                    (sp) => (sp.producto_ID || sp.id) === id,
                  );
                  const isSelected = index === selectedIndex;
                  const stock = product.stockProducto ?? product.stock ?? 0;

                  return (
                    <ListItem
                      key={id}
                      ref={(el) => (itemRefs.current[index] = el)}
                      onClick={() => !isAdded && handleSelectProduct(product)}
                      sx={{
                        borderBottom:
                          index < searchResults.length - 1
                            ? `1px solid ${farmaColors.alpha.secondary10}`
                            : "none",
                        bgcolor: isSelected
                          ? farmaColors.alpha.primary30
                          : isAdded
                            ? "rgba(76,175,80,0.07)"
                            : stock === 0
                              ? "rgba(244,67,54,0.04)"
                              : "white",
                        cursor: isAdded ? "default" : "pointer",
                        "&:hover": {
                          bgcolor: isAdded
                            ? "rgba(76,175,80,0.07)"
                            : farmaColors.alpha.primary20,
                        },
                        py: 1.2,
                        px: 2,
                        transition: "background-color 0.12s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          width: "100%",
                        }}
                      >
                        {/* Código */}
                        <Chip
                          label={product.codigoProducto || product.codigo}
                          size="small"
                          sx={{
                            bgcolor: farmaColors.primary,
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: 22,
                            minWidth: 72,
                            fontFamily: "monospace",
                            flexShrink: 0,
                          }}
                        />

                        {/* Nombre + detalle */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              color: isAdded ? "text.secondary" : "#1a1a1a",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {product.producto || product.nombre}
                            {product.presentacion && (
                              <Box
                                component="span"
                                sx={{
                                  fontWeight: 400,
                                  color: "text.secondary",
                                  ml: 1,
                                }}
                              >
                                · {product.presentacion}
                              </Box>
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.70rem",
                              color: "text.secondary",
                            }}
                          >
                            {[
                              product.laboratorio,
                              product.linea,
                              product.numeroLote
                                ? `Lote: ${product.numeroLote}`
                                : null,
                              product.fechaVencimiento &&
                              product.fechaVencimiento !== "1850-01-01"
                                ? `Venc: ${product.fechaVencimiento}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Typography>
                        </Box>

                        {/* Stock */}
                        <Chip
                          label={`Stock: ${stock}`}
                          size="small"
                          sx={{
                            bgcolor: stock > 0 ? "#4CAF50" : "#f44336",
                            color: "white",
                            height: 22,
                            fontSize: "0.70rem",
                            fontWeight: 700,
                            minWidth: 76,
                            flexShrink: 0,
                          }}
                        />

                        {/* Estado */}
                        {isAdded ? (
                          <Chip
                            label="Añadido"
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ fontWeight: 700, height: 22, flexShrink: 0 }}
                          />
                        ) : (
                          <Chip
                            label="+ Agregar"
                            size="small"
                            sx={{
                              bgcolor: farmaColors.primary,
                              color: "white",
                              fontWeight: 700,
                              height: 22,
                              flexShrink: 0,
                              cursor: "pointer",
                            }}
                          />
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Portal>
        </ClickAwayListener>
      )}

      {/* ── Diálogo exportar + cambio estado ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: farmaColors.secondary, mb: 2 }}
          >
            Confirmar Envío
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Al confirmar, su pedido pasará al estado <strong>"Enviado"</strong>{" "}
            y será remitido al proveedor para su procesamiento.
          </Typography>
          <Typography
            variant="body2"
            color="error"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            ⚠️ Una vez enviado,{" "}
            <strong>no podrá agregar, modificar ni eliminar productos</strong>{" "}
            del pedido.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              No
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmExport}
              sx={{
                background: farmaColors.gradients.primary,
                fontWeight: 700,
                px: 3,
              }}
            >
              Sí
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AddProductsToOrderSection;
