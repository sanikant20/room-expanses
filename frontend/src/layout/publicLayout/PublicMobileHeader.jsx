import React, { useCallback, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Drawer,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Tooltip,
    alpha,
    useTheme,
    styled
} from '@mui/material';
import {
    CloseRounded,
    WbSunnyRounded,
    NightsStayRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../context/themeModeContext';
import LoginModalButton from './LoginModalButton';
import PublicMenuContent from './PublicMenuContent';
import HealthStatus from '../../components/HealthStatus';

const LogoImage = styled('img')(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: 'contain',
    flexShrink: 0,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(0.5),
}));

const PublicMobileHeader = ({ mobileMenuOpen, onMenuClose }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleThemeMode } = useThemeMode();

    // Close drawer on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && mobileMenuOpen && onMenuClose) {
                onMenuClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [mobileMenuOpen, onMenuClose]);

    const handleLogoClick = useCallback(() => {
        navigate('/');
        if (onMenuClose) onMenuClose();
    }, [navigate, onMenuClose]);

    const handleThemeToggle = useCallback(() => {
        toggleThemeMode();
        if (onMenuClose) onMenuClose();
    }, [toggleThemeMode, onMenuClose]);

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                color="default"
                sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.85),
                    backdropFilter: 'blur(8px)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    boxShadow: 'none',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                    '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                    },
                }}
            >
                <Toolbar
                    sx={{
                        justifyContent: 'space-between',
                        py: 1,
                        px: 2,
                    }}
                >
                    {/* Left side - Logo */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                            transition: 'opacity 0.2s ease',
                            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                        }}
                        onClick={handleLogoClick}
                        role="link"
                        tabIndex={0}
                        aria-label="We Roomies"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLogoClick(); } }}
                    >
                        <LogoImage
                            src="/logo.png"
                            alt="We Roomies logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                letterSpacing: '-0.5px',
                                fontSize: '1.1rem',
                                lineHeight: 1.2,
                            }}
                        >
                            We Roomies
                        </Typography>
                    </Box>

                    {/* Right side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Server status (dot only) */}
                        <HealthStatus compact />

                        {/* Theme Toggle */}
                        <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} arrow>
                            <IconButton
                                onClick={toggleThemeMode}
                                size="small"
                                aria-label={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                    backgroundColor: 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                                        borderColor: alpha(theme.palette.divider, 0.3),
                                    },
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                }}
                            >
                                {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 20 }} /> : <NightsStayRounded sx={{ fontSize: 20 }} />}
                            </IconButton>
                        </Tooltip>

                        <LoginModalButton isMobile />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer Menu */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={onMenuClose}
                ModalProps={{
                    keepMounted: false,
                    slotProps: {
                        backdrop: {
                            sx: {
                                backgroundColor: alpha(theme.palette.common.black, 0.4),
                                backdropFilter: 'blur(4px)',
                            },
                        },
                    },
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '100%',
                        maxWidth: 320,
                        bgcolor: alpha(theme.palette.background.paper, 0.98),
                        backdropFilter: 'blur(16px)',
                        borderLeft: 'none',
                        boxShadow: `-4px 0 24px ${alpha(theme.palette.common.black, 0.08)}`,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '@media (prefers-reduced-motion: reduce)': {
                            transition: 'none',
                        },
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Drawer Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            pb: 1.5,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                            }}
                            onClick={handleLogoClick}
                            role="link"
                            tabIndex={0}
                            aria-label="We Roomies"
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLogoClick(); } }}
                        >
                            <LogoImage
                                src="/logo.png"
                                alt="We Roomies logo"
                                onError={(e) => { e.target.style.display = 'none'; }}
                                sx={{ width: 36, height: 36 }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    fontSize: '1rem',
                                    lineHeight: 1.2,
                                }}
                            >
                                We Roomies
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onMenuClose}
                            size="small"
                            aria-label="Close menu"
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                color: theme.palette.text.secondary,
                                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                backgroundColor: 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                                },
                                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                            }}
                        >
                            <CloseRounded sx={{ fontSize: 22 }} />
                        </IconButton>
                    </Box>

                    {/* Mobile Menu Items */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                        <List sx={{ py: 0 }}>
                            <PublicMenuContent isMobile onMenuClose={onMenuClose} />
                        </List>

                        {/* Theme Toggle */}
                        <Divider sx={{ my: 1.5 }} />
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={handleThemeToggle}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1.5,
                                    minHeight: 44,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                                    },
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                }}
                            >
                                {mode === 'dark'
                                    ? <WbSunnyRounded sx={{ mr: 1.5, color: theme.palette.primary.main, fontSize: 22 }} />
                                    : <NightsStayRounded sx={{ mr: 1.5, color: theme.palette.primary.main, fontSize: 22 }} />
                                }
                                <ListItemText
                                    primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9375rem' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default PublicMobileHeader;
