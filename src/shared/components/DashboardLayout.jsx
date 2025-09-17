import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Badge,
  Collapse,
  Menu,
  MenuItem,
  Button
} from '@mui/material'
import {
  Security,
  Inventory,
  Warehouse,
  ShoppingCart,
  SwapHoriz,
  PointOfSale,
  Assessment,
  Menu as MenuIcon,
  Notifications,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  Group,
  Edit,
  KeyboardArrowDown
} from '@mui/icons-material'

const drawerWidth = 280
const collapsedDrawerWidth = 60

// Configuración completa de menús con submenús
const menuItems = [
   {
    text: 'Usuarios',
    icon: <Group />,
    path: '/users',  // Ruta original mantenida
    subItems: [
      { text: 'Nuevo Usuario', path: '/users/new' },
      { text: 'Lista de Usuarios', path: '/users/list' }
    ]
  },
  {
    text: 'Productos',
    icon: <Inventory />,
    path: '/productos',
    subItems: [
      { text: 'Ver Productos', path: '/productos/ver' },
      { text: 'Agregar Producto', path: '/productos/agregar' }
    ]
  },
  {
    text: 'Compras',
    icon: <ShoppingCart />,
    path: '/compras',
    subItems: [
      { text: 'Nueva Compra', path: '/compras/nueva' },
      { text: 'Nueva Salida', path: '/compras/salida' },
      { text: 'Compras a Credito', path: '/compras/credito' },
      { text: 'Ingresos del Día', path: '/compras/ingresos' }
    ]
  },
  {
    text: 'Proveedor',
    icon: <Warehouse />,
    path: '/proveedor',
    subItems: [
      { text: 'Nuevo Proveedor', path: '/proveedor/nuevo' }
    ]
  },
  {
    text: 'Ventas',
    icon: <PointOfSale />,
    path: '/ventas',
    subItems: [
      { text: 'Nueva Venta', path: '/ventas/nueva' },
      { text: 'Realizar Pedidos', path: '/ventas/pedidos' },
      { text: 'Mis Pedidos', path: '/ventas/mis-pedidos' }
    ]
  },
  {
    text: 'Traspasos',
    icon: <SwapHoriz />,
    path: '/traspasos',
    subItems: [
      { text: 'Nuevo Traspaso', path: '/traspasos/nuevo' }
    ]
  },
  {
    text: 'Reportes',
    icon: <Assessment />,
    path: '/reportes',
    subItems: [
      { text: 'Reporte Diario', path: '/reportes/diario' },
      { text: 'Reporte Mensual', path: '/reportes/mensual' },
      { text: 'Reporte Todos', path: '/reportes/todos' },
      { text: 'Reporte Productos', path: '/reportes/productos' },
      { text: 'Control de sistema', path: '/reportes/control' },
      { text: 'Reporte H. Ventas', path: '/reportes/horario-ventas' },
      { text: 'Reporte por sucursales', path: '/reportes/sucursales' },
      { text: 'Reporte Vencimientos', path: '/reportes/vencimientos' },
      { text: 'Reporte Stock Almacenes', path: '/reportes/stock' },
      { text: 'Productos mas vendidos', path: '/reportes/mas-vendidos' },
      { text: 'Inventario Diario', path: '/reportes/inventario-diario' },
      { text: 'Inventario por Líneas', path: '/reportes/inventario-lineas' },
      { text: 'Kardex', path: '/reportes/kardex' },
      { text: 'Reporte Pedidos', path: '/reportes/pedidos' }
    ]
  },
  {
    text: 'Configuracion',
    icon: <Security />,
    path: '/configuracion',
    subItems: [
      { text: 'Ordenar sucursales', path: '/configuracion/sucursales' }
    ]
  }
]

// Sucursales disponibles
const sucursales = [
  { name: 'SAN MARTIN', code: 'SM', percentage: '[15.56%]' },
  { name: 'BRASIL', code: 'BR', percentage: '[-1.11%]' },
  { name: 'URUGUAY', code: 'UY', percentage: '[-37.78%]' },
  { name: 'TIQUIPAYA', code: 'TQ', percentage: '[7.78%]' }
]

