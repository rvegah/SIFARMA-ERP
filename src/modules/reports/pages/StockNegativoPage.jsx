// src/modules/reports/pages/StockNegativoPage.jsx
// Ruta: /reportes/almacenes

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Chip,
  Breadcrumbs, Link, Container, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Search, Inventory } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { farmaColors } from '../../../app/theme';
import PageHeader from '../../../shared/components/PageHeader';
import reportesService from '../../../services/api/reportesService';

export default function StockNegativoPage() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(async () => {
    setLoading(true);
    setDatos(await reportesService.buscarProductosStockNegativo());
    setLoading(false);
  }, []);

  useEffect(() => { buscar(); }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader title="Productos con Stock Negativo" subtitle="Lista de productos con stock negativo en la sucursal" icon={<Inventory />} />
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">Dashboard</Link>
          <Typography color="text.primary">Stock Negativo</Typography>
        </Breadcrumbs>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ bgcolor: '#7f5af0', py: '12px !important' }}>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Búsqueda</Typography>
        </CardContent>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item>
              <Button variant="contained" startIcon={<Search />} onClick={buscar}
                sx={{ bgcolor: '#7f5af0', '&:hover': { bgcolor: '#6b46e0' } }}>
                Buscar Stock Negativos
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contador */}
      <Card sx={{ mb: 2, borderRadius: 2, bgcolor: farmaColors.secondary }}>
        <CardContent sx={{ py: '12px !important' }}>
          <Typography sx={{ color: 'white', fontWeight: 700 }}>
            CANTIDAD PRODUCTOS CON STOCK NEGATIVOS:{' '}
            <Chip label={datos.length} size="small"
              sx={{ bgcolor: datos.length > 0 ? '#e74c3c' : '#27ae60', color: 'white', fontWeight: 800 }} />
          </Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: farmaColors.primary }} />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: farmaColors.secondary }}>
                {['Código','Producto','Nombre Genérico/Forma Farmacéutica','Presentación','Línea','Laboratorio','Stock','P/U'].map(h => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No se encontraron productos con stock negativo
                  </TableCell>
                </TableRow>
              ) : datos.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.codigo}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.nombreProducto}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.formaFarmaceutica}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.presentacion}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.linea}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{r.laboratorio}</TableCell>
                  <TableCell align="center">
                    <Chip label={r.stockActual} size="small"
                      sx={{ bgcolor: r.stockActual < 0 ? '#e74c3c' : '#27ae60', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{r.precioUnitario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}