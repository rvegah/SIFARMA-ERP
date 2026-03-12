import React from 'react';
import { 
    Box, 
    Typography, 
    IconButton, 
    Avatar, 
    Button, 
    Divider, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    Paper,
    Fade,
    Link,
    Chip
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Circle as CircleIcon,
    NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { farmaColors } from '../../app/theme';

const NotificationPanel = ({ open, onClose, anchorEl }) => {
    // Mock notifications based on the HTML template
    const notifications = [
        {
            id: 1,
            name: 'Juan Pérez',
            avatar: 'JP',
            message: 'Te etiquetó en un comentario: "¡Excelente trabajo!"',
            time: 'Hace 5m',
            read: false,
            type: 'comment'
        },
        {
            id: 2,
            name: 'María García',
            avatar: 'MG',
            message: 'Te envió una solicitud de amistad',
            time: 'Hace 30m',
            read: false,
            type: 'friend'
        },
        {
            id: 3,
            name: 'Carlos López',
            avatar: 'CL',
            message: 'Te envió un mensaje privado',
            time: 'Hace 2h',
            read: false,
            type: 'message'
        },
        {
            id: 4,
            name: 'Ana Martínez',
            avatar: 'AM',
            message: 'Le gustó tu publicación',
            time: 'Ayer',
            read: true,
            type: 'like'
        },
        {
            id: 5,
            name: 'Pedro González',
            avatar: 'PG',
            message: 'Compartió una publicación tuya',
            time: 'Hace 2d',
            read: true,
            type: 'share'
        }
    ];

    if (!open) return null;

    return (
        <Fade in={open}>
            <Paper
                elevation={10}
                sx={{
                    position: 'absolute',
                    top: '60px',
                    right: '20px',
                    width: '380px',
                    maxWidth: '90vw',
                    maxHeight: '600px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 2000,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                {/* Header */}
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff'
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000' }}>
                        Notificaciones
                    </Typography>
                    <Button 
                        size="small" 
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            color: farmaColors.primary,
                            '&:hover': { bgcolor: farmaColors.alpha.primary10 }
                        }}
                    >
                        Marcar todo como leído
                    </Button>
                </Box>

                {/* List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <NotificationsNoneIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                            <Typography variant="body2">No tienes notificaciones</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {notifications.map((notif, index) => (
                                <ListItem 
                                    key={notif.id}
                                    alignItems="flex-start"
                                    sx={{ 
                                        py: 1.5,
                                        px: 2,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        bgcolor: notif.read ? 'transparent' : farmaColors.alpha.primary10,
                                        '&:hover': { bgcolor: notif.read ? '#f5f5f5' : farmaColors.alpha.primary20 },
                                        position: 'relative',
                                        '&::before': !notif.read ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '4px',
                                            background: farmaColors.gradients.primary
                                        } : {}
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ 
                                            background: farmaColors.gradients.primary,
                                            fontWeight: 700,
                                            fontSize: '0.875rem'
                                        }}>
                                            {notif.avatar}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#000' }}>
                                                    {notif.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {notif.time}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4, mb: 1 }}>
                                                    {notif.message}
                                                </Typography>
                                                {notif.type === 'friend' && (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            sx={{ 
                                                                background: farmaColors.gradients.primary,
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                py: 0.5
                                                            }}
                                                        >
                                                            Aceptar
                                                        </Button>
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small" 
                                                            sx={{ 
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                py: 0.5
                                                            }}
                                                        >
                                                            Rechazar
                                                        </Button>
                                                    </Box>
                                                )}
                                                {notif.type === 'message' && (
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        sx={{ 
                                                            background: farmaColors.gradients.primary,
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            py: 0.5
                                                        }}
                                                    >
                                                        Responder
                                                    </Button>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <IconButton 
                                        size="small" 
                                        sx={{ 
                                            position: 'absolute', 
                                            right: 8, 
                                            top: 8,
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            '.MuiListItem-root:hover &': { opacity: 1 }
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ 
                    p: 1.5, 
                    textAlign: 'center', 
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    bgcolor: '#fff'
                }}>
                    <Link 
                        href="#" 
                        underline="hover" 
                        sx={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 700, 
                            color: farmaColors.primary 
                        }}
                    >
                        Ver todas las notificaciones
                    </Link>
                </Box>
            </Paper>
        </Fade>
    );
};

export default NotificationPanel;
