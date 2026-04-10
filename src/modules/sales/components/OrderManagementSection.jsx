// src/modules/sales/components/OrderManagementSection.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Box, Typography, Button } from "@mui/material";
import { ShoppingBasket, AddCircle } from "@mui/icons-material";
import { useOrders } from "../hooks/useOrders";
import CreateOrderSection from "../components/CreateOrderSection";
import AddProductsToOrderSection from "../components/AddProductsToOrderSection";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";
import { useParams } from "react-router-dom";

const OrderManagementSection = () => {
  const {
    viewState,
    orderData,
    searchFilters,
    setSearchFilters,
    searchResults,
    selectedProducts,
    loading,
    isReadOnly,
    catalogs,
    setViewState,
    updateData,
    handleCreateOrder,
    searchProducts,
    searchProductsByText,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    handleSaveOrder,
    loadPedidoDetalle,
    resetFlow,
    pendingOrderFound,
    recoverPendingOrder,
    discardPendingOrder,
    canEdit,
    onCambiarEstado,
    clearPendingOrder,
  } = useOrders();

  const { numeroPedido } = useParams();

  const location = useLocation();

  // Helper to format date
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Handle direct navigation or editing from URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const numeroPedidoQuery = params.get("numeroPedido");
    const id = params.get("id");

    // 🔥 1. PRIORIDAD: URL tipo /ventas/pedidos/:numeroPedido
    if (numeroPedido) {
      loadPedidoDetalle(numeroPedido);
      setViewState("adding_products");
      return;
    }

    // 🔥 2. URL antigua con query (?numeroPedido=...)
    if (numeroPedidoQuery || id) {
      loadPedidoDetalle(numeroPedidoQuery || id);
      return;
    }

    // 🔥 3. flujo normal (crear)
    if (
      location.pathname.includes("/crear") ||
      location.pathname.includes("/realizar-pedidos")
    ) {
      if (viewState === "initial") {
        setViewState("creating");
      }
    }
  }, [numeroPedido, location.search, location.pathname]);

  let content = null;

  if (viewState === "creating") {
    content = (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageHeader
          title="Realizar Pedido"
          // subtitle="Configuración inicial del pedido de stock."
          icon={<AddCircle />}
        />
        <CreateOrderSection
          orderData={orderData}
          updateData={updateData}
          onNext={handleCreateOrder}
          loading={loading}
          catalogs={catalogs}
        />
      </Container>
    );
  } else if (viewState === "adding_products") {
    content = (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader
          title={
            isReadOnly ? "Consulta de Pedido" : "Añadir Productos al Pedido"
          }
          subtitle="Selección de productos y cantidades para el pedido."
          icon={<ShoppingBasket />}
        />
        <AddProductsToOrderSection
          orderData={orderData}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          searchResults={searchResults}
          onSearch={searchProductsByText}
          selectedProducts={selectedProducts}
          onAdd={addProductToOrder}
          onRemove={removeProductFromOrder}
          onUpdateQty={updateProductQuantity}
          onSave={handleSaveOrder}
          loading={loading}
          isReadOnly={isReadOnly}
          canEdit={canEdit}
          onStatusChange={onCambiarEstado}
          clearStorage={() =>
            clearPendingOrder(
              orderData.numeroPedido || orderData.pedidoProveedor_ID,
            )
          }
          catalogs={catalogs}
        />
      </Container>
    );
  }

  return <>{content}</>;
};

export default OrderManagementSection;
