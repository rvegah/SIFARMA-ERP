// src/modules/sales/components/ClientForm.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Paper,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Payment,
  CreditCard,
  CalendarToday,
  Discount,
  Business,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";

const ClientForm = ({
  clientForm,
  setClientForm,
  handleClientSearch,
  totals,
}) => {
  const [descuentoInput, setDescuentoInput] = useState(
    String(clientForm.descuentoAdicional ?? 0)
  );
  const [pagadoInput, setPagadoInput] = useState(
    String(clientForm.pagado ?? 0)
  );
  const nitTimerRef = useRef(null);

  // Cálculo automático del cambio
  useEffect(() => {
    const pagado = Number(clientForm.pagado) || 0;
    const totalNeto = Number(totals?.total) || 0;
    const nuevoCambio = Math.max(0, pagado - totalNeto);

    if (Number(clientForm.cambio).toFixed(2) !== nuevoCambio.toFixed(2)) {
      setClientForm((prev) => ({ ...prev, cambio: nuevoCambio }));
    }
  }, [clientForm.pagado, clientForm.descuentoAdicional, totals.total]);

  // Códigos rápidos para NIT
  const quickCodes = [
    { code: "NIT/CI", label: "" },
    { code: "99001", label: "99001 - Consulados, Embajadas" },
    { code: "99002", label: "99002 - Control Tributario" },
    { code: "99003", label: "99003 - Ventas menores del Día" },
    { code: "4444", label: "4444 - SIN NOMBRE" },
  ];

  // Manejo de búsqueda con debounce
  const handleNitChange = (value) => {
    setClientForm((prev) => ({ ...prev, nit: value }));

    if (nitTimerRef.current) clearTimeout(nitTimerRef.current);

    if (value.length >= 4) {
      nitTimerRef.current = setTimeout(() => {
        handleClientSearch(value);
      }, 400);
    }
  };

  // Manejo de código rápido seleccionado
  const handleQuickCodeChange = (code) => {
    if (code === "") {
      setClientForm((prev) => ({ ...prev, nit: "", nombre: "" }));
      return;
    }

    const selected = quickCodes.find((item) => item.code === code);
    if (selected) {
      const cleanLabel = selected.label.replace(`${code} - `, "");
      setClientForm((prev) => ({
        ...prev,
        nit: code,
        nombre: cleanLabel,
        tipoDocumento: code === "4444" ? "1" : "5",
      }));
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* HEADER - MANTENIENDO TU DISEÑO ORIGINAL */}
      <Box
        sx={{
          background: farmaColors.secondary,
          px: 2,
          py: 1.5,
          borderRadius: "8px 8px 0 0",
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
          <Person /> Datos del Cliente
        </Typography>

        {/* TOTAL VENTA - EN EL HEADER */}
        <Box
          sx={{
            backgroundColor: "#4CAF50",
            color: "white",
            px: 3,
            py: 1,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              opacity: 0.95,
            }}
          >
            TOTAL VENTA
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: 1, color: "white" }}
          >
            Bs. {Number(totals.total || 0).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          background: farmaColors.secondary,
          p: 2,
          borderRadius: "0 0 8px 8px",
          border: `2px solid ${farmaColors.secondary}`,
        }}
      >
        {/* FILA 1: DATOS TRIBUTARIOS */}
        <Grid container spacing={1.5} alignItems="flex-start">
          {/* CÓDIGO RÁPIDO NIT - MÁS CORTO */}
          <Grid item xs={12} md={1.5}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Cód. Rápido:
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={
                quickCodes.find((q) => q.code === clientForm.nit)
                  ? clientForm.nit
                  : ""
              }
              onChange={(e) => handleQuickCodeChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                },
              }}
            >
              {quickCodes.map((item) => (
                <MenuItem key={item.code} value={item.code}>
                  {item.code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* NIT/CI MANUAL */}
          <Grid item xs={12} md={2.5}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              NIT/CI (Manual):
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={clientForm.nit}
              onChange={(e) => handleNitChange(e.target.value)}
              placeholder="Ingrese NIT/CI"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          {/* COMPLEMENTO */}
          <Grid item xs={12} md={1.5}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Complemento:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={clientForm.complemento}
              onChange={(e) =>
                setClientForm((prev) => ({
                  ...prev,
                  complemento: e.target.value,
                }))
              }
              placeholder="Comp."
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          {/* NOMBRE */}
          <Grid item xs={12} md={3.5}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Nombre Completo (Razón Social):
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={clientForm.nombre}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Nombre del cliente"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          {/* TIPO DOCUMENTO */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Tipo Documento Cliente:
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={clientForm.tipoDocumento}
              onChange={(e) =>
                setClientForm((prev) => ({
                  ...prev,
                  tipoDocumento: e.target.value,
                }))
              }
              SelectProps={{ native: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            >
              <option value="1">1 - CI - CEDULA DE IDENTIDAD</option>
              <option value="2">2 - CEX - CEDULA DE IDENTIDAD EXTRANJERO</option>
              <option value="3">3 - PAS - PASAPORTE</option>
              <option value="4">4 - OD - OTRO DOCUMENTO DE IDENTIDAD</option>
              <option value="5">5 - NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA</option>
            </TextField>
          </Grid>
        </Grid>

        {/* FILA 2: Celular, Email, Fecha Nacimiento, Descuento, Pagado, Cambio */}
        <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
          <Grid item xs={12} md={2}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Celular:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={clientForm.celular}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, celular: e.target.value }))
              }
              placeholder="591..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Email:
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="email"
              value={clientForm.email}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="correo@ejemplo.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Fecha Nacimiento:
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={clientForm.fechaNacimiento}
              onChange={(e) =>
                setClientForm((prev) => ({
                  ...prev,
                  fechaNacimiento: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday
                      sx={{ color: farmaColors.primary, fontSize: 18 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={1.5}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Descuento Adicional:
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={descuentoInput}
              onChange={(e) => {
                const val = e.target.value;
                setDescuentoInput(val);
                const num = val === "" ? 0 : parseFloat(val);
                if (!isNaN(num)) {
                  setClientForm((prev) => ({
                    ...prev,
                    descuentoAdicional: num,
                  }));
                }
              }}
              onBlur={() => {
                if (descuentoInput === "") setDescuentoInput("0");
              }}
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Discount sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          {/* Pagado */}
          <Grid item xs={12} md={1.75}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Pagado:
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={pagadoInput}
              onChange={(e) => {
                const val = e.target.value;
                setPagadoInput(val);
                const num = val === "" ? 0 : parseFloat(val);
                if (!isNaN(num)) {
                  setClientForm((prev) => ({ ...prev, pagado: num }));
                }
              }}
              onBlur={() => {
                if (pagadoInput === "") setPagadoInput("0");
              }}
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Payment sx={{ color: farmaColors.primary, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Grid>

          {/* Cambio */}
          <Grid item xs={12} md={1.75}>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              Cambio:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={`Bs. ${Number(clientForm.cambio || 0).toFixed(2)}`}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard sx={{ color: "#388e3c", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  "& .Mui-disabled": {
                    WebkitTextFillColor: "white",
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClientForm;