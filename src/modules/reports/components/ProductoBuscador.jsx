// src/modules/reports/components/ProductoBuscador.jsx
// Autocomplete con Portal + debounce + AbortController
// Reutilizable en VentasDiariasPage y VentasMensualesPage

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Portal,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import reportesService from "../../../services/api/reportesService";

export default function ProductoBuscador({
  codigoSucursal,
  onSelect,
  value,
  onClear,
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [portalPos, setPortalPos] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const mostrarRef = useRef(false);

  // Actualizar posición del portal
  const updatePos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPortalPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
  }, []);

  const setMostrarSync = (val) => {
    mostrarRef.current = val;
    setMostrar(val);
  };

  useEffect(() => {
    if (mostrar) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    }
  }, [mostrar, updatePos]);

  // Debounce + búsqueda
  useEffect(() => {
    if (query.length < 4) {
      setResultados([]);
      setMostrarSync(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setBuscando(true);
      const res = await reportesService.buscarProductos(
        query,
        codigoSucursal,
        controller.signal,
      );
      setBuscando(false);
      setResultados(res);
      setMostrarSync(res.length > 0);
      setSelectedIdx(0);
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [query, codigoSucursal]);

  // Teclado
  const handleKeyDown = (e) => {
    if (!mostrarRef.current) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((p) => Math.min(p + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (resultados[selectedIdx]) seleccionar(resultados[selectedIdx]);
    } else if (e.key === "Escape") {
      setMostrarSync(false);
    }
  };

  const seleccionar = (producto) => {
    setMostrarSync(false);
    setResultados([]);
    setQuery("");
    onSelect({
      codigoProducto: producto.codigoProducto,
      nombreProducto: producto.producto,
    });
  };

  const limpiar = () => {
    setQuery("");
    setResultados([]);
    setMostrarSync(false);
    onClear();
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        label="Producto (nombre o código)"
        size="small"
        fullWidth
        value={
          value ? `${value.codigoProducto} — ${value.nombreProducto}` : query
        }
        onChange={(e) => {
          if (value) {
            onClear();
            setQuery("");
            setResultados([]);
            setMostrarSync(false);
          } else {
            setQuery(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder="Ej: FORTICAM o INT-0388"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {buscando ? (
                <CircularProgress size={14} sx={{ color: "#CC6C06" }} />
              ) : (
                <SearchIcon sx={{ fontSize: 18, color: "#CC6C06" }} />
              )}
            </InputAdornment>
          ),
          endAdornment:
            value || query ? (
              <InputAdornment position="end">
                <ClearIcon
                  sx={{
                    fontSize: 16,
                    cursor: "pointer",
                    color: "text.secondary",
                  }}
                  onClick={limpiar}
                />
              </InputAdornment>
            ) : null,
        }}
      />

      {mostrar && portalPos && (
        <ClickAwayListener onClickAway={() => setMostrar(false)}>
          <Portal>
            <Paper
              elevation={12}
              sx={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                width: Math.max(portalPos.width, 520),
                maxHeight: 320,
                overflowY: "auto",
                zIndex: 10000,
                border: "2px solid #CC6C06",
                borderRadius: 1.5,
              }}
            >
              {resultados.map((p, i) => (
                <Box
                  key={p.producto_ID}
                  onClick={() => seleccionar(p)}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    bgcolor: i === selectedIdx ? "#CC6C0618" : "white",
                    borderBottom:
                      i < resultados.length - 1 ? "1px solid #f0f0f0" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    "&:hover": { bgcolor: "#CC6C0612" },
                  }}
                >
                  <Chip
                    label={p.codigoProducto}
                    size="small"
                    sx={{
                      bgcolor: "#CC6C06",
                      color: "white",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: "0.82rem" }}
                    >
                      {p.producto}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                    >
                      {p.presentacion} | {p.linea} | {p.laboratorio}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Stock: ${p.stockProducto}`}
                    size="small"
                    sx={{
                      bgcolor: p.stockProducto > 0 ? "#43a047" : "#e53935",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  />
                  <Chip
                    label={`Bs ${p.precioUnitario?.toFixed(2)}`}
                    size="small"
                    sx={{
                      bgcolor: "#05305A",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Portal>
        </ClickAwayListener>
      )}
    </Box>
  );
}
