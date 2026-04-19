import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Button,
} from "@mui/material";
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
  KeyboardArrowDown,
} from "@mui/icons-material";
import { farmaColors } from "../../app/theme";
import { getFilteredMenuItems } from "../../config/menuBuilder";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../../modules/notifications/hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 280;
const collapsedDrawerWidth = 60;

function DashboardLayout({ children, onLogout, currentUser, userPermissions }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();

  // Obtener menú filtrado según permisos del usuario
  const elementosMenu = useMemo(() => {
    // Usar userPermissions (prop) o currentUser.apiPermissions (fallback)
    const perms = userPermissions || currentUser?.apiPermissions;

    if (!perms) {
      console.warn("No hay permisos disponibles para construir el menú");
      return [];
    }

    console.log("Generando menú con permisos:", perms.length);
    const filtered = getFilteredMenuItems(perms);
    return filtered;
  }, [currentUser, userPermissions]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getPrimerNombreApellido = (nombreCompleto) => {
    if (!nombreCompleto) return "U";
    const palabras = nombreCompleto.trim().split(" ");
    if (palabras.length === 1) return palabras[0];
    return `${palabras[0]} ${palabras[palabras.length - 1]}`;
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
    if (!collapsed) {
      setOpenSubMenus({});
    }
  };

  const handleSubMenuToggle = (menuIndex) => {
    if (collapsed) return;

    setOpenSubMenus((prev) => {
      const newState = {};
      if (prev[menuIndex]) {
        return {};
      }
      newState[menuIndex] = true;
      return newState;
    });
  };

  const handleMenuClick = (e, path, hasSubItems = false, menuIndex = null) => {
    const base = import.meta.env.BASE_URL || "/";

    if (e.ctrlKey || e.button === 1) {
      const fullPath = base + path.replace(/^\//, "");
      window.open(fullPath, "_blank");
      return;
    }

    if (hasSubItems && !collapsed) {
      handleSubMenuToggle(menuIndex);
    } else {
      if (location.pathname === path) {
        navigate(path, { replace: true });
        window.dispatchEvent(new Event("forceReload"));
      } else {
        navigate(path);
      }

      if (isMobile) setMobileOpen(false);
    }
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleEditProfile = () => {
    navigate("/profile");
    handleUserMenuClose();
  };

  const isActiveItem = (itemPath) => {
    if (itemPath === "/users") {
      return (
        location.pathname === "/users" || location.pathname.startsWith("/users")
      );
    }
    return location.pathname.startsWith(itemPath);
  };

  const toggleNotifications = (event) => {
    event.stopPropagation();

    const next = !showNotifications;
    setShowNotifications(next);

    if (next) {
      setUnreadNotificationsCount(0); // 👈 limpia badge
    }
  };

  useEffect(() => {
    if (!user?.codigoSucursal_ID) return;

    // Primera carga
    fetchNotifications(user.codigoSucursal_ID);

    // 🔥 polling liviano SOLO para badge
    const interval = setInterval(() => {
      fetchNotifications(user.codigoSucursal_ID, true);
    }, 60000); // cada 60s (seguro para producción)

    return () => clearInterval(interval);
  }, [user?.codigoSucursal_ID, fetchNotifications]);

  useEffect(() => {
    setUnreadNotificationsCount(notifications.length || 0);
  }, [notifications]);

  // Cierra notificaciones al hacer clic en cualquier parte del layout
  const handleLayoutClick = () => {
    if (showNotifications) setShowNotifications(false);
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        background: farmaColors.primary,
        width: collapsed ? collapsedDrawerWidth : drawerWidth,
        transition: "width 0.3s ease",
      }}
    >
      {/* Profile Section - SIMPLIFICADO */}
      <Box
        sx={{
          p: collapsed ? 1 : 3,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            width: collapsed ? 40 : 64,
            height: collapsed ? 40 : 64,
            mb: collapsed ? 0 : 2,
            mx: "auto",
            boxShadow: "0 4px 20px rgba(255,255,255,0.2)",
            border: `3px solid ${farmaColors.alpha.primary30}`,
            transition: "all 0.3s ease",
            fontWeight: 800,
            fontSize: collapsed ? "1rem" : "1.5rem",
          }}
        >
          {`${currentUser?.nombres?.charAt(0) || ""}${currentUser?.apellidos?.charAt(0) || ""}`.toUpperCase() ||
            "U"}
        </Avatar>

        {!collapsed && (
          <>
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
            >
              {`${currentUser?.nombres?.split(" ")[0] || ""} ${currentUser?.apellidos?.split(" ")[0] || ""}`}
            </Typography>
          </>
        )}
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          px: collapsed ? 0.5 : 2,
          py: 1,
          height: "calc(100vh - 160px)",
          overflow: "hidden",
        }}
      >
        {!collapsed && (
          <Typography
            variant="overline"
            sx={{
              px: 2,
              py: 1,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              letterSpacing: 1.2,
              fontSize: "0.7rem",
            }}
          >
            NAVEGACIÓN PRINCIPAL
          </Typography>
        )}

        <Box
          sx={{
            px: collapsed ? 0 : 1,
            height: "calc(100% - 40px)",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <List sx={{ py: 0 }}>
            {elementosMenu.map((item, index) => {
              const isActive = isActiveItem(item.ruta);
              const hasSubItems =
                item.subElementos && item.subElementos.length > 0;
              const isSubMenuOpen = openSubMenus[index];

              return (
                <React.Fragment key={index}>
                  <ListItem
                    onClick={(e) =>
                      handleMenuClick(e, item.ruta, hasSubItems, index)
                    }
                    sx={{
                      mb: 0.5,
                      cursor: "pointer",
                      minHeight: 48,
                      background: isActive
                        ? "rgba(255,255,255,0.18)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid rgba(255,255,255,0.9)"
                        : "3px solid transparent",
                      borderRadius: isActive ? "0 10px 10px 0" : 2,
                      border: "none",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.05)",
                        transform: collapsed ? "none" : "translateX(4px)",
                        transition: "all 0.2s ease",
                      },
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: collapsed ? 1 : 2,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
                        minWidth: collapsed ? "unset" : 56,
                        mr: collapsed ? 0 : 2,
                        justifyContent: "center",
                      }}
                    >
                      {React.createElement(item.icono)}
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.texto}
                          primaryTypographyProps={{
                            variant: "body2",
                            sx: {
                              color: "rgba(255,255,255,0.8)",
                              fontWeight: 400,
                            },
                          }}
                        />
                        {hasSubItems && (
                          <IconButton
                            size="small"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
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
                        {item.subElementos.map((subItem, subIndex) => (
                          <ListItem
                            key={subIndex}
                            onClick={(e) => handleMenuClick(e, subItem.ruta)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              cursor: "pointer",
                              minHeight: 40,
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: "rgba(255,255,255,0.5)",
                                minWidth: 32,
                              }}
                            >
                              <Typography sx={{ fontSize: "1rem" }}>
                                ›
                              </Typography>
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.texto}
                              primaryTypographyProps={{
                                variant: "body2",
                                sx: {
                                  color: "rgba(255,255,255,0.7)",
                                  fontSize: "0.85rem",
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>

          {/* Mensaje si no hay menús disponibles */}
          {elementosMenu.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                No tienes permisos asignados
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }} onClick={handleLayoutClick}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: `calc(100% - ${
              collapsed ? collapsedDrawerWidth : drawerWidth
            }px)`,
          },
          ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          background: farmaColors.secondary,
          backdropFilter: "blur(10px)",
          borderBottom: "none",
          boxShadow: `0 4px 20px ${farmaColors.alpha.secondary20}`,
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
                cursor: "pointer",
              }}
              onClick={() => navigate("/dashboard")}
            >
              Farma Dinámica
            </Typography>
          </Box>

          {/* Sección derecha del AppBar - VERSIÓN MEJORADA */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Chip de Facturación */}
            <Chip
              label="Facturación electrónica en línea: (Activada)"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                display: { xs: "none", lg: "flex" },
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            />

            {/* Badge de Notificaciones */}
            <Box sx={{ position: "relative" }}>
              <IconButton color="inherit" onClick={toggleNotifications}>
                <Badge
                  badgeContent={
                    unreadNotificationsCount > 0
                      ? unreadNotificationsCount
                      : null
                  }
                  color="error"
                >
                  <Notifications />
                </Badge>
              </IconButton>
              <NotificationPanel
                open={showNotifications}
                onClose={() => setShowNotifications(false)}
                onUnreadCountChange={setUnreadNotificationsCount}
              />
            </Box>

            {/* Usuario con Nombre Visible - REDISEÑADO */}
            <Button
              onClick={handleUserMenuClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "white",
                textTransform: "none",
                px: 2,
                py: 1,
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: farmaColors.primary,
                  width: 40,
                  height: 40,
                  fontWeight: 800,
                  border: "2px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                {`${currentUser?.nombres?.charAt(0) || ""}${currentUser?.apellidos?.charAt(0) || ""}`.toUpperCase() ||
                  "U"}
              </Avatar>

              <Box
                sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontSize: "0.9rem",
                  }}
                >
                  {`${currentUser?.nombres?.split(" ")[0] || ""} ${currentUser?.apellidos?.split(" ")[0] || ""}`}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.85,
                    fontSize: "0.7rem",
                    display: "block",
                  }}
                >
                  {currentUser?.rol || "Sin rol"}
                </Typography>
              </Box>

              <KeyboardArrowDown sx={{ ml: 0.5 }} />
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
          sx: { mt: 1, minWidth: 180 },
        }}
      >
        <MenuItem onClick={handleEditProfile}>
          <Edit sx={{ mr: 2, color: farmaColors.primary }} />
          Editar Perfil
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ExitToApp sx={{ mr: 2, color: farmaColors.secondary }} />
          Salir
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { md: 0 },
          transition: "width 0.3s ease",
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              overflow: "hidden",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: "width 0.3s ease",
              overflow: "hidden",
            },
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
          width: {
            md: `calc(100% - ${
              collapsed ? collapsedDrawerWidth : drawerWidth
            }px)`,
          },
          minHeight: "100vh",
          bgcolor: "#F5F6FA",
          mt: 8,
          transition: "all 0.3s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
