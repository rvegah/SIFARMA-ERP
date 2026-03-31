// src/modules/products/components/EditProductForm.jsx
// Formulario de edición de producto - carga datos desde API y actualiza

import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  Save,
  Edit as EditIcon,
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
  Layers
} from "@mui/icons-material";
import { useProductContext } from "../context/ProductContext";
import { farmaColors } from "/src/app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import productService from "../../../services/api/productService";



const EditProductForm = ({ onCancel }) => {
  const {
    productForm,
    setProductForm,
    selectedProduct,
    loading,
    setSelectedProduct,
    handleUpdateProduct,
    catalogs,
    setCatalogs,
  } = useProductContext();

  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Al montar, cargar los datos completos del producto via API
  useEffect(() => {
    const codigoProducto = selectedProduct?.codigoProducto || selectedProduct?.codigo;
    if (!codigoProducto) return;

    const fetchDetail = async () => {
      setFetchingDetail(true);
      setFetchError(null);
      try {
        const res = await productService.getProductoParaEditar(codigoProducto);
        if (res.exitoso && res.datos) {
          const d = res.datos;
          setProductForm({
            nombre: d.producto || "",
            principioActivo: d.principioActivo || "",
            nombreGenerico: d.nombreGenerico || "",
            nombreComercial: d.nombreComercial || "",
            tipoFormaFarmaceutica: d.tipoFormaFarmaceutica_ID ?? "",
            formaFarmaceuticaTexto: d.formaFarmaceutica || "",
            concentracion: d.concentracion || "",
            presentacionTexto: d.presentacion || "",
            unidadMedida: d.unidadMedida_ID ?? "",
            dosis: d.dosis || "",
            viaAdministracion: d.viaAdministracion || "",
            accionTerapeutica: d.accionTerapeutica || "",
            linea: d.linea_ID ?? "",
            laboratorio: d.laboratorio_ID ?? "",
            industria: d.industria_ID ?? "",
            esProductoMedicamento: d.esMedicamento,
          });

          // Actualizar selectedProduct con el codigoProducto canónico
          setSelectedProduct(prev => ({ ...prev, codigoProducto: d.codigoProducto || codigoProducto }));

          // Cargar laboratorios según la línea del producto
          if (d.linea_ID) {
            const labs = await productService.getLaboratorios(d.linea_ID);
            setCatalogs(prev => ({ ...prev, laboratorios: labs }));
          }
        } else {
          setFetchError(res.mensaje || "No se pudo cargar el producto.");
        }
      } catch (err) {
        setFetchError("Error al cargar los datos del producto.");
        console.error(err);
      } finally {
        setFetchingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedProduct?.codigoProducto, selectedProduct?.codigo]);

  // Cambio de línea → recargar laboratorios
  useEffect(() => {
    if (!fetchingDetail && productForm.linea) {
      productService.getLaboratorios(productForm.linea).then(labs => {
        setCatalogs(prev => ({ ...prev, laboratorios: labs }));
      });
    }
  }, [productForm.linea]);

  const handleSave = async () => {
    const success = await handleUpdateProduct();
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

  if (!selectedProduct) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="text.secondary">Seleccione un producto para editar.</Typography>
        <Button onClick={onCancel} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Editar Producto"
        subtitle={`Modificación de atributos y especificaciones técnicas del producto: ${selectedProduct?.codigoProducto || selectedProduct?.codigo || ""}`}
        icon={<EditIcon fontSize="large" />}
      />

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>{fetchError}</Alert>
      )}

      {fetchingDetail ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2, mt: 0.5 }}>Cargando datos del producto...</Typography>
        </Box>
      ) : (
        <Card sx={{ p: 4, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Grid container spacing={3}>

            {/* === SECCIÓN 1: Identificación === */}
            <Grid item xs={12}>
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
              <TextField
                fullWidth
                required
                label="Principio Activo"
                value={productForm.principioActivo || ""}
                onChange={handleChange("principioActivo")}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                InputProps={{
                  startAdornment: <Description sx={{ color: "action.active", mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={productForm.esProductoMedicamento === true ? "true" : productForm.esProductoMedicamento === false ? "false" : ""}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel value="true" control={<Radio color="primary" />} label="Medicamento" disabled={loading} />
                  <FormControlLabel value="false" control={<Radio color="primary" />} label="Bebida no Alcohólica" disabled={loading} />
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
                disabled={loading}
                InputProps={{
                  startAdornment: <FormatListBulleted sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                InputProps={{
                  startAdornment: <Scale sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                InputProps={{
                  startAdornment: <List sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
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
                disabled={loading || !productForm.linea || catalogs?.laboratorios?.length === 0}
                InputProps={{
                  startAdornment: <Science sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
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
                disabled={loading}
                InputProps={{
                  startAdornment: <Public sx={{ color: "action.active", mr: 1 }} />
                }}
              >
                <MenuItem value="">Seleccione...</MenuItem>
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
                  startIcon={<EditIcon />} 
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    background: farmaColors.gradients.primary,
                    fontWeight: 700,
                    "&:hover": { background: farmaColors.gradients.primary },
                    boxShadow: "0 4px 12px rgba(204, 108, 6, 0.2)"
                  }}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}
    </Container>
  );
};

export default EditProductForm;
