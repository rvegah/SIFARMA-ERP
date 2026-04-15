// src/modules/purchases/components/PurchaseItemsTable.jsx
// Tabla inline de productos para compras — columnas en orden de interfaz antigua
// Nro | Código | Producto | Vencimiento | Stock | C/U | P/U | P/C | Cantidad | Total | Acción

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  List,
  ListItem,
  ClickAwayListener,
  InputAdornment,
  Portal,
  CircularProgress,
} from "@mui/material";
import {
  Delete,
  Check,
  Close,
  Search,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { CodigoProductoChip } from "../../../shared/components/ProductoStockPopup";

const PurchaseItemsTable = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onSearchProducts,
  searchResults,
  isSearching,
  searchQuery,
  setSearchQuery,
  isFinished = false,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [portalPosition, setPortalPosition] = useState(null);
  const suggestionsListRef = useRef(null);
  const itemRefs = useRef([]);
  const cantidadInputRef = useRef(null);
  const lastRowRef = useRef(null);
  const previousItemsLength = useRef(items.length);
  const shouldAutoEdit = useRef(false);

  // Auto-enfocar cantidad al agregar un ítem
  useEffect(() => {
    if (items.length > previousItemsLength.current && shouldAutoEdit.current) {
      const lastItem = items[items.length - 1];
      if (lastItem) {
        setEditingId(lastItem._id);
        setEditValues({
          cantidad: lastItem.cantidad,
          costoUnitario: lastItem.costoUnitario,
          precioUnitario: lastItem.precioUnitario,
          precioCaja: lastItem.precioCaja,
          numeroLote: lastItem.numeroLote,
          fechaVencimiento: lastItem.fechaVencimiento,
        });
      }
      shouldAutoEdit.current = false;
    }
    previousItemsLength.current = items.length;
  }, [items]);

  // Auto-foco en cantidad cuando entra modo edición
  useEffect(() => {
    if (editingId && cantidadInputRef.current) {
      setTimeout(() => {
        cantidadInputRef.current?.focus();
        cantidadInputRef.current?.select();
      }, 50);
    }
  }, [editingId]);

  // Devolver foco al buscador cuando sale de edición
  useEffect(() => {
    if (!editingId && searchInputRef.current && !isFinished) {
      searchInputRef.current.focus();
    }
  }, [editingId, isFinished]);

  // Scroll al último ítem agregado
  useEffect(() => {
    if (items.length > previousItemsLength.current) {
      setTimeout(() => {
        lastRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [items]);

  // Debounce de búsqueda
  useEffect(() => {
    if (searchQuery.length < 3) {
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await onSearchProducts(searchQuery);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } catch (error) {
        if (error?.name !== "AbortError" && error?.code !== "ERR_CANCELED") {
          console.error("Error en búsqueda:", error);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchProducts]);

  // Posición del portal
  useEffect(() => {
    const updatePosition = () => {
      if (showSuggestions && anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        setPortalPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showSuggestions) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setPortalPosition(null);
    }
  }, [showSuggestions, anchorEl]);

  // Scroll de sugerencias al ítem seleccionado
  useEffect(() => {
    if (showSuggestions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex, showSuggestions]);

  // Teclado en el buscador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== searchInputRef.current) return;
      if (!showSuggestions || searchResults.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
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
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          );
          break;
        default:
          break;
      }
    };

    if (showSuggestions) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSuggestions, searchResults, selectedIndex]);

  // Teclado en edición de fila
  useEffect(() => {
    const handleEditKeyPress = (e) => {
      if (!editingId) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveEdit(editingId);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelEdit();
      }
    };
    if (editingId) {
      window.addEventListener("keydown", handleEditKeyPress);
      return () => window.removeEventListener("keydown", handleEditKeyPress);
    }
  }, [editingId, editValues]);

  const handleSelectProduct = (product) => {
    shouldAutoEdit.current = true;
    const added = onAddItem(product);
    if (added !== false) {
      setSearchQuery("");
      setShowSuggestions(false);
      setSelectedIndex(0);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      cantidad: item.cantidad,
      costoUnitario: item.costoUnitario,
      precioUnitario: item.precioUnitario,
      precioCaja: item.precioCaja,
      numeroLote: item.numeroLote,
      fechaVencimiento: item.fechaVencimiento,
    });
  };

  const handleSaveEdit = useCallback(
    (id) => {
      // Guardar todos los campos editados
      const fields = [
        "cantidad",
        "costoUnitario",
        "precioUnitario",
        "precioCaja",
        "numeroLote",
        "fechaVencimiento",
      ];
      fields.forEach((field) => {
        const numericFields = [
          "cantidad",
          "costoUnitario",
          "precioUnitario",
          "precioCaja",
        ];
        const val = numericFields.includes(field)
          ? editValues[field] === ""
            ? 0
            : Number(editValues[field])
          : editValues[field];
        onUpdateItem(id, field, val);
      });
      setEditingId(null);
      setEditValues({});
    },
    [editValues, onUpdateItem],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValues({});
  }, []);

  // P/C — Precio Caja manual. Si no se ingresa, se envía 0
  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Columnas en orden de interfaz antigua
  const columns = [
    { label: "Nro", width: "4%", align: "center" },
    { label: "Código", width: "8%", align: "center" },
    { label: "Producto", width: "22%", align: "left" },
    { label: "Vencimiento", width: "9%", align: "center" },
    { label: "Stock", width: "6%", align: "center" },
    { label: "C/U", width: "8%", align: "center" },
    { label: "P/U", width: "8%", align: "center" },
    { label: "P/C", width: "8%", align: "center" },
    { label: "Cantidad", width: "7%", align: "center" },
    { label: "Total", width: "9%", align: "right" },
    { label: "Opciones", width: "7%", align: "center" },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
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
        <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
          DETALLE COMPRAS
        </Typography>
        <Chip
          label={`${items.length} ítem${items.length !== 1 ? "s" : ""}`}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "0 0 8px 8px",
          border: `2px solid ${farmaColors.secondary}`,
          overflow: "visible",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.label}
                  align={col.align}
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    bgcolor: "#2c2c2c",
                    width: col.width,
                    py: 1,
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* FILA DE BÚSQUEDA */}
            {!isFinished && (
              <TableRow
                sx={{
                  position: "sticky",
                  top: 56,
                  zIndex: 1100,
                  bgcolor: "white",
                }}
              >
                <TableCell
                  colSpan={11}
                  sx={{
                    p: 1,
                    borderBottom: `2px solid ${farmaColors.primary}`,
                    bgcolor: "white",
                  }}
                >
                  <TextField
                    fullWidth
                    inputRef={(ref) => {
                      searchInputRef.current = ref;
                      setAnchorEl(ref);
                    }}
                    placeholder="Escriba para buscar producto... (↑↓ navegar, Enter seleccionar, Esc cerrar)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {isSearching ? (
                            <CircularProgress
                              size={18}
                              sx={{ color: farmaColors.primary }}
                            />
                          ) : (
                            <Search sx={{ color: farmaColors.primary }} />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        fontSize: "0.9rem",
                        "& fieldset": {
                          borderColor:
                            farmaColors.alpha?.primary30 ||
                            "rgba(204,108,6,0.3)",
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

            {/* FILAS DE ÍTEMS */}
            {items.map((item, index) => {
              const isEditing = editingId === item._id;
              const total =
                (Number(item.cantidad) || 0) *
                (Number(item.costoUnitario) || 0);

              return (
                <TableRow
                  key={item._id}
                  ref={index === items.length - 1 ? lastRowRef : null}
                  hover
                  sx={{
                    bgcolor: index % 2 === 0 ? "white" : "#fafafa",
                    "&:hover": {
                      bgcolor:
                        farmaColors.alpha?.primary10 || "rgba(204,108,6,0.05)",
                    },
                  }}
                >
                  {/* NRO */}
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: "text.secondary",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>

                  {/* CÓDIGO */}
                  <TableCell align="center">
                    <CodigoProductoChip codigo={item.codigoProducto} />
                  </TableCell>

                  {/* PRODUCTO */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        color: farmaColors.secondary,
                      }}
                    >
                      {item.nombreProducto}
                    </Typography>
                    {item.presentacion && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.68rem" }}
                      >
                        {item.presentacion}
                      </Typography>
                    )}
                    {item.laboratorio && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.68rem" }}
                      >
                        {item.laboratorio}
                      </Typography>
                    )}
                    {/* Lote en modo no-edición, debajo del nombre */}
                    {!isEditing && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "0.68rem",
                          color: "text.secondary",
                        }}
                      >
                        Lote: {item.numeroLote || "S/N"}
                      </Typography>
                    )}
                    {/* Lote editable inline */}
                    {isEditing && (
                      <TextField
                        size="small"
                        label="Lote"
                        value={editValues.numeroLote ?? ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            numeroLote: e.target.value,
                          }))
                        }
                        sx={{ mt: 0.5, width: 100 }}
                        inputProps={{ style: { fontSize: "0.75rem" } }}
                      />
                    )}
                  </TableCell>

                  {/* VENCIMIENTO */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="date"
                        size="small"
                        value={editValues.fechaVencimiento ?? ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            fechaVencimiento: e.target.value,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 130 }}
                        inputProps={{ style: { fontSize: "0.78rem" } }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "error.main",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                        }}
                      >
                        {item.fechaVencimiento || "-"}
                      </Typography>
                    )}
                  </TableCell>

                  {/* STOCK */}
                  <TableCell align="center">
                    <Chip
                      label={item.stockProducto ?? 0}
                      size="small"
                      sx={{
                        bgcolor:
                          (item.stockProducto ?? 0) > 0 ? "#4CAF50" : "#f44336",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        height: 22,
                        minWidth: 40,
                      }}
                    />
                  </TableCell>

                  {/* C/U — Costo Unitario */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.costoUnitario ?? 0}
                        onChange={(e) =>
                          handleEditChange("costoUnitario", e.target.value)
                        }
                        inputRef={cantidadInputRef}
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          style: { fontSize: "0.78rem", textAlign: "center" },
                        }}
                        sx={{ width: 75 }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", fontWeight: 600 }}
                      >
                        {Number(item.costoUnitario).toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* P/U — Precio Unitario */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.precioUnitario ?? 0}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            precioUnitario: e.target.value,
                          }))
                        }
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          style: { fontSize: "0.78rem", textAlign: "center" },
                        }}
                        sx={{ width: 75 }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                        {Number(item.precioUnitario).toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* P/C — Precio Caja (auto = C/U × Cantidad, editable) */}
                  <TableCell align="center">
                    {isEditing ? (
                      <Tooltip
                        title="Valor manual. Si no se ingresa, se enviará 0."
                        placement="top"
                      >
                        <TextField
                          type="number"
                          size="small"
                          value={editValues.precioCaja ?? 0}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              precioCaja: e.target.value,
                            }))
                          }
                          inputProps={{
                            min: 0,
                            step: 0.01,
                            style: { fontSize: "0.78rem", textAlign: "center" },
                          }}
                          sx={{
                            width: 80,
                            "& .MuiOutlinedInput-root fieldset": {
                              borderColor: farmaColors.primary,
                              borderWidth: 2,
                            },
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                        {Number(item.precioCaja).toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* CANTIDAD */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.cantidad ?? 1}
                        onChange={(e) =>
                          handleEditChange("cantidad", e.target.value)
                        }
                        inputProps={{
                          min: 1,
                          step: 1,
                          style: { fontSize: "0.78rem", textAlign: "center" },
                        }}
                        sx={{ width: 65 }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                      >
                        {item.cantidad}
                      </Typography>
                    )}
                  </TableCell>

                  {/* TOTAL = C/U × Cantidad */}
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: farmaColors.primary,
                        fontSize: "0.88rem",
                      }}
                    >
                      {total.toFixed(2)}
                    </Typography>
                  </TableCell>

                  {/* OPCIONES */}
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Tooltip title="Guardar (Enter)">
                            <IconButton
                              size="small"
                              onClick={() => handleSaveEdit(item._id)}
                              sx={{
                                bgcolor: "#4CAF50",
                                color: "white",
                                width: 26,
                                height: 26,
                                "&:hover": { bgcolor: "#388e3c" },
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar (Esc)">
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              sx={{
                                bgcolor: "#f44336",
                                color: "white",
                                width: 26,
                                height: 26,
                                "&:hover": { bgcolor: "#d32f2f" },
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        !isFinished && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(item)}
                                sx={{
                                  bgcolor: "#4CAF50",
                                  color: "white",
                                  width: 26,
                                  height: 26,
                                  "&:hover": { bgcolor: "#388e3c" },
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                >
                                  A
                                </Typography>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => onRemoveItem(item._id)}
                                sx={{
                                  bgcolor: "#f44336",
                                  color: "white",
                                  width: 26,
                                  height: 26,
                                  "&:hover": { bgcolor: "#d32f2f" },
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                >
                                  E
                                </Typography>
                              </IconButton>
                            </Tooltip>
                          </>
                        )
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Estado vacío */}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} sx={{ textAlign: "center", py: 6 }}>
                  <InventoryIcon
                    sx={{
                      fontSize: 40,
                      color: "text.disabled",
                      mb: 1,
                      opacity: 0.4,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Use el buscador para agregar productos a la compra.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PORTAL DE SUGERENCIAS */}
      {showSuggestions && searchResults.length > 0 && portalPosition && (
        <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
          <Portal>
            <Paper
              ref={suggestionsListRef}
              elevation={12}
              sx={{
                position: "fixed",
                top: portalPosition.top,
                left: portalPosition.left,
                width: "auto",
                maxWidth: "calc(100vw - 80px)",
                minWidth: 900,
                maxHeight: 360,
                overflow: "auto",
                border: `4px solid ${farmaColors.primary}`,
                borderRadius: 2,
                bgcolor: "white",
                zIndex: 10000,
                boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
                "&::-webkit-scrollbar": { width: "12px" },
                "&::-webkit-scrollbar-track": {
                  background: "#f0f0f0",
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: farmaColors.primary,
                  borderRadius: "8px",
                  border: "3px solid #f0f0f0",
                },
              }}
            >
              <List sx={{ p: 0 }}>
                {searchResults.map((product, index) => (
                  <ListItem
                    key={`${product.producto_ID}-${product.numeroLote}-${index}`}
                    ref={(el) => (itemRefs.current[index] = el)}
                    sx={{
                      borderBottom:
                        index < searchResults.length - 1
                          ? `1px solid ${farmaColors.alpha?.secondary10 || "rgba(5,48,90,0.1)"}`
                          : "none",
                      bgcolor:
                        index === selectedIndex
                          ? farmaColors.alpha?.primary30 ||
                            "rgba(204,108,6,0.15)"
                          : "white",
                      cursor: "default",
                      py: 1.2,
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <CodigoProductoChip codigo={product.codigoProducto} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.84rem",
                            color: "#1a1a1a",
                          }}
                        >
                          {product.producto}
                          {product.presentacion && ` | ${product.presentacion}`}
                          {product.laboratorio && ` | ${product.laboratorio}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                        >
                          Lote: {product.numeroLote || "S/N"} | Vence:{" "}
                          {product.fechaVencimiento
                            ? product.fechaVencimiento.split("T")[0]
                            : "---"}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Stock: ${product.stockProducto ?? 0}`}
                        size="small"
                        sx={{
                          bgcolor:
                            (product.stockProducto ?? 0) > 0
                              ? "#4CAF50"
                              : "#f44336",
                          color: "white",
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          minWidth: 80,
                          flexShrink: 0,
                        }}
                      />
                      <Chip
                        label={`C/U: ${Number(product.costoUnitario || 0).toFixed(2)}`}
                        size="small"
                        sx={{
                          bgcolor: "#FF9800",
                          color: "white",
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          minWidth: 80,
                          flexShrink: 0,
                        }}
                      />
                      <Chip
                        label={`P/U: ${Number(product.precioUnitario || 0).toFixed(2)}`}
                        size="small"
                        sx={{
                          bgcolor: farmaColors.secondary,
                          color: "white",
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          minWidth: 80,
                          flexShrink: 0,
                        }}
                      />
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
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          minWidth: 80,
                          flexShrink: 0,
                          cursor: "pointer",
                          "&:hover": { bgcolor: farmaColors.secondary },
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Portal>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default PurchaseItemsTable;
