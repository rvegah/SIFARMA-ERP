// src/modules/products/pages/ProductManagementPage.jsx
// Página principal del módulo productos: lista, crear, editar (vinculada a rutas y menú)

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import ProductList from "../components/ProductList";
import CreateProductForm from "../components/CreateProductForm";
import EditProductForm from "../components/EditProductForm";
import { ProductProvider, useProductContext } from "../context/ProductContext";

function ProductManagementPageContent() {
  const [activeView, setActiveView] = useState("list");
  const [createFormKey, setCreateFormKey] = useState(0);
  const location = useLocation();
  const { setSelectedProduct } = useProductContext();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/agregar")) {
      setActiveView("create");
      setCreateFormKey((k) => k + 1);
    } else if (path.includes("/editar")) {
      setActiveView("edit");
    } else if (path.includes("/ver") || path === "/productos" || path === "/productos/") {
      setActiveView("list");
    } else {
      setActiveView("list");
    }
  }, [location.pathname]);

  const handleCreateProduct = () => {
    setCreateFormKey((k) => k + 1);
    setActiveView("create");
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setActiveView("edit");
  };

  const handleBackToList = () => {
    setActiveView("list");
  };

  if (activeView === "create") {
    return (
      <CreateProductForm
        key={"create-" + createFormKey}
        onCancel={handleBackToList}
      />
    );
  }

  if (activeView === "edit") {
    return <EditProductForm onCancel={handleBackToList} />;
  }

  return (
    <ProductList
      onCreateProduct={handleCreateProduct}
      onEditProduct={handleEditProduct}
    />
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
