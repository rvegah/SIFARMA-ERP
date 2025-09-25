import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  ShoppingCart,
  SwapHoriz,
  CreditCard,
  Inventory,
  Warning
} from '@mui/icons-material'

const tarjetasEstadisticas = [
  {
    titulo: 'Ventas del día',
    valor: '393',
    color: '#00BCD4',
    icono: <TrendingUp />,
    cambio: '+12.5%',
    tipoCambio: 'positive'
  },
  {
    titulo: 'Compras del día',
    valor: '91',
    color: '#4CAF50',
    icono: <ShoppingCart />,
    cambio: '+8.2%',
    tipoCambio: 'positive'
  },
  {
    titulo: 'Traspasos del día',
    valor: '27',
    color: '#FF9800',
    icono: <SwapHoriz />,
    cambio: '-2.1%',
    tipoCambio: 'negative'
  },
  {
    titulo: 'Compras a crédito por pagar',
    valor: '1',
    color: '#F44336',
    icono: <CreditCard />,
    cambio: 'Urgente',
    tipoCambio: 'warning'
  }
]

function Dashboard() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panel Administración - Vista general del sistema
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tarjetasEstadisticas.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card 
              sx={{
                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}CC 100%)`,
                color: 'white',
                borderRadius: 3,
                boxShadow: `0 8px 32px ${card.color}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 48px ${card.color}60`
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {card.valor}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {card.titulo}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 2, 
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                  }}>
                    {card.icono}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={card.cambio}
                    size="small"
                    sx={{
                      bgcolor: card.tipoCambio === 'positive' ? 'rgba(255,255,255,0.2)' :
                              card.tipoCambio === 'negative' ? 'rgba(0,0,0,0.2)' : 'rgba(255,193,7,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Button 
                    size="small" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                    endIcon={<TrendingUp />}
                  >
                    Más info
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory color="primary" />
              Sistema SIFARMA funcionando correctamente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Todos los módulos están operativos y sincronizados
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={95} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(74,95,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)'
                }
              }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Sistema optimizado al 95%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Próximos pasos
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label="En desarrollo" 
                size="small" 
                color="warning" 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Módulo de Gestión de Acceso y Seguridad
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="small"
              sx={{ 
                background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
                boxShadow: '0 4px 15px rgba(74,95,255,0.3)',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(74,95,255,0.4)'
                }
              }}
            >
              Iniciar configuración
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard