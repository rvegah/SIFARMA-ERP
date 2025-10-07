// src/modules/sales/components/SaleItemsTable.jsx
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
} from "@mui/material";
import { Delete, Warning, Check, Close, Search } from "@mui/icons-material";
import { farmaColors } from "../../../app/theme";
import { UNITS_OF_MEASURE } from "../constants/salesConstants";

const SaleItemsTable = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onSearchProducts,
  searchResults,
  isSearching,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Estados para la búsqueda integrada
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Refs para la lista de sugerencias
  const suggestionsListRef = useRef(null);
  const itemRefs = useRef([]);

  // Estado para la posición del portal
  const [portalPosition, setPortalPosition] = useState(null);

  // Ref para el campo de cantidad en modo edición
  const cantidadInputRef = useRef(null);
  
  // Tracking para auto-edición
  const previousItemsLength = useRef(items.length);
  const shouldAutoEditNext = useRef(false);

  // Detectar cuando se agrega un nuevo item
  useEffect(() => {
    if (items.length > previousItemsLength.current && shouldAutoEditNext.current) {
      const lastItem = items[items.length - 1];
      
      if (lastItem) {
        setEditingItem(lastItem.id);
        setEditValues({
          cantidad: lastItem.cantidad,
          precio: lastItem.precio,
          descuento: lastItem.descuento,
          unidadMedida: lastItem.unidadMedida,
        });
      }
      
      shouldAutoEditNext.current = false;
    }
    
    previousItemsLength.current = items.length;
  }, [items]);

  // Auto-focus en cantidad cuando entra en modo edición
  useEffect(() => {
    if (editingItem && cantidadInputRef.current) {
      setTimeout(() => {
        cantidadInputRef.current?.focus();
        cantidadInputRef.current?.select();
      }, 50);
    }
  }, [editingItem]);

  // Auto-focus en el campo de búsqueda cuando termina la edición
  useEffect(() => {
    if (!editingItem && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [editingItem]);

  // Buscar productos mientras escribe
  useEffect(() => {
    if (searchQuery.length >= 2) {
      onSearchProducts(searchQuery);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, onSearchProducts]);

  // Auto-scroll al item seleccionado
  useEffect(() => {
    if (showSuggestions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex, showSuggestions]);

  // Actualizar posición del portal dinámicamente
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

      const tableContainer = document.querySelector(
        '[class*="MuiTableContainer"]'
      );
      if (tableContainer) {
        tableContainer.addEventListener("scroll", updatePosition);
      }
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        if (tableContainer) {
          tableContainer.removeEventListener("scroll", updatePosition);
        }
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setPortalPosition(null);
    }
  }, [showSuggestions, anchorEl]);

  // Navegación con teclado en las sugerencias
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case "Enter":
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelectProduct(searchResults[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          setSearchQuery("");
          break;

        case "Tab":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
      }
    };

    if (showSuggestions) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSuggestions, searchResults, selectedIndex]);

  const handleSelectProduct = (product) => {
    if (product.stock === 0) {
      console.warn("Producto sin stock");
    }
    
    // Activar bandera ANTES de agregar
    shouldAutoEditNext.current = true;
    
    // Agregar producto
    onAddItem(product);
    
    // Limpiar búsqueda
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIndex(0);
  };

  const handleStartEdit = (item) => {
    setEditingItem(item.id);
    setEditValues({
      cantidad: item.cantidad,
      precio: item.precio,
      descuento: item.descuento,
      unidadMedida: item.unidadMedida,
    });
  };

  const handleSaveEdit = useCallback((itemId) => {
    Object.keys(editValues).forEach((field) => {
      if (field === "unidadMedida") {
        onUpdateItem(itemId, field, editValues[field]);
      } else {
        onUpdateItem(itemId, field, parseFloat(editValues[field]) || 0);
      }
    });
    setEditingItem(null);
    setEditValues({});
  }, [editValues, onUpdateItem]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setEditValues({});
  }, []);

  // Atajos de teclado en modo edición
  useEffect(() => {
    const handleEditKeyPress = (e) => {
      if (!editingItem) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveEdit(editingItem);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelEdit();
      }
    };

    if (editingItem) {
      window.addEventListener("keydown", handleEditKeyPress);
      return () => window.removeEventListener("keydown", handleEditKeyPress);
    }
  }, [editingItem, handleSaveEdit, handleCancelEdit]);

  // Atajos de teclado globales (A y E)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (editingItem) return;
      
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      const key = e.key.toLowerCase();

      if (key === "a" && items.length > 0 && !editingItem) {
        const lastItem = items[items.length - 1];
        handleStartEdit(lastItem);
        e.preventDefault();
      }

      if (key === "e" && items.length > 0 && !editingItem) {
        const lastItem = items[items.length - 1];
        onRemoveItem(lastItem.id);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [items, editingItem, onRemoveItem]);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Barra de título */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${farmaColors.secondaryDark} 0%, ${farmaColors.secondary} 100%)`,
          px: 2,
          py: 1.5,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
          Detalle Ventas
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Lector de Código de Barras
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "0 0 8px 8px",
          border: `2px solid ${farmaColors.secondary}`,
          maxHeight: 400,
          overflow: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "#2c2c2c" }}>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "30%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Producto
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Uni. De Medida
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "8%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Stock
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                P/U
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                P/C
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Desc. en Línea
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "8%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Cantidad
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Total
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  width: "10%",
                  bgcolor: "#2c2c2c",
                }}
              >
                Opciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* FILA DE BÚSQUEDA - STICKY */}
            <TableRow
              sx={{
                bgcolor: "white",
                position: "sticky",
                top: 37,
                zIndex: 100,
              }}
            >
              <TableCell
                colSpan={3}
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
                  placeholder="Escriba para buscar producto... (↑↓ para navegar, Enter para seleccionar)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: farmaColors.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      fontSize: "0.9rem",
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
              <TableCell
                colSpan={6}
                sx={{
                  bgcolor: "#f5f5f5",
                  borderBottom: `2px solid ${farmaColors.primary}`,
                }}
              />
            </TableRow>

            {/* Productos agregados */}
            {items.map((item) => {
              const isEditing = editingItem === item.id;
              const stockWarning = item.cantidad > item.stock;

              return (
                <TableRow
                  key={item.id}
                  sx={{
                    "&:hover": { bgcolor: farmaColors.alpha.primary10 },
                    bgcolor: stockWarning ? "rgba(244, 67, 54, 0.05)" : "white",
                  }}
                >
                  {/* Producto */}
                  <TableCell>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        {stockWarning && (
                          <Tooltip title="Stock insuficiente">
                            <Warning color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                      >
                        {item.nombre}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        (Código: {item.codigo})(Línea: {item.linea}
                        )(Laboratorio: {item.linea})
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.7rem" }}
                      >
                        (Presentación: {item.presentacion})
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Unidad de Medida */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        select
                        size="small"
                        value={editValues.unidadMedida || item.unidadMedida}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            unidadMedida: e.target.value,
                          })
                        }
                        SelectProps={{ native: true }}
                        sx={{ width: 120, fontSize: "0.75rem" }}
                      >
                        {UNITS_OF_MEASURE.map((unit) => (
                          <option key={unit.id} value={unit.name}>
                            {unit.code} - {unit.name}
                          </option>
                        ))}
                      </TextField>
                    ) : (
                      <Chip
                        label={item.unidadMedida}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 22 }}
                      />
                    )}
                  </TableCell>

                  {/* Stock */}
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: stockWarning ? "error.main" : "success.main",
                      }}
                    >
                      {item.stock}
                    </Typography>
                  </TableCell>

                  {/* P/U */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.precio}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            precio: e.target.value,
                          })
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: 80 }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {item.precio.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* P/C */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                      0
                    </Typography>
                  </TableCell>

                  {/* Descuento */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.descuento}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            descuento: e.target.value,
                          })
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: 80 }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {item.descuento.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Cantidad - CON REF PARA AUTO-FOCUS */}
                  <TableCell align="center">
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editValues.cantidad}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            cantidad: e.target.value,
                          })
                        }
                        inputProps={{ min: 1, step: 1 }}
                        inputRef={cantidadInputRef}
                        sx={{ width: 60 }}
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

                  {/* Total */}
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: farmaColors.primary,
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.subtotal.toFixed(2)}
                    </Typography>
                  </TableCell>

                  {/* Opciones */}
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
                          <IconButton
                            size="small"
                            onClick={() => handleSaveEdit(item.id)}
                            sx={{
                              bgcolor: "#4CAF50",
                              color: "white",
                              width: 28,
                              height: 28,
                              "&:hover": { bgcolor: "#388e3c" },
                            }}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            sx={{
                              bgcolor: "#f44336",
                              color: "white",
                              width: 28,
                              height: 28,
                              "&:hover": { bgcolor: "#d32f2f" },
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Actualizar (A)">
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(item)}
                              sx={{
                                bgcolor: "#4CAF50",
                                color: "white",
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: "#388e3c" },
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                              >
                                A
                              </Typography>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar (E)">
                            <IconButton
                              size="small"
                              onClick={() => onRemoveItem(item.id)}
                              sx={{
                                bgcolor: "#f44336",
                                color: "white",
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: "#d32f2f" },
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                              >
                                E
                              </Typography>
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Mensaje si no hay productos */}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay productos agregados. Use el buscador para agregar
                    productos a la venta.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Lista de sugerencias - POSICIÓN DINÁMICA */}
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
                minWidth: 1100,
                maxHeight: 350,
                overflow: "auto",
                border: `4px solid ${farmaColors.primary}`,
                borderRadius: 2,
                bgcolor: "white",
                zIndex: 10000,
                boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
                "&::-webkit-scrollbar": {
                  width: "14px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f0f0f0",
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: farmaColors.primary,
                  borderRadius: "8px",
                  border: "3px solid #f0f0f0",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: farmaColors.primaryDark,
                },
              }}
            >
              <List sx={{ p: 0 }}>
                {searchResults.map((product, index) => (
                  <ListItem
                    key={product.id}
                    button
                    ref={(el) => (itemRefs.current[index] = el)}
                    onClick={() => handleSelectProduct(product)}
                    sx={{
                      borderBottom:
                        index < searchResults.length - 1
                          ? `2px solid ${farmaColors.alpha.secondary10}`
                          : "none",
                      bgcolor:
                        product.stock === 0
                          ? "rgba(244, 67, 54, 0.05)"
                          : index === selectedIndex
                          ? farmaColors.alpha.primary30
                          : "white",
                      "&:hover": {
                        bgcolor: farmaColors.alpha.primary20,
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      },
                      py: 1.5,
                      px: 2,
                      minHeight: 50,
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
                      <Chip
                        label={product.codigo}
                        size="medium"
                        sx={{
                          bgcolor: farmaColors.primary,
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          height: 28,
                          minWidth: 60,
                          fontFamily: "monospace",
                          flexShrink: 0,
                        }}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "#1a1a1a",
                          flex: 1,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {product.nombre} | {product.presentacion} |{" "}
                        {product.linea} | {product.laboratorio}
                      </Typography>

                      <Chip
                        label={`Stock: ${product.stock}`}
                        size="medium"
                        sx={{
                          bgcolor: product.stock > 0 ? "#4CAF50" : "#f44336",
                          color: "white",
                          height: 28,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          minWidth: 90,
                          flexShrink: 0,
                        }}
                      />

                      <Chip
                        label={`P/U: ${product.precio.toFixed(2)}`}
                        size="medium"
                        sx={{
                          bgcolor: "#d32f2f",
                          color: "white",
                          height: 28,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          minWidth: 85,
                          flexShrink: 0,
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

export default SaleItemsTable;