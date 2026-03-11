// src/modules/purchases/pages/PurchasesPage.jsx
import React from "react";
import CreatePurchaseSection from "../components/CreatePurchaseSection";
import AddProductsToPurchaseSection from "../components/AddProductsToPurchaseSection";
import CreditPaymentSection from "../components/CreditPaymentSection";
import CreditPurchasesListSection from "../components/CreditPurchasesListSection";
import CreateInventoryOutputSection from "../components/CreateInventoryOutputSection";
import AddProductsToInventoryOutputSection from "../components/AddProductsToInventoryOutputSection";
import { usePurchases } from "../hooks/usePurchases";
import { useCreditPurchases } from "../hooks/useCreditPurchases";
import { useInventoryOutput } from "../hooks/useInventoryOutput";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container, Box } from "@mui/material";

const CreditPurchasesWrapper = () => {
    const creditPurchases = useCreditPurchases();
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <CreditPurchasesListSection {...creditPurchases} />
        </Container>
    );
};

const PurchasesDispatcher = () => {
    const {
        purchaseData,
        setPurchaseData,
        onCreatePurchase,
        catalogs,
        loading,
        loadingOrders,
        loadingSearch,
        viewState,
        createdPurchase,
        purchaseItems,
        addItemRow,
        removeItemRow,
        updateItemRow,
        searchProducts,
        searchLaboratorios,
        addPurchaseItem,
        handleSaveProducts,
        invoiceData,
        setInvoiceData,
        handleSaveInvoice,
        creditData,
        setCreditData,
        onPagarCredito
    } = usePurchases();

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mt: 2 }}>
                {viewState === "creating" && (
                    <CreatePurchaseSection
                        purchaseData={purchaseData}
                        setPurchaseData={setPurchaseData}
                        onCreate={onCreatePurchase}
                        catalogs={catalogs}
                        loading={loading}
                        loadingOrders={loadingOrders}
                    />
                )}

                {viewState === "paying_credit" && (
                    <CreditPaymentSection
                        creditData={creditData}
                        setCreditData={setCreditData}
                        onSave={onPagarCredito}
                        loading={loading}
                    />
                )}

                {viewState === "adding_products" && (
                    <AddProductsToPurchaseSection
                        createdPurchase={createdPurchase}
                        purchaseItems={purchaseItems}
                        addItemRow={addItemRow}
                        removeItemRow={removeItemRow}
                        updateItemRow={updateItemRow}
                        searchProducts={searchProducts}
                        searchLaboratorios={searchLaboratorios}
                        addPurchaseItem={addPurchaseItem}
                        handleSaveProducts={handleSaveProducts}
                        invoiceData={invoiceData}
                        setInvoiceData={setInvoiceData}
                        handleSaveInvoice={handleSaveInvoice}
                        catalogs={catalogs}
                        loading={loading}
                        loadingSearch={loadingSearch}
                    />
                )}
            </Box>
        </Container>
    );
};

const InventoryOutputWrapper = () => {
    const inventoryOutput = useInventoryOutput();
    const { viewState, outputData, setOutputData, handleCreateOutput, catalogs, loading, loadingCatalogs } = inventoryOutput;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {viewState === "creating" ? (
                <CreateInventoryOutputSection
                    outputData={outputData}
                    setOutputData={setOutputData}
                    onCreate={handleCreateOutput}
                    catalogs={catalogs}
                    loading={loading}
                    loadingCatalogs={loadingCatalogs}
                />
            ) : (
                <AddProductsToInventoryOutputSection {...inventoryOutput} />
            )}
        </Container>
    );
};

const PurchasesPage = () => {
    return (
        <Routes>
            <Route index element={<PurchasesDispatcher />} />
            {/* Rutas para Nueva Compra */}
            <Route path="nueva" element={<PurchasesDispatcher />} />
            <Route path="nueva-compra" element={<PurchasesDispatcher />} />

            {/* Rutas para Compras al Crédito */}
            <Route path="credito" element={<CreditPurchasesWrapper />} />
            <Route path="compras-al-credito" element={<CreditPurchasesWrapper />} />

            {/* Rutas para Nueva Salida de Inventario */}
            <Route path="nueva-salida" element={<InventoryOutputWrapper />} />

            {/* Redirigir cualquier otra sub-ruta a 'nueva' por ahora */}
            <Route path="*" element={<Navigate to="nueva" replace />} />
        </Routes>
    );
};

export default PurchasesPage;
