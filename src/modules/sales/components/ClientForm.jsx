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
  CircularProgress,
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

// ✅ Fallback hardcodeado: solo se usa si la API falla
const TIPOS_DOCUMENTO_FALLBACK = [
  { codigoClasificador: 1, descripcion: "CI - CEDULA DE IDENTIDAD" },
  {
    codigoClasificador: 2,
    descripcion: "CEX - CEDULA DE IDENTIDAD EXTRANJERO",
  },
  { codigoClasificador: 3, descripcion: "PAS - PASAPORTE" },
  { codigoClasificador: 4, descripcion: "OD - OTRO DOCUMENTO DE IDENTIDAD" },
  {
    codigoClasificador: 5,
    descripcion: "NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA",
  },
];

const ClientForm = ({
  clientForm,
  setClientForm,
  handleClientSearch,
  totals,
  tiposDocumentoIdentidad = [],
  loadingCatalogos = false,
  isAdmin = false,
  // ✅ NUEVO: callback para buscar cliente en FARMADINAMICA
  onBuscarCliente,
}) => {
  const [descuentoInput, setDescuentoInput] = useState(
    String(clientForm.descuentoAdicional ?? 0),
  );
  const [pagadoInput, setPagadoInput] = useState(
    String(clientForm.pagado ?? 0),
  );
  // ✅ NUEVO: indica que se está buscando el cliente en FARMADINAMICA
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  // Sincronizar estado local cuando clientForm se resetea externamente
  useEffect(() => {
    setDescuentoInput(String(clientForm.descuentoAdicional ?? 0));
  }, [clientForm.descuentoAdicional]);

  useEffect(() => {
    setPagadoInput(String(clientForm.pagado ?? 0));
  }, [clientForm.pagado]);

  const nitTimerRef = useRef(null);

  const tiposDocumento =
    tiposDocumentoIdentidad.length > 0
      ? tiposDocumentoIdentidad
      : TIPOS_DOCUMENTO_FALLBACK;

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

  // Manejo de búsqueda SIAT con debounce (igual que antes)
  const handleNitChange = (value) => {
    setClientForm((prev) => ({ ...prev, nit: value }));

    if (nitTimerRef.current) clearTimeout(nitTimerRef.current);

    if (value.length >= 4) {
      nitTimerRef.current = setTimeout(() => {
        handleClientSearch(value);
      }, 400);
    }
  };

  // ✅ NUEVO: onBlur del campo NIT → buscar cliente en FARMADINAMICA
  const handleNitBlur = async () => {
    const nit = clientForm.nit?.trim();
    // No buscar para NITs especiales (4444, 99001, 99002, 99003)
    const nitEspeciales = ["4444", "99001", "99002", "99003"];
    if (!nit || nit.length < 4 || nitEspeciales.includes(nit)) return;
    if (!onBuscarCliente) return;

    setBuscandoCliente(true);
    try {
      await onBuscarCliente({ numeroDocumento: nit });
    } finally {
      setBuscandoCliente(false);
    }
  };

  // ✅ NUEVO: onBlur del campo Nombre → buscar cliente en FARMADINAMICA
  const handleNombreBlur = async () => {
    const nombre = clientForm.nombre?.trim();
    // Solo buscar por nombre si el NIT está vacío o muy corto
    if (!nombre || nombre.length < 3) return;
    if (clientForm.nit && clientForm.nit.length >= 4) return; // ya tiene NIT, no repetir
    if (!onBuscarCliente) return;

    setBuscandoCliente(true);
    try {
      await onBuscarCliente({ razonSocial: nombre });
    } finally {
      setBuscandoCliente(false);
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
      {/* HEADER */}
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
          {/* ✅ Indicador de búsqueda en FARMADINAMICA */}
          {buscandoCliente && (
            <CircularProgress size={14} sx={{ color: "white", ml: 1 }} />
          )}
        </Typography>

        {/* TOTAL VENTA */}
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
        {/* FILA 0: TIPO DE FACTURA — Solo Admin */}
        {isAdmin && (
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            {/* Sector de Documento */}
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
                Sector de Documento:
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={clientForm.codigoDocumentoSector || "1"}
                onChange={(e) =>
                  setClientForm((prev) => ({
                    ...prev,
                    codigoDocumentoSector: e.target.value,
                    periodoFacturado: "",
                  }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "0.875rem",
                  },
                }}
              >
                <MenuItem value="1">
                  Sector 1 - Compra y Venta de Bienes y Servicios
                </MenuItem>
                <MenuItem value="2">
                  Sector 2 - Alquiler de Bienes Inmuebles
                </MenuItem>
              </TextField>
            </Grid>

            {/* Periodo Facturado — solo si sector 2 */}
            {clientForm.codigoDocumentoSector === "2" && (
              <Grid item xs={12} md={4}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Periodo Facturado: <span style={{ color: "#ffcc80" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={clientForm.periodoFacturado || ""}
                  onChange={(e) =>
                    setClientForm((prev) => ({
                      ...prev,
                      periodoFacturado: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Ej: FEBRERO 2026 o 12 DE MARZO AL 11 DE ABRIL DE 2026"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#ffcc80",
                    display: "block",
                    mt: 0.5,
                    fontSize: "0.75rem",
                  }}
                >
                  📌 <strong>Sector Alquiler:</strong> Código actividad:{" "}
                  <strong>6810110</strong> · Producto SIN:{" "}
                  <strong>1004039</strong>
                </Typography>
              </Grid>
            )}
          </Grid>
        )}

        {/* FILA 1: DATOS TRIBUTARIOS */}
        <Grid container spacing={1.5} alignItems="flex-start">
          {/* CÓDIGO RÁPIDO NIT */}
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
                    <Business
                      sx={{ color: farmaColors.primary, fontSize: 18 }}
                    />
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

          {/* NIT/CI MANUAL — ✅ onBlur busca en FARMADINAMICA */}
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
              onBlur={handleNitBlur}
              placeholder="Ingrese NIT/CI"
              InputProps={{
                endAdornment: buscandoCliente ? (
                  <InputAdornment position="end">
                    <CircularProgress
                      size={14}
                      sx={{ color: farmaColors.primary }}
                    />
                  </InputAdornment>
                ) : null,
              }}
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
              value={
                clientForm.tipoDocumento === "1" ? clientForm.complemento : ""
              }
              onChange={(e) =>
                setClientForm((prev) => ({
                  ...prev,
                  complemento: e.target.value.toUpperCase(),
                }))
              }
              disabled={clientForm.tipoDocumento !== "1"}
              placeholder="Comp."
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                },
              }}
            />
          </Grid>

          {/* NOMBRE — ✅ onBlur busca en FARMADINAMICA (solo si no hay NIT) */}
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
                setClientForm((prev) => ({
                  ...prev,
                  nombre: e.target.value.toUpperCase(),
                }))
              }
              onBlur={handleNombreBlur}
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
                  textTransform: "uppercase",
                },
              }}
            />
          </Grid>

          {/* TIPO DOCUMENTO — Dinámico desde API SIAT */}
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
              {loadingCatalogos && (
                <CircularProgress
                  size={10}
                  sx={{ ml: 1, color: "white", verticalAlign: "middle" }}
                />
              )}
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
                  complemento: e.target.value !== "1" ? "" : prev.complemento,
                }))
              }
              disabled={loadingCatalogos && tiposDocumento.length === 0}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            >
              {tiposDocumento.map((tipo) => (
                <MenuItem
                  key={tipo.codigoClasificador}
                  value={String(tipo.codigoClasificador)}
                >
                  {tipo.codigoClasificador} - {tipo.descripcion}
                </MenuItem>
              ))}
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
              key={clientForm.fechaNacimiento || "empty-date"}
              value={clientForm.fechaNacimiento || ""}
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
                    <Discount
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
                    <Payment
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
