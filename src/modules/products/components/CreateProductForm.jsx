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
import {
  Save,
  AddBox,
  Edit,
  Label,
  Category,
  Medication,
  Scale,
  LocalHospital,
  List,
  Science,
  Public,
  Description,
  FormatListBulleted,
  Layers,
  Cancel
} from "@mui/icons-material";
import { useProductContext } from "../context/ProductContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";



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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Registrar Producto"
        // subtitle="Formulario de alta para nuevos productos e insumos de farmacia."
        icon={<AddBox fontSize="large" />}
      />

      <Card sx={{ p: 4, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={3}>

          {/* === SECCIÓN 1: Identificación === */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: farmaColors.secondary, mb: 1 }}>
              Identificación del Producto
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Principio Activo"
              value={productForm.principioActivo || ""}
              onChange={handleChange("principioActivo")}
              InputProps={{
                startAdornment: <Medication sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Nombre Genérico"
              value={productForm.nombreGenerico || ""}
              onChange={handleChange("nombreGenerico")}
              InputProps={{
                startAdornment: <Label sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Nombre Comercial"
              value={productForm.nombreComercial || ""}
              onChange={handleChange("nombreComercial")}
              InputProps={{
                startAdornment: <Label sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre del Producto"
              value={productForm.nombre || ""}
              onChange={handleChange("nombre")}
              InputProps={{
                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          {/* Radio: Tipo de producto */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
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
            <TextField
              select
              fullWidth
              required
              label="Tipo Forma Farmacéutica"
              value={productForm.tipoFormaFarmaceutica || ""}
              onChange={handleChange("tipoFormaFarmaceutica")}
              InputProps={{
                startAdornment: <FormatListBulleted sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione...</MenuItem>
              {catalogs?.formasFarmaceuticas?.map(i => (
                <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Forma Farmacéutica"
              value={productForm.formaFarmaceuticaTexto || ""}
              onChange={handleChange("formaFarmaceuticaTexto")}
              InputProps={{
                startAdornment: <Category sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Concentración"
              value={productForm.concentracion || ""}
              onChange={handleChange("concentracion")}
              InputProps={{
                startAdornment: <Layers sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Presentación"
              value={productForm.presentacionTexto || ""}
              onChange={handleChange("presentacionTexto")}
              InputProps={{
                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Unidad de Medida"
              value={productForm.unidadMedida || ""}
              onChange={handleChange("unidadMedida")}
              InputProps={{
                startAdornment: <Scale sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione...</MenuItem>
              {catalogs?.unidadesMedida?.map(i => (
                <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Dosis"
              value={productForm.dosis || ""}
              onChange={handleChange("dosis")}
              InputProps={{
                startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vía de Administración"
              value={productForm.viaAdministracion || ""}
              onChange={handleChange("viaAdministracion")}
              InputProps={{
                startAdornment: <LocalHospital sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Acción Terapéutica"
              value={productForm.accionTerapeutica || ""}
              onChange={handleChange("accionTerapeutica")}
              InputProps={{
                startAdornment: <Medication sx={{ color: "action.active", mr: 1 }} />
              }}
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
            <TextField
              select
              fullWidth
              required
              label="Línea"
              value={productForm.linea || ""}
              onChange={handleChange("linea")}
              InputProps={{
                startAdornment: <List sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione...</MenuItem>
              {catalogs?.lineas?.map(i => (
                <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Laboratorio"
              value={productForm.laboratorio || ""}
              onChange={handleChange("laboratorio")}
              disabled={!productForm.linea || catalogs?.laboratorios?.length === 0}
              InputProps={{
                startAdornment: <Science sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione...</MenuItem>
              {catalogs?.laboratorios?.map(i => (
                <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Industria (País)"
              value={productForm.industria || ""}
              onChange={handleChange("industria")}
              InputProps={{
                startAdornment: <Public sx={{ color: "action.active", mr: 1 }} />
              }}
            >
              <MenuItem value="" disabled>Seleccione...</MenuItem>
              {catalogs?.industrias?.map(i => (
                <MenuItem key={i.id} value={i.id}>{i.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Botones */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                startIcon={<Cancel />}
                sx={{
                  borderColor: farmaColors.secondary,
                  color: farmaColors.secondary,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: farmaColors.secondaryDark,
                    bgcolor: farmaColors.alpha.secondary10,
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  background: farmaColors.gradients.primary,
                  fontWeight: 700,
                  "&:hover": { background: farmaColors.gradients.primary },
                  boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
                }}
              >
                {loading ? "Guardando..." : "Guardar Producto"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default CreateProductForm;
