// src/modules/reports/pages/DiarioReportePage.jsx
// Ruta: /reportes/diario
// Muestra: Compras / Traspasos / Compras a crédito / Traspasos no aceptados

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Chip,
  Tabs, Tab, Breadcrumbs, Link, Container,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { farmaColors } from '../../../app/theme';
import PageHeader from '../../../shared/components/PageHeader';
import { Assessment } from '@mui/icons-material';
import reportesService from '../../../services/api/reportesService';

const hoy = () => new Date().toISOString().split('T')[0];

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function EmptyOrLoading({ loading }) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: farmaColors.primary }} /></Box>;
  return <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No se encontraron registros</Typography>;
}

// ─── Tabla Compras ────────────────────────────────────────────────────────────
function TablaCompras({ datos, loading }) {
  if (loading || !datos.length) return <EmptyOrLoading loading={loading} />;
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#27ae60' }}>
            {/*['UID','Usuario','Tipo','Estado','Código','Producto','Fecha Ingreso','Hora Ingreso','Hora Acept.','Laboratorio','N° Factura','C/U','P/U','P/C','Stock Ant.','Cant.','Total'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))*/}
            {['Usuario','Tipo','Estado','Código','Producto','Fecha Ingreso','Hora Ingreso','Hora Acept.','Laboratorio','N° Factura','C/U','P/U','P/C','Stock Ant.','Cant.','Total'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((r, i) => (
            <TableRow key={i} hover>
              {/*<TableCell sx={{ fontSize: '0.76rem' }}>{r.codigoCompra}</TableCell>*/}
              <TableCell sx={{ fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{r.nombreUsuario}</TableCell>
              <TableCell><Chip label={r.tipoIngreso} size="small" sx={{ bgcolor: '#3498db', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell><Chip label={r.estadoIngreso} size="small" sx={{ bgcolor: '#27ae60', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.codigo}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.nombreProducto}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.fechaIngreso?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.horaIngreso}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.horaAceptado}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.laboratorio}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.numeroFactura}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.costoUnitario}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.precioUnitario}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.precioCaja}</TableCell>
              <TableCell align="center"><Chip label={r.stockAnterior ?? 0} size="small" sx={{ bgcolor: '#3498db', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell align="center"><Chip label={r.cantidad} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.76rem' }}>{r.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Tabla Traspasos ──────────────────────────────────────────────────────────
function TablaTraspasos({ datos, loading }) {
  if (loading || !datos.length) return <EmptyOrLoading loading={loading} />;
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#e67e22' }}>
            {['UID','Sucursal','Enviado Por','Recibido Por','Estado','Fecha','Hora','Hora Acept.','Código','Producto','Vencimiento','Lote','C/U','P/U','P/C','Stock Ant.','Cant.','Total'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.codigoTraspaso}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.sucursal}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{r.enviado}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{r.recibido}</TableCell>
              <TableCell><Chip label={r.estado} size="small" sx={{ bgcolor: '#27ae60', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.fechaTraspaso?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.horaTraspaso}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.horaAceptacion}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.codigo}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.nombreProducto}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.vencimiento}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.numeroLote}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.costoUnitario}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.precioUnitario}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.precioCaja}</TableCell>
              <TableCell align="center"><Chip label={r.stockAnterior ?? 0} size="small" sx={{ bgcolor: '#3498db', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell align="center"><Chip label={r.cantidad} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.76rem' }}>{r.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Tabla Compras Crédito ────────────────────────────────────────────────────
function TablaCredito({ datos, loading }) {
  if (loading || !datos.length) return <EmptyOrLoading loading={loading} />;
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#e74c3c' }}>
            {['Laboratorio','N° Factura','Tipo Compra','Monto Deuda','Saldo Pago','N° Recibo','Días Pago','Fecha Pago','Fecha Compra','Observaciones','Cant. Productos'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.laboratorio}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.numeroFactura}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.tipoCompra}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem', fontWeight: 700 }}>{r.montoDeuda}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.76rem' }}>{r.saldoPago}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.numeroRecibo}</TableCell>
              <TableCell align="center"><Chip label={r.diasPago} size="small" sx={{ bgcolor: '#e74c3c', color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.fechaPago?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.fechaCompra?.split('T')[0]}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.observaciones}</TableCell>
              <TableCell align="center"><Chip label={r.cantidadProductos} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.68rem' }} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Tabla Traspasos No Aceptados ─────────────────────────────────────────────
