import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Badge
} from '@mui/material'
import {
  Security,
  Inventory,
  Warehouse,
  ShoppingCart,
  SwapHoriz,
  PointOfSale,
  Receipt,
  AccountBalance,
  Assessment,
  TrendingUp,
  Menu as MenuIcon,
  Notifications,
  ExitToApp
} from '@mui/icons-material'

const drawerWidth = 280

const menuItems = [
  { text: 'Configuracion', icon: <Security />, path: '/access-security', active: true },
  { text: 'Inventarios', icon: <Inventory />, path: '/inventory' },
  { text: 'Almacenes', icon: <Warehouse />, path: '/warehouse' },
  { text: 'Compras y Proveedores', icon: <ShoppingCart />, path: '/purchases' },
  { text: 'Inter-Sucursales', icon: <SwapHoriz />, path: '/transfers' },
  { text: 'Ventas', icon: <PointOfSale />, path: '/sales' },
  { text: 'Facturación', icon: <Receipt />, path: '/billing' },
  { text: 'Contabilidad', icon: <AccountBalance />, path: '/accounting' },
  { text: 'Reportes', icon: <Assessment />, path: '/reports' },
  { text: 'Presupuesto', icon: <TrendingUp />, path: '/budget' }
]

function DashboardLayout({ children, onLogout }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #2D3748 0%, #1A202C 100%)' }}>
      {/* Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar 
          sx={{ 
            bgcolor: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', 
            width: 64, 
            height: 64,
            margin: '0 auto',
            mb: 2,
            boxShadow: '0 4px 20px rgba(255,107,53,0.3)'
          }}
        >
          <Typography variant="h6" fontWeight="bold">BA</Typography>
        </Avatar>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Brasil Admin
        </Typography>
        <Chip 
          label="BRASIL" 
          size="small" 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)', 
            color: 'white',
            mt: 1
          }} 
        />
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="overline"
          sx={{ 
            px: 2, 
            py: 1, 
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 600,
            letterSpacing: 1.2
          }}
        >
          NAVEGACIÓN PRINCIPAL
        </Typography>

        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                cursor: 'pointer',
                background: item.active ? 
                  'linear-gradient(135deg, rgba(74,95,255,0.2) 0%, rgba(42,63,223,0.2) 100%)' : 
                  'transparent',
                border: item.active ? '1px solid rgba(74,95,255,0.3)' : 'none',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <ListItemIcon sx={{ color: item.active ? '#4A5FFF' : 'rgba(255,255,255,0.7)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  sx: { 
                    color: item.active ? 'white' : 'rgba(255,255,255,0.8)',
                    fontWeight: item.active ? 600 : 400
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Enhanced App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(74,95,255,0.15)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              Sifarm
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="Facturación electrónica en línea: (Activado)"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                display: { xs: 'none', sm: 'flex' }
              }}
            />
            
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  width: 40,
                  height: 40
                }}
              >
                BA
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Brasil Admin
                </Typography>
              </Box>
            </Box>

            <IconButton color="inherit" onClick={onLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Enhanced Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Enhanced Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout