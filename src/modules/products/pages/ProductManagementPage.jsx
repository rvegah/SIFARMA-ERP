// src/modules/products/pages/ProductManagementPage.jsx
// Página principal del módulo productos: lista, crear, editar (vinculada a rutas y menú)

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import ProductList from "../components/ProductList";
import CreateProductForm from "../components/CreateProductForm";
import EditProductForm from "../components/EditProductForm";
import { ProductProvider, useProductContext } from "../context/ProductContext";

function ProductManagementPageContent() {
    const navigate = useNavigate();
    const { setSelectedProduct } = useProductContext();

    return (
        <Routes>
            {/* <Route index element={<Navigate to="lista" replace />} /> */}
            <Route
                path="lista"
                element={
                    <ProductList
                        onCreateProduct={() => navigate("../agregar")}
                        onEditProduct={(product) => {
                            setSelectedProduct(product);
                            navigate("../editar");
                        }}
                    />
                }
            />
            <Route path="agregar" element={<CreateProductForm onCancel={() => navigate("../lista")} />} />
            {/* <Route path="agregar-productos" element={<Navigate to="../agregar" replace />} /> */}
            {/* <Route path="editar" element={<EditProductForm onCancel={() => navigate("../list")} />} />
            <Route path="editar-productos" element={<Navigate to="../editar" replace />} /> */}
            {/* <Route path="ver-productos" element={<Navigate to="../list" replace />} /> */}
            {/* <Route path="*" element={<Navigate to="list" replace />} /> */}
        </Routes>
    );
};

function ProductManagementPage() {
    return (
        <ProductProvider>
            <ProductManagementPageContent />
        </ProductProvider>
    );
}

export default ProductManagementPage;
