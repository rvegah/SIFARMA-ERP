// src/modules/sales/components/OrderManagementSection.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import {
  ShoppingBasket,
  AddCircle,
  History as HistoryIcon,
  DeleteSweep
} from "@mui/icons-material";
import { useOrders } from "../hooks/useOrders";
import CreateOrderSection from "../components/CreateOrderSection";
import AddProductsToOrderSection from "../components/AddProductsToOrderSection";
import { farmaColors } from "../../../app/theme";
import PageHeader from "../../../shared/components/PageHeader";

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

  const location = useLocation();

  // Helper to format date
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Handle direct navigation or editing from URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const numeroPedido = params.get("numeroPedido");
    const id = params.get("id"); // Compatibility with previous redirect

    if (numeroPedido || id) {
      loadPedidoDetalle(numeroPedido || id);
    } else if (location.pathname.includes("/crear") || location.pathname.includes("/realizar-pedidos")) {
      if (viewState === "initial") {
        setViewState("creating");
      }
    }
  }, [location.search, location.pathname]);

  let content = null;

  if (viewState === "initial") {
    content = (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <PageHeader
          title="Gestión de Pedidos"
          subtitle="Crea nuevos pedidos de stock para tu sucursal de manera rápida y sencilla."
          icon={<ShoppingBasket fontSize="large" />}
          center={true}
        />
        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircle />}
          onClick={() => setViewState("creating")}
          sx={{
            background: farmaColors.gradients.primary,
            px: 8,
            py: 2,
            borderRadius: 3,
            fontSize: '1.2rem',
            fontWeight: 700,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}
        >
          Realizar Nuevo Pedido
        </Button>
      </Container>
    );
  } else if (viewState === "creating") {
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
          title={isReadOnly ? "Consulta de Pedido" : "Añadir Productos al Pedido"}
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
          clearStorage={() => clearPendingOrder(orderData.numeroPedido || orderData.pedidoProveedor_ID)}
          catalogs={catalogs}
        />
      </Container>
    );
  }

  return (
    <>
      {content}
      <Dialog
        open={!!pendingOrderFound}
        onClose={discardPendingOrder}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800, color: farmaColors.secondary }}>
          <HistoryIcon color="primary" fontSize="large" /> Selección Pendiente
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Tienes una selección pendiente del <strong>{pendingOrderFound ? formatDate(pendingOrderFound.timestamp) : ""}</strong>.
          </DialogContentText>
          <Typography variant="body2" color="text.secondary">
            ¿Deseas continuar con el pedido anterior o limpiar la lista y empezar uno nuevo?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={discardPendingOrder}
            startIcon={<DeleteSweep />}
            sx={{ color: farmaColors.alpha.secondary70, fontWeight: 600 }}
          >
            Limpiar lista
          </Button>
          <Button
            onClick={recoverPendingOrder}
            variant="contained"
            autoFocus
            sx={{
              background: farmaColors.gradients.primary,
              px: 3,
              borderRadius: 2,
              fontWeight: 700
            }}
          >
            Continuar Editando
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderManagementSection;
