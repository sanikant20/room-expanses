import React, { useState } from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
    Badge,
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Menu,
    Typography,
    Tooltip,
    Button,
    CircularProgress,
    useMediaQuery,
} from '@mui/material';
import { NotificationsNoneRounded, NotificationsActiveRounded, DoneAllRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../../apis/notificationAPI/NotificationAPI';
import { useAuth } from '../../context/authContext';

const typeIcon = (type) => {
    switch (type) {
        case 'water': return '💧';
        case 'rice': return '🍚';
        case 'cleaning': return '🧹';
        case 'payment': return '💰';
        case 'settlement':
        case 'settlement-auto': return '📊';
        default: return '🔔';
    }
};

const NotifList = styled(List)(({ theme }) => ({
    padding: 0,
    '& .MuiListItemButton-root': {
        padding: '8px 12px',
        borderRadius: 2,
        margin: '2px 0',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));

const EmptyState = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
        <NotificationsNoneRounded sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
            No unread notifications
        </Typography>
    </Box>
);

export default function NotificationBell() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const { data, isLoading, isFetching } = useGetNotifications({ enabled: isAuthenticated, status: 'unread' });
    const markReadMutation = useMarkNotificationRead();
    const markAllMutation = useMarkAllNotificationsRead();

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleMarkRead = (id) => {
        markReadMutation.mutate({ id });
    };

    const handleMarkAll = () => {
        markAllMutation.mutate();
    };

    if (!isAuthenticated) return null;

    return (
        <React.Fragment>
            <Tooltip title="Notifications" arrow>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-label="Notifications"
                    sx={{
                        width: isMobile ? 34 : 40,
                        height: isMobile ? 34 : 40,
                        borderRadius: 2,
                        color: theme.palette.text.secondary,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        max={99}
                        invisible={unreadCount === 0}
                        overlap="circular"
                    >
                        {unreadCount > 0
                            ? <NotificationsActiveRounded sx={{ fontSize: isMobile ? 18 : 20 }} />
                            : <NotificationsNoneRounded sx={{ fontSize: isMobile ? 18 : 20 }} />}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    '& .MuiPaper-root': {
                        width: isMobile ? 300 : 360,
                        maxHeight: { xs: '70vh', md: '480px' },
                        borderRadius: 2,
                        boxShadow: theme.shadows[4],
                        border: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    },
                    '& .MuiList-root': {
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.25,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            startIcon={<DoneAllRounded />}
                            onClick={handleMarkAll}
                            disabled={markAllMutation.isPending}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {!isLoading && notifications.length === 0 && <EmptyState />}
                    {!isLoading && notifications.length > 0 && (
                        <NotifList>
                            {notifications.map((notif) => (
                                <ListItem key={notif._id} disablePadding>
                                    <ListItemButton
                                        onClick={() => !notif.read && handleMarkRead(notif._id)}
                                        sx={{
                                            bgcolor: notif.read ? 'transparent' : alpha(theme.palette.primary.main, 0.06),
                                            opacity: notif.read ? 0.7 : 1,
                                        }}
                                    >
                                        <Box component="span" sx={{ mr: 1.25, fontSize: 18 }}>
                                            {typeIcon(notif.type)}
                                        </Box>
                                        <ListItemText
                                            primary={notif.title}
                                            secondary={notif.message}
                                            primaryTypographyProps={{
                                                fontWeight: notif.read ? 500 : 700,
                                                fontSize: '0.875rem',
                                            }}
                                            secondaryTypographyProps={{
                                                fontSize: '0.78rem',
                                                sx: { mt: 0.25 },
                                            }}
                                        />
                                        {!notif.read && (
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: 'error.main',
                                                    flexShrink: 0,
                                                    ml: 1,
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </NotifList>
                    )}
                </Box>

                <Divider />
                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                        {isFetching ? 'Refreshing…' : `Last checked just now`}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => {
                            handleClose();
                            navigate('/notifications');
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        View read notifications
                    </Button>
                </Box>
            </Menu>
        </React.Fragment>
    );
}