function TablaNoAceptados({ datos, loading }) {
  if (loading || !datos.length) return <EmptyOrLoading loading={loading} />;
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#2c3e50' }}>
            {['N°','UID','Enviado Por','Sucursal Origen','Sucursal Destino','Fecha Ingreso'].map(h => (
              <TableCell key={h} sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datos.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ fontSize: '0.76rem' }}>{i + 1}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.codigoTraspaso}</TableCell>
              <TableCell sx={{ fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{r.usuarioEnvio}</TableCell>
              <TableCell><Chip label={r.sucursalOrigen} size="small" sx={{ bgcolor: farmaColors.primary, color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell><Chip label={r.sucursalDestino} size="small" sx={{ bgcolor: farmaColors.secondary, color: 'white', fontSize: '0.68rem' }} /></TableCell>
              <TableCell sx={{ fontSize: '0.76rem' }}>{r.fechaIngreso?.replace('T', ' ').substring(0, 16)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function DiarioReportePage() {
  const [tab, setTab] = useState(0);

  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [filtrosCompras, setFiltrosCompras] = useState({ fechaInicial: hoy(), fechaFinal: hoy(), codigoProducto: '', nombreProducto: '', laboratorio: '', numeroFactura: '' });

  const [traspasos, setTraspasos] = useState([]);
  const [loadingTraspasos, setLoadingTraspasos] = useState(false);
  const [filtrosTraspasos, setFiltrosTraspasos] = useState({ fechaInicial: hoy(), fechaFinal: hoy(), codigoProducto: '', nombreProducto: '' });

  const [credito, setCredito] = useState([]);
  const [loadingCredito, setLoadingCredito] = useState(false);
  const [filtrosCredito, setFiltrosCredito] = useState({ fechaInicial: hoy(), fechaFinal: hoy(), laboratorio: '', numeroFactura: '' });

  const [noAceptados, setNoAceptados] = useState([]);
  const [loadingNoAceptados, setLoadingNoAceptados] = useState(false);

  const buscarCompras = useCallback(async () => {
    setLoadingCompras(true);
    setCompras(await reportesService.buscarCompras(filtrosCompras));
    setLoadingCompras(false);
  }, [filtrosCompras]);

  const buscarTraspasos = useCallback(async () => {
    setLoadingTraspasos(true);
    setTraspasos(await reportesService.buscarTraspasos(filtrosTraspasos));
    setLoadingTraspasos(false);
  }, [filtrosTraspasos]);

  const buscarCredito = useCallback(async () => {
    setLoadingCredito(true);
    setCredito(await reportesService.buscarComprasCredito(filtrosCredito));
    setLoadingCredito(false);
  }, [filtrosCredito]);

  const buscarNoAceptados = useCallback(async () => {
    setLoadingNoAceptados(true);
    setNoAceptados(await reportesService.buscarTraspasosNoAceptados());
    setLoadingNoAceptados(false);
  }, []);

  useEffect(() => { buscarCompras(); buscarTraspasos(); buscarCredito(); buscarNoAceptados(); }, []);

  const FiltroFechas = ({ filtros, setFiltros, onBuscar, color, extraFields }) => (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ bgcolor: color, py: '12px !important' }}>
        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Búsqueda</Typography>
      </CardContent>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" type="date" label="Fecha Inicial" value={filtros.fechaInicial}
              onChange={e => setFiltros(p => ({ ...p, fechaInicial: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" type="date" label="Fecha Final" value={filtros.fechaFinal}
              onChange={e => setFiltros(p => ({ ...p, fechaFinal: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          {extraFields}
          <Grid item xs={12} sm={6} md={2}>
            <Button fullWidth variant="contained" startIcon={<Search />} onClick={onBuscar}
              sx={{ bgcolor: color, '&:hover': { filter: 'brightness(0.85)' } }}>
              Ver reporte
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <PageHeader title="Reporte Diario" subtitle="Compras, Traspasos, Créditos y Traspasos no aceptados" icon={<Assessment />} />
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">Dashboard</Link>
          <Typography color="text.primary">Diario</Typography>
        </Breadcrumbs>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600 }, '& .Mui-selected': { color: farmaColors.primary }, '& .MuiTabs-indicator': { bgcolor: farmaColors.primary } }}>
        <Tab label={`Compras (${compras.length})`} />
        <Tab label={`Traspasos (${traspasos.length})`} />
        <Tab label={`Créditos (${credito.length})`} />
        <Tab label={`No Aceptados (${noAceptados.length})`} />
      </Tabs>

      {/* Compras */}
      <TabPanel value={tab} index={0}>
        <FiltroFechas filtros={filtrosCompras} setFiltros={setFiltrosCompras} onBuscar={buscarCompras} color="#27ae60"
          extraFields={<>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Laboratorio" value={filtrosCompras.laboratorio}
                onChange={e => setFiltrosCompras(p => ({ ...p, laboratorio: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="N° Factura" value={filtrosCompras.numeroFactura}
                onChange={e => setFiltrosCompras(p => ({ ...p, numeroFactura: e.target.value }))} />
            </Grid>
          </>}
        />
        <TablaCompras datos={compras} loading={loadingCompras} />
      </TabPanel>

      {/* Traspasos */}
      <TabPanel value={tab} index={1}>
        <FiltroFechas filtros={filtrosTraspasos} setFiltros={setFiltrosTraspasos} onBuscar={buscarTraspasos} color="#e67e22"
          extraFields={<>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Código producto" value={filtrosTraspasos.codigoProducto}
                onChange={e => setFiltrosTraspasos(p => ({ ...p, codigoProducto: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Producto" value={filtrosTraspasos.nombreProducto}
                onChange={e => setFiltrosTraspasos(p => ({ ...p, nombreProducto: e.target.value }))} />
            </Grid>
          </>}
        />
        <TablaTraspasos datos={traspasos} loading={loadingTraspasos} />
      </TabPanel>

      {/* Créditos */}
      <TabPanel value={tab} index={2}>
        <FiltroFechas filtros={filtrosCredito} setFiltros={setFiltrosCredito} onBuscar={buscarCredito} color="#e74c3c"
          extraFields={<>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Laboratorio" value={filtrosCredito.laboratorio}
                onChange={e => setFiltrosCredito(p => ({ ...p, laboratorio: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="N° Factura" value={filtrosCredito.numeroFactura}
                onChange={e => setFiltrosCredito(p => ({ ...p, numeroFactura: e.target.value }))} />
            </Grid>
          </>}
        />
        <TablaCredito datos={credito} loading={loadingCredito} />
      </TabPanel>

      {/* No Aceptados */}
      <TabPanel value={tab} index={3}>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<Search />} onClick={buscarNoAceptados}
            sx={{ bgcolor: '#2c3e50', '&:hover': { bgcolor: '#1a252f' } }}>
            Actualizar
          </Button>
        </Box>
        <TablaNoAceptados datos={noAceptados} loading={loadingNoAceptados} />
      </TabPanel>
    </Container>
  );
}