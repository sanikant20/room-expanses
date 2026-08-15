import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useTranslation } from 'react-i18next';
import MenuContent from './MenuContent';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Switch, Box, Collapse, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore, PersonRounded } from '@mui/icons-material';
import { getAuthData } from '../../helper/getAuthData';

export default function MobileSideMenu({ open, toggleDrawer }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const authData = getAuthData();

    const handleLogout = () => {
        navigate('/logout');
        toggleDrawer(false)();
    };

    const handleLogoClick = () => {
        navigate('/dashboard');
        toggleDrawer(false)();
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={toggleDrawer(false)}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 2,
                [`& .${drawerClasses.paper}`]: {
                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
                    width: 300,
                    boxShadow: `-4px 0 24px ${alpha(theme.palette.common.black, 0.1)}`,
                    borderRadius: 0, // Add this line to remove border radius
                },
            }}
        >
            <Stack sx={{ width: '100%', height: '100%' }}>
                {/* Brand Header with Gradient */}
                <Stack
                    direction="row"
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: alpha(theme.palette.common.white, 0.1),
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: alpha(theme.palette.common.white, 0.08),
                        },
                    }}
                >
                    <Stack direction="row" sx={{ gap: 2, alignItems: 'center', zIndex: 1 }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="logo"
                            onClick={handleLogoClick}
                            sx={{
                                width: 48,
                                height: 48,
                                objectFit: 'contain',
                                borderRadius: '10%',
                                backgroundColor: theme.palette.common.white,
                                cursor: 'pointer',
                            }}
                        />
                        <Stack sx={{ minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.5px',
                                    fontSize: '1rem',
                                }}
                            >
                                {t('project.name')}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    opacity: 0.9,
                                    lineHeight: 1.2,
                                    fontWeight: 500,
                                }}
                            >
                                {t('project.description')}
                            </Typography>
                            <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', mt: 0.5 }}>
                                <PersonRounded sx={{ fontSize: 12, opacity: 0.8 }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        opacity: 0.9,
                                        lineHeight: 1.2,
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {authData?.FullName || authData?.UserName || 'User'}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>

                    {/* Close Button */}
                    <IconButton
                        onClick={toggleDrawer(false)}
                        sx={{
                            color: 'white',
                            backgroundColor: alpha(theme.palette.common.white, 0.1),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.common.white, 0.2),
                                transform: 'rotate(90deg)',
                                transition: 'transform 0.3s ease',
                            },
                            transition: 'all 0.2s ease',
                            zIndex: 1,
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>

                {/* Menu Content */}
                <Box sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    backgroundColor: 'background.paper',
                    '&::-webkit-scrollbar': {
                        width: 4,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.primary.main, 0.3),
                        borderRadius: 4,
                    },
                }}>
                    <MenuContent
                        sidebarCollapsed={false}
                        onMenuSelect={toggleDrawer(false)}
                    />
                </Box>

                {/* Footer Section with Settings */}
                <Stack sx={{
                    p: 2,
                    gap: 1,
                    backgroundColor: 'background.paper',
                    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                    {/* Logout Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<LogoutRoundedIcon />}
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
                            textTransform: 'none',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
                            },
                        }}
                    >
                        {t('menu.logout')}
                    </Button>
                </Stack>
            </Stack>
        </Drawer>
    );
}