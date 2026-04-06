// src/modules/reports/pages/VentasReportePage.jsx
// Ruta: /reportes/ventas
// Muestra: ventas del día + ventas eliminadas, con buscador

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Chip,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab,
  Breadcrumbs, Link, Container,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { farmaColors } from '../../../app/theme';
import PageHeader from '../../../shared/components/PageHeader';
import { TrendingUp } from '@mui/icons-material';
import reportesService from '../../../services/api/reportesService';

const hoy = () => new Date().toISOString().split('T')[0];

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ─── Tabla genérica de ventas ─────────────────────────────────────────────────
function TablaVentas({ datos, loading }) {
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress sx={{ color: farmaColors.primary }} />
    </Box>
  );
  if (!datos.length) return (
    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
      No se encontraron registros
    </Typography>
  );
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: farmaColors.secondary }}>
            {['Venta','N° Factura','Usuario','CI/Doc','Código','Fecha','Hora','Producto','Lote','Stock Ant.','Stock Act.','Cant.','Desc.','P/U','Total'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((row, i) => (
            <TableRow key={i} hover>
              <TableCell>
                <Chip label={row.venta} size="small"
                  sx={{ bgcolor: row.venta === 'S' ? '#27ae60' : '#e74c3c', color: 'white', fontSize: '0.7rem' }} />
              </TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.numeroFactura}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{row.nombreUsuario}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.documento}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.codigo}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.fechaVenta?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.horaVenta}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem', maxWidth: 180 }}>{row.nombreProducto}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.numeroLote}</TableCell>
              <TableCell align="center"><Chip label={row.stockAnterior ?? 0} size="small" sx={{ bgcolor: '#3498db', color: 'white', fontSize: '0.7rem' }} /></TableCell>
              <TableCell align="center"><Chip label={row.stockActual ?? 0} size="small" sx={{ bgcolor: '#27ae60', color: 'white', fontSize: '0.7rem' }} /></TableCell>
              <TableCell align="center"><Chip label={row.cantidad} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.7rem' }} /></TableCell>
              <TableCell align="center"><Chip label={row.descuento ?? 0} size="small" sx={{ bgcolor: '#95a5a6', color: 'white', fontSize: '0.7rem' }} /></TableCell>
              <TableCell align="right" sx={{ fontSize: '0.78rem' }}>{row.precionUnitario}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Tabla ventas eliminadas ──────────────────────────────────────────────────
