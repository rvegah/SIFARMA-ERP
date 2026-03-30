// src/modules/products/components/CreateProductForm.jsx
// Formulario de alta de producto - campos completos con validación

import productService from "../../../services/api/productService";

import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Card,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Save, AddBox } from "@mui/icons-material";
import { useProductContext } from "../context/ProductContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";

const LabelField = ({ children, required }) => (
  <Typography variant="body2" sx={{ color: farmaColors.primary, mb: 1, fontWeight: 600 }}>
    {children} {required && <span style={{ color: "red" }}>*</span>}
  </Typography>
);

const CreateProductForm = ({ onCancel }) => {
  const {
    productForm,
    productFormChange,
    setProductForm,
    loading,
    clearForm,
    setSelectedProduct,
    handleCreateProduct,
    catalogs,
    setCatalogs,
  } = useProductContext();

  useEffect(() => {
    clearForm();
    setSelectedProduct(null);
  }, []);

  // Efecto para cargar laboratorios cuando cambia la línea
  useEffect(() => {
    if (productForm.linea) {
      productService.getLaboratorios(productForm.linea).then(labs => {
        setCatalogs(prev => ({ ...prev, laboratorios: labs }));
      });
    } else {
      setCatalogs(prev => ({ ...prev, laboratorios: [] }));
    }
  }, [productForm.linea]);

  const handleSave = async () => {
    const success = await handleCreateProduct();
    if (success && onCancel) onCancel();
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRadioChange = (event) => {
    setProductForm(prev => ({
      ...prev,
      esProductoMedicamento: event.target.value === "true",
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Registrar Producto"
        // subtitle="Formulario de alta para nuevos productos e insumos de farmacia."
        icon={<AddBox />}
      />

      <Card sx={{ p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Grid container spacing={3}>

          {/* === SECCIÓN 1: Identificación === */}
          <Grid item xs={12}>
            {/* <Typography variant="subtitle1" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}>
              Identificación del Producto
            </Typography> */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: farmaColors.secondary }}>
                  Identificación del Producto
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Principio Activo</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Ibuprofeno"
              value={productForm.principioActivo || ""}
              onChange={handleChange("principioActivo")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelField required>Nombre Genérico</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Ibuprofeno 400mg"
              value={productForm.nombreGenerico || ""}
              onChange={handleChange("nombreGenerico")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelField required>Nombre Comercial</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Advil"
              value={productForm.nombreComercial || ""}
              onChange={handleChange("nombreComercial")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LabelField required>Nombre del Producto</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Paracetamol 500mg"
              value={productForm.nombre || ""}
              onChange={handleChange("nombre")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          {/* Radio: Tipo de producto */}
          <Grid item xs={12} md={6}>
            <FormControl>
              <FormLabel sx={{ color: farmaColors.primary, fontWeight: 600, mb: 1 }}>
                Tipo de Producto <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <RadioGroup
                row
                value={productForm.esProductoMedicamento === true ? "true" : productForm.esProductoMedicamento === false ? "false" : ""}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="true" control={<Radio color="primary" />} label="Medicamento" />
                <FormControlLabel value="false" control={<Radio color="primary" />} label="Bebida no Alcohólica" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* === SECCIÓN 2: Características Farmacéuticas === */}
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}>
              Características Farmacéuticas
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Tipo Forma Farmacéutica</LabelField>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={productForm.tipoFormaFarmaceutica || ""}
                onChange={handleChange("tipoFormaFarmaceutica")}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>Seleccione...</MenuItem>
                {catalogs?.formasFarmaceuticas?.map(i => (
                  <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField>Forma Farmacéutica</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Comprimido recubierto"
              value={productForm.formaFarmaceuticaTexto || ""}
              onChange={handleChange("formaFarmaceuticaTexto")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField>Concentración</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: 500mg/5ml"
              value={productForm.concentracion || ""}
              onChange={handleChange("concentracion")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField>Presentación</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Caja x 20 tabletas"
              value={productForm.presentacionTexto || ""}
              onChange={handleChange("presentacionTexto")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Unidad de Medida</LabelField>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={productForm.unidadMedida || ""}
                onChange={handleChange("unidadMedida")}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>Seleccione...</MenuItem>
                {catalogs?.unidadesMedida?.map(i => (
                  <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField>Dosis</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: 500mg c/8h"
              value={productForm.dosis || ""}
              onChange={handleChange("dosis")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LabelField>Vía de Administración</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Oral, Tópica"
              value={productForm.viaAdministracion || ""}
              onChange={handleChange("viaAdministracion")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LabelField>Acción Terapéutica</LabelField>
            <TextField
              fullWidth
              placeholder="Ej: Analgésico, Antipirético"
              value={productForm.accionTerapeutica || ""}
              onChange={handleChange("accionTerapeutica")}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          {/* === SECCIÓN 3: Clasificación === */}
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}>
              Clasificación
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Línea</LabelField>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={productForm.linea || ""}
                onChange={handleChange("linea")}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>Seleccione...</MenuItem>
                {catalogs?.lineas?.map(i => (
                  <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Laboratorio</LabelField>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={productForm.laboratorio || ""}
                onChange={handleChange("laboratorio")}
                disabled={!productForm.linea || catalogs?.laboratorios?.length === 0}
                sx={{ bgcolor: productForm.linea ? "white" : "#f0f0f0" }}
              >
                <MenuItem value="" disabled>
                  {!productForm.linea ? "Seleccione Línea primero" : "Seleccione..."}
                </MenuItem>
                {catalogs?.laboratorios?.map(i => (
                  <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LabelField required>Industria (País)</LabelField>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={productForm.industria || ""}
                onChange={handleChange("industria")}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>Seleccione...</MenuItem>
                {catalogs?.industrias?.map(i => (
                  <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botones */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
              <Button variant="outlined" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  background: farmaColors.gradients.primary,
                  "&:hover": { background: farmaColors.gradients.primary },
                }}
              >
                Guardar Producto
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default CreateProductForm;
