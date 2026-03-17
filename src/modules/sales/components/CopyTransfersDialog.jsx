import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Visibility, Close, ContentCopy } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import branchOrderService from "../services/branchOrderService";

const CopyTransfersDialog = ({ open, onClose, onCopy }) => {
  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferProducts, setTransferProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (open) {
      loadTransfers();
      setSelectedTransfer(null);
      setTransferProducts([]);
      setPage(0);
    }
  }, [open]);

  const loadTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const response = await branchOrderService.getListaTraspasos();
      if (response.exitoso) {
        // Ordenar descendente por fecha
        const sorted = (response.datos || []).sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTransfers(sorted);
      } else {
        alert(response.mensaje || "Error al cargar traspasos");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const handleSelectTransfer = async (transfer) => {
    setSelectedTransfer(transfer);
    setLoadingProducts(true);
    try {
      const response = await branchOrderService.getProductosTraspaso(
        transfer.numeroTraspaso
      );
      if (response.exitoso) {
        setTransferProducts(response.datos || []);
      } else {
        setTransferProducts([]);
        alert(response.mensaje || "Error al cargar productos del traspaso");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCopy = () => {
    if (transferProducts.length > 0) {
      onCopy(transferProducts);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: farmaColors.secondary,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Copiar Productos de Traspaso
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
        {/* Taba de traspasos */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Lista de Traspasos
        </Typography>
        {loadingTransfers ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                      Fecha
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                      Nº Traspaso
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                      Descripción
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}
                      align="center"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((t) => (
                      <TableRow
                        key={t.numeroTraspaso}
                        hover
                        selected={selectedTransfer?.numeroTraspaso === t.numeroTraspaso}
                      >
                        <TableCell>
                          {new Date(t.fecha).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell>{t.numeroTraspaso}</TableCell>
                        <TableCell>{t.descripcion}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleSelectTransfer(t)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {transfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No se encontraron traspasos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {transfers.length > rowsPerPage && (
              <Box p={1} display="flex" justifyContent="space-between">
                <Button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Typography variant="body2" sx={{ alignSelf: "center" }}>
                  Página {page + 1} de {Math.ceil(transfers.length / rowsPerPage)}
                </Typography>
                <Button
                  disabled={
                    page >= Math.ceil(transfers.length / rowsPerPage) - 1
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </Box>
            )}
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Tabla de productos del traspaso seleccionado */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Productos del Traspaso{" "}
          {selectedTransfer ? `(${selectedTransfer.numeroTraspaso})` : ""}
        </Typography>
        {loadingProducts ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ flexGrow: 1, minHeight: 200 }}>
            {selectedTransfer && transferProducts.length > 0 ? (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                        Código
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                        Producto
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                        Lote ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                        Vencimiento
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}
                        align="right"
                      >
                        Stock Origen
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferProducts.map((p, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{p.codigoProducto}</TableCell>
                        <TableCell>{p.producto}</TableCell>
                        <TableCell>{p.lote_ID}</TableCell>
                        <TableCell>
                          {p.fechaVencimiento
                            ? new Date(p.fechaVencimiento).toLocaleDateString(
                                "es-ES"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell align="right">{p.stockProducto}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                p={4}
              >
                <Typography color="text.secondary">
                  {selectedTransfer
                    ? "Este traspaso no tiene productos."
                    : "Seleccione un traspaso para ver sus productos."}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          color="primary"
          startIcon={<ContentCopy />}
          disabled={!selectedTransfer || transferProducts.length === 0}
        >
          Copiar {transferProducts.length} productos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyTransfersDialog;