function TablaEliminadas({ datos, loading }) {
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress sx={{ color: farmaColors.primary }} />
    </Box>
  );
  if (!datos.length) return (
    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
      No se encontraron registros
    </Typography>
  );
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#c0392b' }}>
            {['Fecha Venta','Hora Venta','Fecha Eliminación','Hora Eliminación','Código','Producto','Cantidad','Motivo','Usuario'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((row, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.fechaVenta?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.horaVenta}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.fechaEliminacion?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.horaEliminacion}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.codigo}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.nombreProducto}</TableCell>
              <TableCell align="center"><Chip label={row.cantidad} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.7rem' }} /></TableCell>
              <TableCell sx={{ fontSize: '0.78rem' }}>{row.motivo}</TableCell>
              <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{row.nombreUsuario}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function VentasReportePage() {
  const [tab, setTab] = useState(0);

  // Ventas state
  const [datosVentas, setDatosVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [filtrosVentas, setFiltrosVentas] = useState({
    numeroFactura: '', documentoIdentidad: '', fechaActual: hoy(),
    codigoProducto: '', nombreProducto: '', tipoDescuento: 'Todos',
  });

  // Eliminadas state
  const [datosEliminadas, setDatosEliminadas] = useState([]);
  const [loadingEliminadas, setLoadingEliminadas] = useState(false);
  const [filtrosEliminadas, setFiltrosEliminadas] = useState({
    fechaActual: hoy(), codigoProducto: '',
  });

  const buscarVentas = useCallback(async () => {
    setLoadingVentas(true);
    const datos = await reportesService.buscarVentas(filtrosVentas);
    setDatosVentas(datos);
    setLoadingVentas(false);
  }, [filtrosVentas]);

  const buscarEliminadas = useCallback(async () => {
    setLoadingEliminadas(true);
    const datos = await reportesService.buscarVentasEliminadas(filtrosEliminadas);
    setDatosEliminadas(datos);
    setLoadingEliminadas(false);
  }, [filtrosEliminadas]);

  // Carga inicial
  useEffect(() => { buscarVentas(); }, []);
  useEffect(() => { buscarEliminadas(); }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader title="Reporte de Ventas" subtitle="Ventas del día y ventas eliminadas por sucursal" icon={<TrendingUp />} />
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">Dashboard</Link>
          <Typography color="text.primary">Ventas</Typography>
        </Breadcrumbs>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600 }, '& .Mui-selected': { color: farmaColors.primary }, '& .MuiTabs-indicator': { bgcolor: farmaColors.primary } }}>
        <Tab label="Ventas del día" />
        <Tab label="Ventas eliminadas" />
      </Tabs>

      {/* ── TAB 0: Ventas ── */}
      <TabPanel value={tab} index={0}>
        <Card sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ bgcolor: farmaColors.secondary, py: '12px !important' }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Búsqueda</Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="N° Factura" value={filtrosVentas.numeroFactura}
                  onChange={e => setFiltrosVentas(p => ({ ...p, numeroFactura: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="CI/NIT" value={filtrosVentas.documentoIdentidad}
                  onChange={e => setFiltrosVentas(p => ({ ...p, documentoIdentidad: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" type="date" label="Fecha" value={filtrosVentas.fechaActual}
                  onChange={e => setFiltrosVentas(p => ({ ...p, fechaActual: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="Código producto" value={filtrosVentas.codigoProducto}
                  onChange={e => setFiltrosVentas(p => ({ ...p, codigoProducto: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="Producto" value={filtrosVentas.nombreProducto}
                  onChange={e => setFiltrosVentas(p => ({ ...p, nombreProducto: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Descuento</InputLabel>
                  <Select value={filtrosVentas.tipoDescuento} label="Descuento"
                    onChange={e => setFiltrosVentas(p => ({ ...p, tipoDescuento: e.target.value }))}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Con descuento">Con descuento</MenuItem>
                    <MenuItem value="Sin descuento">Sin descuento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Button fullWidth variant="contained" startIcon={<Search />} onClick={buscarVentas}
                  sx={{ bgcolor: farmaColors.secondary, '&:hover': { bgcolor: farmaColors.secondaryDark } }}>
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box sx={{ mb: 1 }}>
          <Chip label={`${datosVentas.length} registros`} size="small"
            sx={{ bgcolor: farmaColors.alpha?.primary10 ?? '#fff3e0', color: farmaColors.primary, fontWeight: 700 }} />
        </Box>
        <TablaVentas datos={datosVentas} loading={loadingVentas} />
      </TabPanel>

      {/* ── TAB 1: Eliminadas ── */}
      <TabPanel value={tab} index={1}>
        <Card sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ bgcolor: '#c0392b', py: '12px !important' }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Búsqueda</Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" type="date" label="Fecha" value={filtrosEliminadas.fechaActual}
                  onChange={e => setFiltrosEliminadas(p => ({ ...p, fechaActual: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" label="Código producto" value={filtrosEliminadas.codigoProducto}
                  onChange={e => setFiltrosEliminadas(p => ({ ...p, codigoProducto: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button fullWidth variant="contained" startIcon={<Search />} onClick={buscarEliminadas}
                  sx={{ bgcolor: '#c0392b', '&:hover': { bgcolor: '#a93226' } }}>
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box sx={{ mb: 1 }}>
          <Chip label={`${datosEliminadas.length} registros`} size="small"
            sx={{ bgcolor: '#fdecea', color: '#c0392b', fontWeight: 700 }} />
        </Box>
        <TablaEliminadas datos={datosEliminadas} loading={loadingEliminadas} />
      </TabPanel>
    </Container>
  );
}