// src/modules/purchases/components/AddProductsToPurchaseSection.jsx
// Orden: 1) Detalle Compra  2) Datos Facturación  3) Productos de la Compra

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  CalendarToday,
  Inventory,
  LocalPostOffice,
  Save,
  Receipt,
  Badge,
  Business,
  ShoppingCart,
  Payments,
  Discount,
  MonetizationOn,
  AssignmentTurnedIn,
  HelpOutline,
  CheckCircleOutline,
  ArrowBack,
  BarChart,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import PurchaseItemsTable from "./PurchaseItemsTable";

import StockDrawer from "./StockDrawer";

const AddProductsToPurchaseSection = ({
  createdPurchase,
  purchaseItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onSearchProducts,
  searchResults,
  isSearching,
  searchQuery,
  setSearchQuery,
  handleSaveProducts,
  handleSaveInvoice,
  handleTerminarCompra,
  invoiceData,
  setInvoiceData,
  calculateTotal,
  loading,
  setViewState,
}) => {
  const [isFinished, setIsFinished] = useState(false);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const total = calculateTotal ? calculateTotal() : 0;

  const isReadOnly = isFinished || createdPurchase?.puedeEditar === false;

  const updateInvoiceField = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmTerminar = async () => {
    setFinishing(true);
    try {
      const ok = await handleTerminarCompra();
      if (ok) {
        setIsFinished(true);
        setFinishConfirmOpen(false);
      }
    } finally {
      setFinishing(false);
    }
  };

  if (!createdPurchase) return null;

  const [stockDrawerOpen, setStockDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ── 1. Cabecera resumen ── */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: farmaColors.alpha.primary10,
          border: `1px solid ${farmaColors.alpha.primary20}`,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Tooltip title="Volver a cabecera">
                <IconButton
                  size="small"
                  onClick={() => setViewState("creating")}
                  disabled={isReadOnly}
                >
                  <ArrowBack fontSize="small" />
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
                <CheckCircleOutline sx={{ color: farmaColors.primary }} />
                Detalle de la Compra
              </Typography>
            </Box>
            <Chip
              label={
                createdPurchase.numeroCompra ||
                `#${createdPurchase.comprobanteCompra_ID}`
              }
              sx={{
                bgcolor: farmaColors.primary,
                color: "white",
                fontWeight: 800,
                fontSize: "0.9rem",
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday sx={{ color: "action.active", fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {createdPurchase.fecha?.split("T")[0] || "-"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Inventory sx={{ color: "action.active", fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {createdPurchase.descripcion || "Sin descripción"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalPostOffice
                  sx={{ color: "action.active", fontSize: 18 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Código Compra
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: farmaColors.primary }}
                  >
                    {createdPurchase.numeroCompra ||
                      createdPurchase.comprobanteCompra_ID}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── 2. Datos de Facturación ── */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Receipt sx={{ color: farmaColors.primary }} /> Datos de
              Facturación
            </Typography>
            {!isReadOnly && (
              <Tooltip title="Guardar Factura">
                <IconButton
                  onClick={handleSaveInvoice}
                  disabled={loading}
                  sx={{
                    color: "white",
                    bgcolor: farmaColors.primary,
                    "&:hover": { bgcolor: farmaColors.secondary },
                    "&.Mui-disabled": { bgcolor: "#e0e0e0" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Save />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número Factura"
                size="small"
                value={invoiceData.numeroFactura || ""}
                onChange={(e) =>
                  updateInvoiceField("numeroFactura", e.target.value)
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Receipt sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                size="small"
                value={invoiceData.fecha || ""}
                onChange={(e) => updateInvoiceField("fecha", e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <CalendarToday sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="NIT"
                size="small"
                value={invoiceData.nit || ""}
                onChange={(e) => updateInvoiceField("nit", e.target.value)}
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Badge sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Proveedor"
                size="small"
                value={invoiceData.nombreProveedor || ""}
                onChange={(e) =>
                  updateInvoiceField("nombreProveedor", e.target.value)
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Business sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número Pedido"
                size="small"
                value={invoiceData.numeroPedido || ""}
                onChange={(e) =>
                  updateInvoiceField("numeroPedido", e.target.value)
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <ShoppingCart sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Total Compra"
                type="number"
                size="small"
                value={
                  invoiceData.totalCompra === undefined
                    ? ""
                    : invoiceData.totalCompra
                }
                onChange={(e) =>
                  updateInvoiceField(
                    "totalCompra",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Payments sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Desc. Comercial"
                type="number"
                size="small"
                value={
                  invoiceData.descuentoComercial === undefined
                    ? ""
                    : invoiceData.descuentoComercial
                }
                onChange={(e) =>
                  updateInvoiceField(
                    "descuentoComercial",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Discount sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Desc. Especial"
                type="number"
                size="small"
                value={
                  invoiceData.descuentoEspecial === undefined
                    ? ""
                    : invoiceData.descuentoEspecial
                }
                onChange={(e) =>
                  updateInvoiceField(
                    "descuentoEspecial",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <Discount sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Importe a Pagar"
                type="number"
                size="small"
                value={
                  invoiceData.importePagar === undefined
                    ? ""
                    : invoiceData.importePagar
                }
                onChange={(e) =>
                  updateInvoiceField(
                    "importePagar",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <MonetizationOn
                      sx={{ color: farmaColors.primary, mr: 1 }}
                    />
                  ),
                }}
                sx={{ bgcolor: farmaColors.alpha.primary10 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── 3. Tabla inline de productos con buscador ── */}
      <PurchaseItemsTable
        items={purchaseItems}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
        onSearchProducts={onSearchProducts}
        searchResults={searchResults}
        isSearching={isSearching}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFinished={isReadOnly}
      />

      {/* Total + botón guardar productos */}
      {!isReadOnly && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            px: 1,
            py: 2,
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            border: `2px solid ${farmaColors.secondary}`,
          }}
        >
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: "block" }}
            >
              Total Calculado
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: farmaColors.primary }}
            >
              Bs. {total.toFixed(2)}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<BarChart />}
            onClick={() => setStockDrawerOpen(true)}
            sx={{
              borderColor: farmaColors.primary,
              color: farmaColors.primary,
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 700,
              "&:hover": { bgcolor: farmaColors.alpha.primary10 },
            }}
          >
            Ver Stock
          </Button>
          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Save />
              )
            }
            onClick={handleSaveProducts}
            disabled={loading || purchaseItems.length === 0}
            sx={{
              borderColor: farmaColors.secondary,
              color: farmaColors.secondary,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              "&:hover": {
                borderColor: farmaColors.secondary,
                bgcolor: farmaColors.alpha.secondary10,
              },
            }}
          >
            {loading ? "Guardando..." : "Guardar Productos"}
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<AssignmentTurnedIn />}
            onClick={() => setFinishConfirmOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              background: farmaColors.gradients.primary,
              boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            Terminar Compra
          </Button>
        </Box>
      )}

      {isReadOnly && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "rgba(76,175,80,0.1)",
            border: "2px solid #4CAF50",
            mb: 4,
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 48, color: "#4CAF50", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#388e3c" }}>
            {createdPurchase?.puedeEditar === false
              ? "La compra ya fue enviada y no puede modificarse."
              : "¡Compra finalizada correctamente!"}
          </Typography>
        </Box>
      )}

      {/* Diálogo confirmación */}
      <Dialog
        open={finishConfirmOpen}
        onClose={() => setFinishConfirmOpen(false)}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: farmaColors.secondary,
          }}
        >
          <HelpOutline color="primary" /> Confirmar Acción
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea terminar la compra? Esta acción fijará los datos y no podrá
            modificarlos posteriormente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setFinishConfirmOpen(false)}
            disabled={finishing}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmTerminar}
            variant="contained"
            color="primary"
            disabled={finishing}
            startIcon={
              finishing ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            Sí, Terminar
          </Button>
        </DialogActions>
      </Dialog>
      <StockDrawer
        open={stockDrawerOpen}
        onClose={() => setStockDrawerOpen(false)}
      />
    </Box>
  );
};

export default AddProductsToPurchaseSection;
