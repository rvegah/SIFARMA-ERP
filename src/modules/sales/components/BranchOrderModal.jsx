import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { Close, Store, Add, Save, Search, Delete, LibraryAdd, Warning, CheckCircle } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { useAuth } from "../../../context/AuthContext";
import branchOrderService from "../services/branchOrderService";
import userService from "../../../services/api/userService";
import CopyTransfersDialog from "./CopyTransfersDialog";

const BranchOrderModal = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  // Default time/date logic
  const now = new Date();
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  // Form Step 1 Data
  const [formData, setFormData] = useState({
    descripcion: "",
    sucursalSolicitante: user?.codigoSucursal_SIAT || 0,
    sucursalProveedor: 0,
    fechaPedido: defaultDate,
    horaPedido: defaultTime,
    observaciones: "",
  });

  // Data from API after Step 1 success
  const [createdOrderAuth, setCreatedOrderAuth] = useState(null);

  // Form Step 2 Data
  const [searchParams, setSearchParams] = useState({ nombre: "", codigo: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [orderItems, setOrderItems] = useState([]); // Products added to order
  
  // Dialogs & Loading
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [savingStep1, setSavingStep1] = useState(false);
  const [savingStep2, setSavingStep2] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  // Catalogs
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    if (open) {
      loadSucursales();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      descripcion: "",
      sucursalSolicitante: user?.codigoSucursal_SIAT || 0,
      sucursalProveedor: 0,
      fechaPedido: defaultDate,
      horaPedido: defaultTime,
      observaciones: "",
    });
    setCreatedOrderAuth(null);
    setOrderItems([]);
    setSearchResults([]);
    setSearchParams({ nombre: "", codigo: "" });
    setOrderCompleted(false);
  };

  const loadSucursales = async () => {
    try {
      const resp = await userService.getSucursales();
      if (resp && Array.isArray(resp)) {
        setSucursales(resp);
      }
    } catch (error) {
      console.error("Error loading sucursales", error);
    }
  };

  // ─── STEP 1 HANDLERS ────────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    if (!formData.descripcion || !formData.sucursalSolicitante || !formData.sucursalProveedor) {
      enqueueSnackbar("Por favor, complete los campos obligatorios (Descripción, Sucursal Solicitante, Sucursal Proveedor).", { variant: "warning" });
      return;
    }
    
    setSavingStep1(true);
    try {
      const payload = {
        usuarioCreadorPedido: user?.usuario_ID || 0,
        descripcion: formData.descripcion,
        sucursalSolicitante: formData.sucursalSolicitante,
        sucursalProveedor: formData.sucursalProveedor,
        fechaPedido: formData.fechaPedido, // Adjust format if strictly required by API
        horaPedido: formData.horaPedido,
        observaciones: formData.observaciones,
        codigoEmpleadoAlta: user?.empleado_ID?.toString() || user?.usuario || "SISTEMA",
      };

      const response = await branchOrderService.crearPedido(payload);
      if (response.exitoso) {
        setCreatedOrderAuth(response.datos); // Contains pedidoProductos_ID, numeroPedido, etc
        setActiveStep(1);
      } else {
        enqueueSnackbar(response.mensaje || "Error al crear el pedido", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Ocurrió un error de conexión al crear el pedido.", { variant: "error" });
    } finally {
      setSavingStep1(false);
    }
  };

  // ─── STEP 2 HANDLERS ────────────────────────────────────────────────────────
  const handleSearchProducts = async () => {
    setSearching(true);
    try {
      const response = await branchOrderService.buscarProductos({
        ...searchParams,
        sucursalId: formData.sucursalProveedor, // Search in provider's stock
      });
      if (response.exitoso) {
        setSearchResults(response.datos || []);
      } else {
        enqueueSnackbar(response.mensaje || "Error al buscar productos", { variant: "error" });
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddProduct = (product) => {
    const exists = orderItems.find((item) => item.producto_ID === product.producto_ID);
    if (!exists) {
      setOrderItems([...orderItems, { ...product, cantidadSolicitada: 1, obsItem: "" }]);
    }
  };

  const handleRemoveProduct = (producto_ID) => {
    setOrderItems(orderItems.filter((item) => item.producto_ID !== producto_ID));
  };

  const handleCopyTransfers = (products) => {
    const newItems = [...orderItems];
    let addedCount = 0;
    
    products.forEach((p) => {
      const exists = newItems.find((item) => item.producto_ID === p.producto_ID);
      if (!exists) {
        newItems.push({
          ...p,
          cantidadSolicitada: 1,
          obsItem: "Copiado de traspaso",
        });
        addedCount++;
      }
    });

    setOrderItems(newItems);
    setCopyDialogOpen(false);
    // Notify user of copied items
    if (addedCount > 0) {
      enqueueSnackbar(`Se han añadido ${addedCount} productos a la lista.`, { variant: "success" });
    } else {
      enqueueSnackbar("No se añadieron productos nuevos (ya estaban en la lista o la lista estaba vacía).", { variant: "info" });
    }
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      enqueueSnackbar("Agregue al menos un producto al pedido.", { variant: "warning" });
      return;
    }
    setShowConfirmSave(true);
  };

  const confirmSaveOrder = async () => {
    setShowConfirmSave(false);
    setSavingStep2(true);
    
    try {
      const payload = {
        numeroPedido: createdOrderAuth.numeroPedido,
        codigoEmpleadoAlta: user?.empleado_ID?.toString() || user?.usuario || "SISTEMA",
        productos: orderItems.map((item) => ({
          skU_ID: item.sku || item.producto_ID, // Use sku, fallback to producto_ID if undefined
          lote_ID: item.lote_ID || 1, // Fallback if missing
          producto_ID: item.producto_ID,
          fechaVencimiento: item.fechaVencimiento || new Date().toISOString(),
          cantidadSolicitada: Number(item.cantidadSolicitada) || 1,
          observaciones: item.obsItem || "",
        })),
      };

      const response = await branchOrderService.guardarPedido(payload);
      if (response.exitoso) {
        setOrderCompleted(true);
        enqueueSnackbar(response.mensaje || "Pedido guardado exitosamente", { variant: "success" });
      } else {
        enqueueSnackbar(response.mensaje || "Error al guardar los productos del pedido", { variant: "error" });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Ocurrió un error al guardar el pedido.", { variant: "error" });
    } finally {
      setSavingStep2(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: "85vh", display: "flex", flexDirection: "column" },
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
          <Store />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
            Nuevo Pedido de Sucursal
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Detalles del Pedido</StepLabel>
          </Step>
          <Step>
            <StepLabel>Añadir Productos</StepLabel>
          </Step>
        </Stepper>

        {/* ─── STEP 1: CREATE ORDER FORM ─────────────────────────────────────── */}
        {activeStep === 0 && (
          <Box sx={{ flexGrow: 1 }}>
            <Paper elevation={1} sx={{ p: 4, bgcolor: "#fafafa", borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción del Pedido"
                    fullWidth
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Sucursal Solicitante"
                    fullWidth
                    required
                    value={formData.sucursalSolicitante}
                    onChange={(e) => setFormData({ ...formData, sucursalSolicitante: e.target.value })}
                  >
                    <MenuItem value={0} disabled>Seleccione una sucursal</MenuItem>
                    {sucursales.map((suc) => (
                      <MenuItem key={suc.sucursal_ID} value={suc.sucursal_ID}>
                        {suc.razonSocialSucursal || suc.nombreSucursal}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Sucursal Proveedor"
                    fullWidth
                    required
                    value={formData.sucursalProveedor}
                    onChange={(e) => setFormData({ ...formData, sucursalProveedor: e.target.value })}
                  >
                    <MenuItem value={0} disabled>Seleccione una sucursal</MenuItem>
                    {sucursales.map((suc) => (
                      <MenuItem key={suc.sucursal_ID} value={suc.sucursal_ID}>
                        {suc.razonSocialSucursal || suc.nombreSucursal}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Fecha del Pedido"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaPedido}
                    onChange={(e) => setFormData({ ...formData, fechaPedido: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="time"
                    label="Hora del Pedido"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.horaPedido}
                    onChange={(e) => setFormData({ ...formData, horaPedido: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleCreateOrder}
                  disabled={savingStep1}
                  sx={{ bgcolor: farmaColors.primary, px: 4, py: 1 }}
                >
                  {savingStep1 ? <CircularProgress size={24} color="inherit" /> : "Guardar Pedido"}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* ─── STEP 2: ADD PRODUCTS ──────────────────────────────────────────── */}
        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, gap: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Pedido N° {createdOrderAuth?.numeroPedido}
              </Typography>
              {!orderCompleted && (
                <Button
                  variant="outlined"
                  startIcon={<LibraryAdd />}
                  onClick={() => setCopyDialogOpen(true)}
                  color="secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Copiar Productos de Traspaso
                </Button>
              )}
            </Box>

            {!orderCompleted && (
              <>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Búsqueda de Productos
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        size="small"
                        label="Nombre"
                        fullWidth
                        value={searchParams.nombre}
                        onChange={(e) => setSearchParams({ ...searchParams, nombre: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && handleSearchProducts()}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        size="small"
                        label="Código"
                        fullWidth
                        value={searchParams.codigo}
                        onChange={(e) => setSearchParams({ ...searchParams, codigo: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && handleSearchProducts()}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSearchProducts}
                        disabled={searching}
                        startIcon={<Search />}
                        sx={{ bgcolor: farmaColors.primary }}
                      >
                        Buscar
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Resultados Búsqueda */}
                  <Box mt={2} sx={{ maxHeight: 200, overflowY: "auto" }}>
                    {searching ? (
                      <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress size={30} />
                      </Box>
                    ) : searchResults.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#eee" }}>
                              <TableCell>Código</TableCell>
                              <TableCell>Producto</TableCell>
                              <TableCell>Lote</TableCell>
                              <TableCell align="right">Stock</TableCell>
                              <TableCell align="center">Acción</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {searchResults.map((p, idx) => {
                              const isAdded = orderItems.some((item) => item.producto_ID === p.producto_ID);
                              return (
                                <TableRow key={idx} hover>
                                  <TableCell>{p.codigoProducto}</TableCell>
                                  <TableCell>{p.producto}</TableCell>
                                  <TableCell>{p.lote_ID || "-"}</TableCell>
                                  <TableCell align="right">{p.stockProducto}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      disabled={isAdded}
                                      sx={{ color: isAdded ? "text.disabled" : farmaColors.primary }}
                                      onClick={() => handleAddProduct(p)}
                                    >
                                      <Add />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}
                  </Box>
                </Paper>
              </>
            )}

            {/* Productos en el pedido */}
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
              Productos en Pedido
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ flexGrow: 1, minHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10 }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10 }}>
                      Producto
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10 }}>
                      Lote
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10, width: 150 }}
                    >
                      Cantidad
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10 }}
                    >
                      Observaciones
                    </TableCell>
                    {!orderCompleted && (
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: farmaColors.alpha.secondary10 }}>
                        Acción
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No hay productos en el pedido.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderItems.map((item, idx) => (
                      <TableRow key={item.producto_ID || idx}>
                        <TableCell>{item.codigoProducto || item.codigo}</TableCell>
                        <TableCell>{item.producto || item.nombre}</TableCell>
                        <TableCell>{item.lote_ID}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            InputProps={{ inputProps: { min: 1 } }}
                            value={item.cantidadSolicitada}
                            onChange={(e) => {
                              const newArr = [...orderItems];
                              newArr[idx].cantidadSolicitada = e.target.value;
                              setOrderItems(newArr);
                            }}
                            disabled={orderCompleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={item.obsItem}
                            placeholder="Obs..."
                            onChange={(e) => {
                              const newArr = [...orderItems];
                              newArr[idx].obsItem = e.target.value;
                              setOrderItems(newArr);
                            }}
                            disabled={orderCompleted}
                          />
                        </TableCell>
                        {!orderCompleted && (
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveProduct(item.producto_ID)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {orderCompleted && (
              <Box display="flex" justifyContent="center" alignItems="center" bgcolor="#e8f5e9" p={3} borderRadius={2} mt={2}>
                 <CheckCircle color="success" sx={{ mr: 1, fontSize: 32 }} />
                 <Typography variant="h6" color="success.dark">Pedido creado y guardado exitosamente.</Typography>
              </Box>
            )}

            {/* Acciones Finales */}
            {!orderCompleted && (
              <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleSaveOrder}
                  disabled={savingStep2 || orderItems.length === 0}
                  startIcon={<Save />}
                  sx={{ px: 4 }}
                >
                  Guardar Productos del Pedido
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
        <Button onClick={onClose} variant="contained" color="inherit">
          {orderCompleted ? "Cerrar" : "Cancelar"}
        </Button>
      </DialogActions>

      {/* Dialog for copying from transfers */}
      <CopyTransfersDialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        onCopy={handleCopyTransfers}
      />

      {/* Confirmation Dialog to Save */}
      <Dialog open={showConfirmSave} onClose={() => setShowConfirmSave(false)}>
        <DialogTitle sx={{ bgcolor: "#f57c00", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
           <Warning /> Confirmar Accion
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Una vez guardado, <b>no podrá modificar más</b> los productos de este pedido. ¿Desea continuar?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowConfirmSave(false)} variant="outlined">Cancelar</Button>
          <Button onClick={confirmSaveOrder} variant="contained" color="warning" disabled={savingStep2}>
            {savingStep2 ? <CircularProgress size={20}/> : "Sí, Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default BranchOrderModal;
