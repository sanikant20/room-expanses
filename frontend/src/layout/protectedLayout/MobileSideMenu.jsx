import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

export default function MobileSideMenu({ open, toggleDrawer }) {
    const theme = useTheme();
    const navigate = useNavigate();

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
                    background: theme.palette.background.paper,
                    width: 300,
                    boxShadow: theme.shadows[4],
                    borderRadius: 0,
                },
            }}
        >
            <Stack sx={{ width: '100%', height: '100%' }}>
                {/* Brand Header */}
                <Stack
                    direction="row"
                    sx={{
                        p: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        background: theme.palette.background.paper,
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
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.5px',
                                    fontSize: '1rem',
                                    color: 'text.primary',
                                }}
                            >
                                We Roomies
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    lineHeight: 1.2,
                                    fontWeight: 500,
                                }}
                            >
                                Room Expenses Management
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Close Button */}
                    <IconButton
                        onClick={toggleDrawer(false)}
                        sx={{
                            color: 'text.secondary',
                            backgroundColor: alpha(theme.palette.action.hover, 0.3),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.action.hover, 0.6),
                            },
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
                    borderTop: `1px solid ${theme.palette.divider}`,
                }}>
                    {/* Logout Button */}
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<LogoutRoundedIcon />}
                        onClick={handleLogout}
                        sx={{
                            py: 1.25,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Logout
                    </Button>
                </Stack>
            </Stack>
        </Drawer>
    );
}