function DashboardLayout({ children, onLogout }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [openSubMenus, setOpenSubMenus] = useState({})
  const [currentSucursal, setCurrentSucursal] = useState(sucursales[1]) // BRASIL por defecto
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [sucursalMenuAnchor, setSucursalMenuAnchor] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed)
    if (!collapsed) {
      setOpenSubMenus({}) // Cerrar submenús al colapsar
    }
  }

  // FUNCIÓN ACORDEÓN CORREGIDA
  const handleSubMenuToggle = (menuIndex) => {
    if (collapsed) return
    
    setOpenSubMenus(prev => {
      const newState = {}
      // Si el menú clickeado ya está abierto, lo cerramos (todos quedan cerrados)
      if (prev[menuIndex]) {
        return {}
      }
      // Si no está abierto, cerramos todos y abrimos solo este
      newState[menuIndex] = true
      return newState
    })
  }

  const handleMenuClick = (path, hasSubItems = false, menuIndex = null) => {
    if (hasSubItems && !collapsed) {
      handleSubMenuToggle(menuIndex)
    } else {
      navigate(path)
      if (isMobile) {
        setMobileOpen(false)
      }
    }
  }

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleSucursalMenuClick = (event) => {
    setSucursalMenuAnchor(event.currentTarget)
  }

  const handleSucursalMenuClose = () => {
    setSucursalMenuAnchor(null)
  }

  const handleSucursalChange = (sucursal) => {
    setCurrentSucursal(sucursal)
    handleSucursalMenuClose()
  }

  const handleEditProfile = () => {
    navigate('/profile')  // Ruta para perfil personal separada
    handleUserMenuClose()
  }

  const isActiveItem = (itemPath) => {
    if (itemPath === '/users') {
      return location.pathname === '/users' || location.pathname.startsWith('/users')
    }
    return location.pathname.startsWith(itemPath)
  }

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      background: 'linear-gradient(180deg, #2D3748 0%, #1A202C 100%)',
      width: collapsed ? collapsedDrawerWidth : drawerWidth,
      transition: 'width 0.3s ease'
    }}>
      {/* Profile Section */}
      <Box sx={{ 
        p: collapsed ? 1 : 3, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
      }}>
        <Button
          onClick={!collapsed ? handleSucursalMenuClick : undefined}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            width: '100%',
            p: collapsed ? 0.5 : 2
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', 
              width: collapsed ? 40 : 64, 
              height: collapsed ? 40 : 64,
              mb: collapsed ? 0 : 2,
              boxShadow: '0 4px 20px rgba(255,107,53,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography variant={collapsed ? "body2" : "h6"} fontWeight="bold">
              {currentSucursal.code}
            </Typography>
          </Avatar>
          
          {!collapsed && (
            <>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Brasil Admin
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip 
                  label={currentSucursal.name} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white'
                  }} 
                />
                <KeyboardArrowDown />
              </Box>
            </>
          )}
        </Button>
      </Box>

      {/* Navigation */}
      <Box sx={{ 
        px: collapsed ? 0.5 : 2, 
        py: 1,
        height: 'calc(100vh - 160px)',
        overflow: 'hidden'
      }}>
        {!collapsed && (
          <Typography
            variant="overline"
            sx={{ 
              px: 2, 
              py: 1, 
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              letterSpacing: 1.2,
              fontSize: '0.7rem'
            }}
          >
            NAVEGACIÓN PRINCIPAL
          </Typography>
        )}

        <Box sx={{ 
          px: collapsed ? 0 : 1,
          height: 'calc(100% - 40px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <List sx={{ py: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = isActiveItem(item.path)
              const hasSubItems = item.subItems && item.subItems.length > 0
              const isSubMenuOpen = openSubMenus[index]
              
              return (
                <React.Fragment key={index}>
                  <ListItem
                    onClick={() => handleMenuClick(item.path, hasSubItems, index)}
                    sx={{
                      borderRadius: collapsed ? 1 : 2,
                      mb: 0.5,
                      cursor: 'pointer',
                      minHeight: 48,
                      background: isActive ? 
                        'linear-gradient(135deg, rgba(74,95,255,0.2) 0%, rgba(42,63,223,0.2) 100%)' : 
                        'transparent',
                      border: isActive ? '1px solid rgba(74,95,255,0.3)' : 'none',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.05)',
                        transform: collapsed ? 'none' : 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      },
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1 : 2
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: isActive ? '#4A5FFF' : 'rgba(255,255,255,0.7)',
                        minWidth: collapsed ? 'unset' : 56,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    
                    {!collapsed && (
                      <>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: { 
                              color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                              fontWeight: isActive ? 600 : 400
                            }
                          }}
                        />
                        {hasSubItems && (
                          <IconButton 
                            size="small" 
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                          >
                            {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                      </>
                    )}
                  </ListItem>

                  {/* Submenús */}
                  {hasSubItems && !collapsed && (
                    <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 2 }}>
                        {item.subItems.map((subItem, subIndex) => (
                          <ListItem
                            key={subIndex}
                            onClick={() => handleMenuClick(subItem.path)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              cursor: 'pointer',
                              minHeight: 40,
                              '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.05)'
                              }
                            }}
                          >
                            <ListItemIcon 
                              sx={{ 
                                color: 'rgba(255,255,255,0.5)',
                                minWidth: 32
                              }}
                            >
                              <Typography sx={{ fontSize: '1rem' }}>›</Typography>
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                sx: { 
                                  color: 'rgba(255,255,255,0.7)',
                                  fontSize: '0.85rem'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              )
            })}
          </List>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          background: 'linear-gradient(135deg, #4A5FFF 0%, #667EEA 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(74,95,255,0.15)',
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={isMobile ? handleDrawerToggle : handleCollapseToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/dashboard')}
            >
              Sifarm
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="Facturación electrónica en línea: (Activada)"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                display: { xs: 'none', sm: 'flex' }
              }}
            />
            
            <IconButton color="inherit">
              <Badge badgeContent={14} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <Button
              onClick={handleUserMenuClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
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
              <KeyboardArrowDown />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menús desplegables */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        disableScrollLock={true}
        PaperProps={{
          sx: { mt: 1, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleEditProfile}>
          <Edit sx={{ mr: 2 }} />
          Editar Perfil
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ExitToApp sx={{ mr: 2 }} />
          Salir
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sucursalMenuAnchor}
        open={Boolean(sucursalMenuAnchor)}
        onClose={handleSucursalMenuClose}
        PaperProps={{
          sx: { mt: 1, minWidth: 200 }
        }}
      >
        {sucursales.map((sucursal, index) => (
          <MenuItem 
            key={index}
            onClick={() => handleSucursalChange(sucursal)}
            selected={currentSucursal.name === sucursal.name}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{sucursal.name}</Typography>
              <Typography 
                variant="caption" 
                color={sucursal.percentage.includes('-') ? 'error' : 'success.main'}
              >
                {sucursal.percentage}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { md: collapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { md: 0 },
          transition: 'width 0.3s ease'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              overflow: 'hidden' // Sin scroll
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: 'width 0.3s ease',
              overflow: 'hidden' // Sin scroll
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          mt: 8,
          transition: 'all 0.3s ease'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout