// src/modules/sales/index.js
export { default as SalesPage } from './pages/SalesPage';
export { default as ClientForm } from './components/ClientForm';
export { default as ProductSearch } from './components/ProductSearch';
export { default as SaleItemsTable } from './components/SaleItemsTable';
export { default as StockModal } from './components/StockModal';
export { default as MySalesModal } from './components/MySalesModal';
export { useSales } from './hooks/useSales';
export * from './constants/salesConstants';