// src/modules/products/constants/productConstants.js
// Constantes del módulo de productos (tipos dummy y estado inicial)

// Tipos de producto (dummy para dropdown - reemplazar por API cuando exista)
export const TIPOS_PRODUCTO = [
  { id: 1, codigo: "MED", nombre: "Medicamento" },
  { id: 2, codigo: "COS", nombre: "Cosmético" },
  { id: 3, codigo: "VIT", nombre: "Vitamina / Suplemento" },
  { id: 4, codigo: "HIG", nombre: "Higiene" },
  { id: 5, codigo: "MAT", nombre: "Material de curación" },
  { id: 6, codigo: "OTR", nombre: "Otro" },
];

// Estado inicial del formulario (crear/editar)
export const initialProductFormState = {
  // Identificación
  nombre: "",
  principioActivo: "",
  nombreGenerico: "",
  nombreComercial: "",
  esProductoMedicamento: null, // true = Medicamento, false = Bebida no Alcohólica

  // Características farmacéuticas
  tipoFormaFarmaceutica: "",    // ID del dropdown "Tipo Forma Farmacéutica"
  formaFarmaceuticaTexto: "",   // Texto libre "Forma Farmacéutica"
  concentracion: "",
  presentacionTexto: "",        // Texto libre "Presentación"
  unidadMedida: "",             // ID del dropdown "Unidad de Medida"
  dosis: "",
  viaAdministracion: "",
  accionTerapeutica: "",

  // Clasificación
  linea: "",
  laboratorio: "",
  industria: "",
};

