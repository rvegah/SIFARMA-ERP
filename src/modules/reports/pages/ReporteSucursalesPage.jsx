import React from "react";
import { Container } from "@mui/material";
import { Storefront } from "@mui/icons-material";
import PageHeader from "../../../shared/components/PageHeader";
import ReportePorSucursalesSection from "../components/ReportePorSucursalesSection";

const ReporteSucursalesPage = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <PageHeader
                title="Reporte por Sucursales"
                subtitle="Stock y precios de productos por sucursal"
                icon={<Storefront />}
            />
            <ReportePorSucursalesSection />
        </Container>
    );
};

export default ReporteSucursalesPage;