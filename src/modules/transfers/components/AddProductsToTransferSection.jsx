// src/modules/transfers/components/AddProductsToTransferSection.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  List,
  ListItem,
  ClickAwayListener,
  Portal,
} from "@mui/material";
import {
  Search,
  Delete,
  Save,
  ArrowBack,
  CalendarToday,
  ShoppingBag,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  LocalShipping,
  Storefront,
  ContentCopy,
  Visibility,
  BarChart,
  CheckCircle,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import transferService from "../services/transferService";
import { CodigoProductoChip } from "../../../shared/components/ProductoStockPopup";
import StockDrawer from "../../purchases/components/StockDrawer";

const AddProductsToTransferSection = ({
  createdTransfer,
  transferItems,
  isReadOnly,
  loading,
  loadingSearch,
  searchResults,
  searchProductsByText,
  addTransferItem,
  updateTransferItem,
  removeTransferItem,
  handleConfirmSave,
  handleTerminarTraspaso,
  setViewState,
  catalogs,
  purchaseList,
  selectedPurchase,
  purchaseProducts,
  loadingPurchases,
  loadingPurchaseProducts,
  fetchPurchases,
  fetchPurchaseProducts,
  copyProductsFromPurchase,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedPage, setSelectedPage] = useState(0);
  const [purchasePage, setPurchasePage] = useState(0);
  const rowsPerPage = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTerminarOpen, setConfirmTerminarOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [stockDrawerOpen, setStockDrawerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [portalPosition, setPortalPosition] = useState(null);
  const [lastAddedKey, setLastAddedKey] = useState(null);

  const searchInputRef = useRef(null);
  const anchorRef = useRef(null);
  const itemRefs = useRef([]);
  const cantidadRefsMap = useRef({});
  const observacionRefsMap = useRef({});
  const debounceTimer = useRef(null);

  const [reportData, setReportData] = useState([]);
  const [reportPage, setReportPage] = useState(0);

  const itemKey = (p) => `${p.producto_ID}-${p.lote_ID}`;

  const getBranchName = (id) => {
    const branch = catalogs.sucursales.find((s) => s.sucursal_ID === id);
    return branch ? branch.nombreSucursal : `ID: ${id}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const totalGeneral = transferItems.reduce(
    (sum, item) =>
      sum + (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0),
    0,
  );

  const COLS = [
    "Nro",
    "Código",
    "Producto",
    "Lote / Vence",
    "Stock",
    "C/U",
    "P/U",
    "P/C",
    "Cantidad",
    "Total",
    "Observaciones",
    "",
  ];
  const COLSPAN = COLS.length;

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(transferItems.length / rowsPerPage) - 1,
    );
    if (selectedPage > maxPage) setSelectedPage(maxPage);
  }, [transferItems.length, selectedPage]);

  useEffect(() => {
    if (!lastAddedKey) return;
    const timer = setTimeout(() => {
      const el = cantidadRefsMap.current[lastAddedKey];
      if (el) {
        el.focus();
        el.select();
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [lastAddedKey]);

  useEffect(() => {
    if (!lastAddedKey) return;
    const timer = setTimeout(() => setLastAddedKey(null), 1400);
    return () => clearTimeout(timer);
  }, [lastAddedKey]);

  useEffect(() => {
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
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    } else {
      setPortalPosition(null);
    }
  }, [showSuggestions]);

  useEffect(() => {
    if (showSuggestions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showSuggestions]);

  useEffect(() => {
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

  const handleSearchQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.length < 4) {
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        await searchProductsByText(value);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } catch {
        /* ignorar */
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectProduct = (product) => {
    const key = itemKey(product);
    const existingIdx = transferItems.findIndex(
      (item) =>
        item.producto_ID === product.producto_ID &&
        item.lote_ID === product.lote_ID,
    );
    if (existingIdx >= 0) {
      updateTransferItem(
        existingIdx,
        "cantidad",
        Number(transferItems[existingIdx].cantidad || 1) + 1,
      );
    } else {
      addTransferItem(product, 1, "");
    }
    setTimeout(() => setLastAddedKey(key), 50);
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIndex(0);
  };

  const renderBranchCells = (branchArr, isLast = false) => {
    const d = branchArr && branchArr.length > 0 ? branchArr[0] : null;
    if (!d)
      return (
        <React.Fragment>
          <TableCell align="center">-</TableCell>
          <TableCell align="center">-</TableCell>
          <TableCell align="center">-</TableCell>
          <TableCell
            align="center"
            sx={{
              borderRight: isLast ? "none" : "1px solid rgba(224,224,224,1)",
            }}
          >
            -
          </TableCell>
        </React.Fragment>
      );
    const {
      stockProducto,
      precioUnitario,
      numeroLote,
      fechaVencimiento,
      diasVencimiento,
      stockMinimo,
    } = d;
    return (
      <React.Fragment>
        <Tooltip
          title={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Días Vto: {diasVencimiento}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Stock Mín: {stockMinimo}
              </Typography>
            </Box>
          }
        >
          <TableCell
            align="center"
            sx={{
              bgcolor: stockProducto === 0 ? "#ffcdd2" : "#fff9c4",
              fontWeight: 700,
              cursor: "help",
            }}
          >
            {stockProducto}
          </TableCell>
        </Tooltip>
        <TableCell align="center">{precioUnitario}</TableCell>
        <TableCell align="center">{numeroLote || "-"}</TableCell>
        <TableCell
          align="center"
          sx={{
            borderRight: isLast ? "none" : "1px solid rgba(224,224,224,1)",
          }}
        >
          {formatDate(fechaVencimiento)}
        </TableCell>
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* ── 1. Detalle del Traspaso ── */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Volver">
                <IconButton
                  onClick={() => setViewState("creating")}
                  disabled={isReadOnly}
                  size="small"
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
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
                <LocalShipping sx={{ color: farmaColors.primary }} /> Detalle
                del Traspaso
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{ color: farmaColors.primary, fontWeight: 800 }}
            >
              {createdTransfer?.numeroTraspaso || "---"}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday sx={{ color: "action.active", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Envío:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {createdTransfer?.fechaEnvio?.split("T")[0]}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Storefront sx={{ color: "action.active", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Origen:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getBranchName(createdTransfer?.sucursalOrigen_ID)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Storefront sx={{ color: farmaColors.primary, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Destino:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getBranchName(createdTransfer?.sucursalDestino_ID)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DescriptionIcon
                  sx={{ color: "action.active", fontSize: 20 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {createdTransfer?.observaciones || "Sin observaciones"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── 2. Reporte por Sucursal (solo si hay datos) ── */}
      {reportData.length > 0 && (
        <Card
          sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
        >
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      fontWeight: 800,
                      bgcolor: farmaColors.alpha.secondary10,
                      borderRight: "1px solid rgba(224,224,224,1)",
                    }}
                  >
                    PRODUCTO
                  </TableCell>
                  {[
                    "SAN MARTIN",
                    "URUGUAY",
                    "BRASIL",
                    "TIQUIPAYA",
                    "PACATA",
                  ].map((name, i) => (
                    <TableCell
                      key={name}
                      colSpan={4}
                      align="center"
                      sx={{
                        fontWeight: 800,
                        bgcolor: farmaColors.alpha.secondary10,
                        borderRight:
                          i < 4 ? "1px solid rgba(224,224,224,1)" : "none",
                      }}
                    >
                      {name}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                    Código
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      bgcolor: "grey.50",
                      borderRight: "1px solid rgba(224,224,224,1)",
                    }}
                  >
                    Producto
                  </TableCell>
                  {[
                    "SAN MARTIN",
                    "URUGUAY",
                    "BRASIL",
                    "TIQUIPAYA",
                    "PACATA",
                  ].map((name, i) => (
                    <React.Fragment key={name}>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      >
                        Stock
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      >
                        P/U
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      >
                        N° Lote
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          bgcolor: "grey.50",
                          borderRight:
                            i < 4 ? "1px solid rgba(224,224,224,1)" : "none",
                        }}
                      >
                        Vencimiento
                      </TableCell>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData
                  .slice(reportPage * 10, (reportPage + 1) * 10)
                  .map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          color="primary"
                        >
                          {row.codigoProducto}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: 200,
                          borderRight: "1px solid rgba(224,224,224,1)",
                        }}
                      >
                        <Typography variant="body2" fontWeight="600">
                          {row.nombreProducto}
                        </Typography>
                      </TableCell>
                      {renderBranchCells(row.sucursal_SanMaterin)}
                      {renderBranchCells(row.sucursal_Uruguay)}
                      {renderBranchCells(row.sucursal_Brasil)}
                      {renderBranchCells(row.sucursal_Tiquipaya)}
                      {renderBranchCells(row.sucursal_Pacata, true)}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {reportData.length > 10 && (
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "center",
                gap: 1,
                borderTop: `1px solid ${farmaColors.alpha.secondary10}`,
              }}
            >
              <Button
                size="small"
                disabled={reportPage === 0}
                onClick={() => setReportPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  fontSize: "0.875rem",
                }}
              >
                Página {reportPage + 1} de {Math.ceil(reportData.length / 10)}
              </Typography>
              <Button
                size="small"
                disabled={reportPage >= Math.ceil(reportData.length / 10) - 1}
                onClick={() => setReportPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </Box>
          )}
        </Card>
      )}

      {/* ── 3. Card unificada: Productos del Traspaso ── */}
      <Card sx={{ borderRadius: 3 }}>
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
          <Typography
            variant="body1"
            sx={{
              color: "white",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShoppingBag sx={{ fontSize: 20 }} /> Productos del Traspaso
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!isReadOnly && (
              <Tooltip title="Copiar Productos de Compra">
                <IconButton
                  size="small"
                  onClick={() => {
                    setCopyDialogOpen(true);
                    fetchPurchases();
                  }}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Chip
              label={`${transferItems.length} item${transferItems.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                color: "white",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: `2px solid ${farmaColors.secondary}`,
            borderTop: "none",
            overflow: "visible",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {COLS.map((col, i) => (
                  <TableCell
                    key={col + i}
                    align={i === COLS.length - 1 ? "center" : "left"}
                    sx={{
                      fontWeight: 800,
                      color: farmaColors.secondary,
                      bgcolor: farmaColors.alpha.secondary10,
                      position: "sticky",
                      top: 0,
                      zIndex: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Buscador sticky */}
              {!isReadOnly && (
                <TableRow
                  sx={{
                    position: "sticky",
                    top: 57,
                    zIndex: 800,
                    bgcolor: "white",
                  }}
                >
                  <TableCell
                    colSpan={COLSPAN}
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
                      placeholder="Escriba nombre o código del producto... (↑↓ navegar · Enter agregar · Esc cerrar)"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
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

              {/* Filas de productos */}
              {transferItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLSPAN}
                    align="center"
                    sx={{ py: 6, bgcolor: "white" }}
                  >
                    <InventoryIcon
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
                transferItems
                  .slice(
                    selectedPage * rowsPerPage,
                    (selectedPage + 1) * rowsPerPage,
                  )
                  .map((item, idx) => {
                    const key = itemKey(item);
                    const isHighlighted = key === lastAddedKey;
                    const globalIdx = selectedPage * rowsPerPage + idx;

                    return (
                      <TableRow
                        key={key + globalIdx}
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
                        {/* Nro */}
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          {globalIdx + 1}
                        </TableCell>

                        {/* Código con popup */}
                        <TableCell>
                          <CodigoProductoChip
                            codigo={item.codigoProducto || ""}
                          />
                        </TableCell>

                        {/* Producto */}
                        <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: farmaColors.secondary,
                            }}
                          >
                            {item.producto}
                            {item.presentacion && (
                              <Box
                                component="span"
                                sx={{
                                  fontWeight: 400,
                                  color: "text.secondary",
                                }}
                              >
                                {" · "}
                                {item.presentacion}
                              </Box>
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {[item.laboratorio, item.linea]
                              .filter(Boolean)
                              .join(" | ")}
                          </Typography>
                        </TableCell>

                        {/* Lote / Vence */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", fontWeight: 700 }}
                          >
                            Lote: {item.codigoLote || "S/N"}
                          </Typography>
                          {!isReadOnly ? (
                            <TextField
                              type="date"
                              size="small"
                              variant="standard"
                              value={item.fechaVencimiento?.split("T")[0] || ""}
                              onChange={(e) =>
                                updateTransferItem(
                                  globalIdx,
                                  "fechaVencimiento",
                                  e.target.value,
                                )
                              }
                              inputProps={{ style: { fontSize: "0.72rem" } }}
                              sx={{ width: 120 }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ display: "block", color: "error.main" }}
                            >
                              Vence:{" "}
                              {item.fechaVencimiento?.split("T")[0] || "---"}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          <Chip
                            label={item.stockProducto ?? 0}
                            size="small"
                            sx={{
                              bgcolor:
                                (item.stockProducto ?? 0) > 0
                                  ? "#4CAF50"
                                  : "#f44336",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>

                        {/* C/U */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2">
                            {item.costoUnitario?.toFixed(2) ?? "0.00"}
                          </Typography>
                        </TableCell>

                        {/* P/U */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2">
                            {item.precioUnitario?.toFixed(2) ?? "0.00"}
                          </Typography>
                        </TableCell>

                        {/* P/C */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2">
                            {item.precioCaja?.toFixed(2) ?? "0.00"}
                          </Typography>
                        </TableCell>

                        {/* Cantidad */}
                        <TableCell sx={{ width: 100 }}>
                          {!isReadOnly ? (
                            <TextField
                              type="text"
                              size="small"
                              value={item.cantidad ?? ""}
                              onChange={(e) => {
                                let v = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 5);
                                updateTransferItem(
                                  globalIdx,
                                  "cantidad",
                                  v === "" ? "" : Number(v),
                                );
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "")
                                  updateTransferItem(globalIdx, "cantidad", 1);
                              }}
                              inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                maxLength: 5,
                              }}
                              inputRef={(el) => {
                                if (el) cantidadRefsMap.current[key] = el;
                                else delete cantidadRefsMap.current[key];
                              }}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  observacionRefsMap.current[key]?.focus();
                                }
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  observacionRefsMap.current[key]?.focus();
                                }
                              }}
                              sx={{ width: 80 }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {item.cantidad}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Total */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: farmaColors.primary }}
                          >
                            {(
                              (Number(item.cantidad) || 0) *
                              (Number(item.precioUnitario) || 0)
                            ).toFixed(2)}
                          </Typography>
                        </TableCell>

                        {/* Observaciones */}
                        <TableCell>
                          {!isReadOnly ? (
                            <TextField
                              fullWidth
                              placeholder="Observación..."
                              variant="standard"
                              value={item.observaciones || ""}
                              onChange={(e) =>
                                updateTransferItem(
                                  globalIdx,
                                  "observaciones",
                                  e.target.value,
                                )
                              }
                              inputRef={(el) => {
                                if (el) observacionRefsMap.current[key] = el;
                                else delete observacionRefsMap.current[key];
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
                              {item.observaciones || "—"}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Opciones */}
                        <TableCell align="center">
                          {!isReadOnly && (
                            <Tooltip title="Quitar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeTransferItem(globalIdx)}
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
        {transferItems.length > rowsPerPage && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              border: `2px solid ${farmaColors.secondary}`,
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
              {Math.ceil(transferItems.length / rowsPerPage)}
            </Typography>
            <Button
              size="small"
              disabled={
                selectedPage >=
                Math.ceil(transferItems.length / rowsPerPage) - 1
              }
              onClick={() => setSelectedPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: `2px solid ${farmaColors.secondary}`,
            borderTop: `1px solid ${farmaColors.alpha.secondary10}`,
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Total Calculado
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: farmaColors.primary }}
            >
              Bs. {totalGeneral.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<BarChart />}
              onClick={() => setStockDrawerOpen(true)}
              sx={{
                borderColor: farmaColors.primary,
                color: farmaColors.primary,
                px: 3,
                height: 48,
                borderRadius: 2,
                fontWeight: 700,
                "&:hover": { bgcolor: farmaColors.alpha.primary10 },
              }}
            >
              Ver Stock
            </Button>

            {!isReadOnly && (
              <Button
                variant="outlined"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                onClick={handleConfirmSave} // ← directo, sin setConfirmOpen(true)
                disabled={loading || transferItems.length === 0}
                sx={{
                  borderColor: farmaColors.secondary,
                  color: farmaColors.secondary,
                  px: 4,
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 700,
                  "&:hover": { bgcolor: farmaColors.alpha.secondary10 },
                }}
              >
                {loading ? "Guardando..." : "Guardar Traspaso"}
              </Button>
            )}

            {!isReadOnly && (
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
                onClick={() => setConfirmTerminarOpen(true)}
                disabled={loading || transferItems.length === 0}
                sx={{
                  background: farmaColors.gradients.primary,
                  px: 4,
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                Terminar Traspaso
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* ══ DROPDOWN PORTAL ══ */}
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
                maxHeight: 400,
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
                  background: farmaColors.secondaryDark,
                },
              }}
            >
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
                  const key = itemKey(product);
                  const isAdded = transferItems.some(
                    (item) => itemKey(item) === key,
                  );
                  const isSelected = index === selectedIndex;
                  const stock = product.stockProducto ?? 0;
                  return (
                    <ListItem
                      key={key + index}
                      ref={(el) => (itemRefs.current[index] = el)}
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
                        cursor: "default",
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
                        <CodigoProductoChip
                          codigo={
                            product.codigoProducto || product.codigo || ""
                          }
                        />
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
                                ? `Venc: ${product.fechaVencimiento?.split("T")[0]}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5, mt: 0.3 }}>
                            <Chip
                              label={`C/U: ${Number(product.costoUnitario || 0).toFixed(2)}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                bgcolor: farmaColors.alpha.secondary10,
                                color: farmaColors.secondary,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={`P/U: ${Number(product.precioUnitario || 0).toFixed(2)}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                bgcolor: farmaColors.primary,
                                color: "white",
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                        </Box>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(product);
                            }}
                            sx={{
                              bgcolor: farmaColors.primary,
                              color: "white",
                              fontWeight: 700,
                              height: 22,
                              flexShrink: 0,
                              cursor: "pointer",
                              "&:hover": { bgcolor: farmaColors.secondary },
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

      {/* StockDrawer */}
      <StockDrawer
        open={stockDrawerOpen}
        onClose={() => setStockDrawerOpen(false)}
      />

      {/* Dialog: Copiar de Compra */}
      <Dialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 800,
            color: farmaColors.secondary,
          }}
        >
          <ContentCopy color="primary" /> Copiar Productos de Compra
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}
              >
                1. Seleccione una Compra
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, maxHeight: 450 }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                        Número / Descr.
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      >
                        Ver
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingPurchases ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : purchaseList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No hay compras recientes
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...purchaseList]
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                        .slice(purchasePage * 10, (purchasePage + 1) * 10)
                        .map((c) => (
                          <TableRow
                            key={c.codigo}
                            hover
                            selected={selectedPurchase === c.numeroCompra}
                            sx={{
                              "&.Mui-selected": {
                                bgcolor: farmaColors.alpha.primary10,
                              },
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              fetchPurchaseProducts(c.numeroCompra)
                            }
                          >
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {c.fecha?.split("T")[0]}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {c.numeroCompra}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: "block", maxWidth: 150 }}
                              >
                                {c.descripcion}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color={
                                  selectedPurchase === c.numeroCompra
                                    ? "primary"
                                    : "default"
                                }
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {purchaseList.length > 10 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Button
                    size="small"
                    disabled={purchasePage === 0}
                    onClick={() => setPurchasePage((p) => p - 1)}
                  >
                    Ant.
                  </Button>
                  <Typography variant="caption" sx={{ alignSelf: "center" }}>
                    {purchasePage + 1} / {Math.ceil(purchaseList.length / 10)}
                  </Typography>
                  <Button
                    size="small"
                    disabled={
                      purchasePage >= Math.ceil(purchaseList.length / 10) - 1
                    }
                    onClick={() => setPurchasePage((p) => p + 1)}
                  >
                    Sig.
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}
              >
                2. Productos de la Compra
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, maxHeight: 450 }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                        Código / Producto
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                        Lote
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      >
                        Stock
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                        Vence
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingPurchaseProducts ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                          <CircularProgress size={30} />
                          <Typography
                            variant="body2"
                            sx={{ mt: 1 }}
                            color="text.secondary"
                          >
                            Cargando productos...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : !selectedPurchase ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                          <Typography variant="body2" color="text.disabled">
                            Seleccione una compra de la izquierda
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : purchaseProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                          <Typography variant="body2" color="text.secondary">
                            Esta compra no tiene productos vinculados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseProducts.map((p, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: farmaColors.primary,
                              }}
                            >
                              {p.codigoProducto}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {p.producto}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              ID: {p.lote_ID}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ display: "block" }}
                            >
                              {p.numeroLote}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={p.stockProducto}
                              size="small"
                              color={
                                p.stockProducto > 0 ? "success" : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "error.main",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          >
                            {p.fechaVencimiento?.split("T")[0]}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "grey.50" }}>
          <Button
            onClick={() => setCopyDialogOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            onClick={() => {
              copyProductsFromPurchase();
              setCopyDialogOpen(false);
            }}
            variant="contained"
            disabled={purchaseProducts.length === 0}
            startIcon={<ContentCopy />}
            sx={{
              background: farmaColors.gradients.primary,
              px: 4,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Copiar Selección a Traspaso
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar Guardar (PEN) */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 800,
          }}
        >
          <WarningIcon color="warning" /> Confirmar Guardado
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Está seguro que desea guardar este traspaso?
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ Una vez guardado,{" "}
            <strong>no podrá modificar ni agregar productos</strong> al
            traspaso.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            No, cancelar
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              handleConfirmSave();
            }}
            variant="contained"
            sx={{
              background: farmaColors.gradients.primary,
              px: 3,
              fontWeight: 700,
            }}
          >
            Sí, Guardar Traspaso
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar Terminar (ENV) */}
      <Dialog
        open={confirmTerminarOpen}
        onClose={() => setConfirmTerminarOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 800,
          }}
        >
          <CheckCircle color="success" /> Terminar Traspaso
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Está seguro que desea terminar y enviar este traspaso?
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ El traspaso pasará al estado <strong>"Enviado"</strong> y no
            podrá ser modificado.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={() => setConfirmTerminarOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            No, cancelar
          </Button>
          <Button
            onClick={() => {
              setConfirmTerminarOpen(false);
              handleTerminarTraspaso();
            }}
            variant="contained"
            sx={{
              background: farmaColors.gradients.primary,
              px: 3,
              fontWeight: 700,
            }}
          >
            Sí, Terminar Traspaso
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddProductsToTransferSection;
