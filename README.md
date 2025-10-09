# SIFARMA-ERP 🏥💊

Sistema Integral de Gestión Farmacéutica - Una solución ERP especializada para farmacias

## 🚀 Características

- **Gestión de Acceso y Seguridad**: Control granular de usuarios y permisos
- **Inventarios**: Control en tiempo real con alertas automáticas
- **Almacenes**: Gestión optimizada de entradas y salidas
- **Compras y Proveedores**: Control integral de pedidos
- **Ventas**: Sistema ágil con código de barras
- **Facturación Electrónica**: Conforme a normativas SIN
- **Contabilidad**: Sistema contable integrado
- **Reportes**: Dashboard ejecutivo con KPIs

## Nuevas Funcionalidades

### Módulo de Ventas
- ✅ Anulación de facturas con motivos oficiales
- ✅ Formulario de cliente con códigos rápidos
- ✅ Búsqueda de productos con navegación por teclado
- ✅ Vista completa de inventario
- ✅ Validaciones de stock y alertas
- ✅ Integración con SIAT (simulado)

## 🛠️ Tecnologías

- **Frontend**: React 18, Material-UI, Vite
- **Containerización**: Docker, Docker Compose
- **Servidor Web**: Nginx

## 📋 Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- Git

## 🔧 Instalación

### Desarrollo Local

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/SIFARMA-ERP.git
cd SIFARMA-ERP

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
\`\`\`

### Con Docker

\`\`\`bash
# Construir y ejecutar con Docker Compose
docker-compose up -d

# Para desarrollo con hot-reload
docker-compose -f docker-compose.dev.yml up
\`\`\`

La aplicación estará disponible en http://localhost:3000

## 🧪 Testing

\`\`\`bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui
\`\`\`

## 📦 Build de Producción

\`\`\`bash
# Build local
npm run build

# Build con Docker
docker build -t sifarma-frontend .
\`\`\`

## 📚 Estructura del Proyecto

\`\`\`
src/
├── app/           # Configuración de la aplicación
├── modules/       # Módulos del sistema
│   ├── access-security/
│   ├── inventory/
│   └── ...
├── shared/        # Componentes compartidos
└── main.jsx       # Punto de entrada
\`\`\`

## 📚 Opción de Ventas
src/
├── modules/
│   └── sales/
│       ├── components/
│       │   ├── CancelInvoiceModal.jsx     # Actualizado
│       │   ├── ClientForm.jsx             # Nuevo
│       │   ├── SaleItemsTable.jsx         # Nuevo  
│       │   ├── ProductsModal.jsx          # Nuevo
│       │   ├── ProductSearch.jsx          # Existente
│       │   ├── StockModal.jsx             # (si existe)
│       │   ├── MySalesModal.jsx           # (si existe)
│       │   └── PrintInvoiceModal.jsx      # (si existe)
│       ├── pages/
│       │   └── SalesPage.jsx              # Actualizado
│       ├── services/
│       │   └── cancelInvoiceService.js    # Nuevo
│       ├── hooks/
│       │   └── useSales.js                # (si existe)
│       └── constants/
│           └── salesConstants.js          # (si existe)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de características (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

- Tu Nombre - Desarrollo Frontend

## 🙏 Agradecimientos

- Farmacia Dinámica por la confianza en el proyecto