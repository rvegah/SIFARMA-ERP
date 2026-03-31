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
            <Route
                path="lista"
                element={
                    <ProductList
                        onCreateProduct={() => navigate("/productos/agregar")}
                        onEditProduct={(product) => {
                            setSelectedProduct(product);
                            navigate("/productos/editar");
                        }}
                    />
                }
            />
            <Route path="agregar" element={<CreateProductForm onCancel={() => navigate("/productos/lista")} />} />
            <Route path="editar" element={<EditProductForm onCancel={() => navigate("/productos/lista")} />} />
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
