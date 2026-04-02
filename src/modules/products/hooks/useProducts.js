// src/modules/products/hooks/useProducts.js
// Hook de gestión de productos - con búsqueda avanzada y catálogos

import { useState, useMemo, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { TIPOS_PRODUCTO, initialProductFormState } from "../constants/productConstants";
import productService from "../../../services/api/productService";
import userService from "../../../services/api/userService";
import { useAuth } from "../../../context/AuthContext";

export const useProducts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { codigoEmpleado } = useAuth();

  const [products, setProducts] = useState([]);

  // Filtros de búsqueda avanzada
  const [searchFilters, setSearchFilters] = useState({
    sucursalId: "",  // Obligatorio
    nombre: "",
    codigo: "",
    linea: "",       // ID de línea
    laboratorio: "", // ID de laboratorio (depende de linea)
  });

  const [productForm, setProductForm] = useState(initialProductFormState);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Catálogos para los dropdowns
  const [catalogs, setCatalogs] = useState({
    formasFarmaceuticas: [],   // Tipo Forma Farmacéutica (dropdown)
    unidadesMedida: [],        // Unidad de Medida (dropdown) - antes "presentaciones"
    lineas: [],
    industrias: [],
    laboratorios: [],          // Para el formulario (depende de productForm.linea)
    filterLaboratorios: [],    // Para el buscador (depende de searchFilters.linea)
    sucursales: [],
  });

  const initialLoaded = useRef(false);

  // Carga inicial de catálogos y sucursales
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;

    const init = async () => {
      setLoading(true);
      try {
        const [formas, unidadesMedida, lineas, industrias, sucursales] = await Promise.all([
          productService.getFormasFarmaceuticas(),
          productService.getUnidadesMedida(),
          productService.getLineas(),
          productService.getIndustrias(),
          userService.getSucursales(),
        ]);

        // Ya no seleccionar la primera sucursal por defecto
        setSearchFilters(prev => ({ ...prev, sucursalId: "" }));

        setCatalogs(prev => ({
          ...prev,
          formasFarmaceuticas: formas,
          unidadesMedida,
          lineas,
          industrias,
          sucursales,
        }));
      } catch (e) {
        console.error("Error loading catalogs", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Cargar laboratorios del formulario cuando cambia productForm.linea
  useEffect(() => {
    if (productForm.linea) {
      const loadLabs = async () => {
        const labs = await productService.getLaboratorios(productForm.linea);
        setCatalogs(prev => ({ ...prev, laboratorios: labs }));
      };
      loadLabs();
    } else {
      setCatalogs(prev => ({ ...prev, laboratorios: [] }));
    }
  }, [productForm.linea]);

  // Actualizar filtros de búsqueda. Si cambia linea -> limpiar laboratorio y recargar labs del filtro
  const updateSearchFilters = (field, value) => {
    if (field === "linea") {
      setSearchFilters(prev => ({ ...prev, linea: value, laboratorio: "" }));
      // Cargar laboratorios para el filtro
      if (value) {
        productService.getLaboratorios(value).then(labs => {
          setCatalogs(prev => ({ ...prev, filterLaboratorios: labs }));
        });
      } else {
        setCatalogs(prev => ({ ...prev, filterLaboratorios: [] }));
      }
    } else {
      setSearchFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  // Búsqueda avanzada con validaciones
  const searchProducts = async () => {
    if (!searchFilters.sucursalId) {
      enqueueSnackbar("Debe seleccionar una Sucursal para buscar.", { variant: "warning" });
      return;
    }
    if (searchFilters.linea && !searchFilters.laboratorio) {
      enqueueSnackbar("Debe seleccionar un Laboratorio cuando selecciona una Línea.", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const res = await productService.buscarProductos({
        sucursalId: searchFilters.sucursalId,
        nombre: searchFilters.nombre,
        codigo: searchFilters.codigo,
        lineaId: searchFilters.linea,
        laboratorioId: searchFilters.laboratorio,
      });

      if (res.exitoso) {
        setProducts(res.datos);
        if (res.datos.length === 0) {
          enqueueSnackbar("No se encontraron productos con esos criterios.", { variant: "info" });
        } else {
          enqueueSnackbar(`${res.datos.length} producto(s) encontrado(s).`, { variant: "success" });
        }
      } else {
        setProducts([]);
        enqueueSnackbar(res.mensaje || "No se encontraron productos.", { variant: "warning" });
      }
    } catch (error) {
      console.error("Error buscando productos:", error);
      enqueueSnackbar("Error al buscar productos.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchFilters({
      sucursalId: "",
      nombre: "",
      codigo: "",
      linea: "",
      laboratorio: "",
    });
    setProducts([]);
    setCatalogs(prev => ({ ...prev, filterLaboratorios: [] }));
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setProductForm((prev) => ({ ...prev, [field]: value }));

    if (field === "tipoProducto_ID") {
      const tipo = TIPOS_PRODUCTO.find((t) => t.id === Number(value));
      setProductForm((prev) => ({
        ...prev,
        tipoProducto_ID: value,
        tipoProducto: tipo ? tipo.nombre : "",
      }));
    }
  };

  const clearForm = () => {
    setProductForm({ ...initialProductFormState });
    setSelectedProduct(null);
  };

  const prepareEditProduct = (product) => {
    // `product` at this point is the raw search result row (producto_ID, codigoProducto, etc.)
    // We store it as selectedProduct; the EditProductForm will fetch full details via getProductoParaEditar
    setSelectedProduct(product);
    // Pre-fill minimal form data from list row
    setProductForm(prev => ({
      ...initialProductFormState,
      nombre: product.producto || product.nombre || "",
    }));
  };

  const filteredProducts = useMemo(() => products, [products]);

  const handleCreateProduct = async () => {
    // Validaciones
    const errors = [];
    if (!productForm.nombre?.trim()) errors.push("Nombre del producto");
    if (!productForm.tipoFormaFarmaceutica) errors.push("Tipo Forma Farmacéutica");
    if (!productForm.unidadMedida) errors.push("Unidad de Medida");
    if (!productForm.linea) errors.push("Línea");
    if (!productForm.laboratorio) errors.push("Laboratorio");
    if (!productForm.industria) errors.push("Industria");
    if (productForm.esProductoMedicamento === undefined || productForm.esProductoMedicamento === null) errors.push("Tipo (Medicamento/Bebida)");
    if (errors.length > 0) {
      enqueueSnackbar(`Campos obligatorios: ${errors.join(", ")}`, { variant: "warning" });
      return false;
    }

    try {
      setLoading(true);
      const payload = {
        nombreProducto: productForm.nombre.trim(),
        formaFarmaceutica: productForm.formaFarmaceuticaTexto || "",
        tipoFormaFarmaceutica: Number(productForm.tipoFormaFarmaceutica),
        concentracion: productForm.concentracion || "",
        presentacion: productForm.presentacionTexto || "",
        dosis: productForm.dosis || "",
        viaAdministracion: productForm.viaAdministracion || "",
        accionTerapeutica: productForm.accionTerapeutica || "",
        unidadMedida: Number(productForm.unidadMedida),
        lineaProducto: Number(productForm.linea),
        laboratorio: Number(productForm.laboratorio),
        industria: Number(productForm.industria),
        principioActivo: productForm.principioActivo || "",
        nombreGenerico: productForm.nombreGenerico || "",
        nombreComercial: productForm.nombreComercial || "",
        esProductoMedicamento: productForm.esProductoMedicamento === true,
        codigoEmpleadoAlta: codigoEmpleado || "SYSTEM",
      };
      const res = await productService.guardarProducto(payload);
      if (res?.exitoso) {
        clearForm();
        enqueueSnackbar(res.mensaje || "Producto creado exitosamente", { variant: "success" });
        return true;
      }
      enqueueSnackbar(res?.mensaje || "Error al crear el producto", { variant: "error" });
      return false;
    } catch (error) {
      enqueueSnackbar("Error al guardar el producto", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    const codigoProducto = selectedProduct?.codigoProducto || selectedProduct?.codigo;
    if (!codigoProducto) {
      enqueueSnackbar("No hay producto seleccionado para editar", { variant: "warning" });
      return false;
    }

    // Validaciones
    const errors = [];
    if (!productForm.nombre?.trim()) errors.push("Nombre del producto");
    if (!productForm.tipoFormaFarmaceutica) errors.push("Tipo Forma Farmacéutica");
    if (!productForm.unidadMedida) errors.push("Unidad de Medida");
    if (!productForm.linea) errors.push("Línea");
    if (!productForm.laboratorio) errors.push("Laboratorio");
    if (!productForm.industria) errors.push("Industria");
    if (errors.length > 0) {
      enqueueSnackbar(`Campos obligatorios: ${errors.join(", ")}`, { variant: "warning" });
      return false;
    }

    try {
      setLoading(true);
      const payload = {
        codigoProducto,
        formaFarmaceutica: productForm.formaFarmaceuticaTexto || "",
        tipoFormaFarmaceutica: Number(productForm.tipoFormaFarmaceutica),
        concentracion: productForm.concentracion || "",
        presentacion: productForm.presentacionTexto || "",
        dosis: productForm.dosis || "",
        viaAdministracion: productForm.viaAdministracion || "",
        accionTerapeutica: productForm.accionTerapeutica || "",
        unidadMedida: Number(productForm.unidadMedida),
        lineaProducto: Number(productForm.linea),
        laboratorio: Number(productForm.laboratorio),
        industria: Number(productForm.industria),
        principioActivo: productForm.principioActivo || "",
        nombreGenerico: productForm.nombreGenerico || "",
        nombreComercial: productForm.nombreComercial || "",
        codigoEmpleadoAlta: codigoEmpleado || "SYSTEM",
      };
      const res = await productService.actualizarProducto(payload);
      if (res?.exitoso) {
        clearForm();
        enqueueSnackbar(res.mensaje || "Producto actualizado exitosamente", { variant: "success" });
        return true;
      }
      enqueueSnackbar(res?.mensaje || "Error al actualizar el producto", { variant: "error" });
      return false;
    } catch (error) {
      enqueueSnackbar("Error al actualizar el producto", { variant: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    const productName = product.producto || product.nombre || "este producto";
    const productId = product.producto_ID || product.id;
    if (!window.confirm(`¿Desea eliminar "${productName}"?`)) return;
    (async () => {
      try {
        setLoading(true);
        const res = await productService.eliminar(productId);
        if (res.exitoso) {
          // Refrescar lista después de eliminar
          setProducts(prev => prev.filter(p => (p.producto_ID || p.id) !== productId));
          enqueueSnackbar(res.mensaje || "Producto eliminado", { variant: "success" });
        } else {
          enqueueSnackbar(res.mensaje || "Error al eliminar", { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar("Error al eliminar el producto", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  };

  return {
    products,
    filteredProducts,
    searchFilters,
    updateSearchFilters,
    searchProducts,
    resetSearch,
    productForm,
    setProductForm,
    productFormChange: handleFormChange,
    selectedProduct,
    setSelectedProduct,
    loading,
    tiposProducto: TIPOS_PRODUCTO,
    clearForm,
    prepareEditProduct,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    catalogs,
    setCatalogs,
  };
};
