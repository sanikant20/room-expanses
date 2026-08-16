import * as React from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import OptionsMenu from './Optionsmenu';
import MenuContent from './MenuContent';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../../helper/getAuthData';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    width: open ? drawerWidth : collapsedDrawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    }),
    [`& .${drawerClasses.paper}`]: {
        width: open ? drawerWidth : collapsedDrawerWidth,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.paper} 100%)`,
        borderRadius: 0, // Remove border radius
    },
}));

const LogoContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'space-between' : 'center',
    padding: theme.spacing(0.5, 1.5),
    minHeight: 72,
    position: 'relative',
    cursor: 'pointer',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: 'white',
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
        pointerEvents: 'none',
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
        pointerEvents: 'none',
    },
}));

const LogoContent = styled(Stack)(({ theme }) => ({
    direction: 'row',
    gap: theme.spacing(1),
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
}));

const LogoImage = styled(Avatar)(({ theme }) => ({
    width: 44,
    height: 44,
    border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.white : alpha(theme.palette.common.white, 0.2),
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
}));

const UserSection = styled(Stack, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    padding: open ? theme.spacing(1) : theme.spacing(0.5),
    gap: theme.spacing(1.5),
    alignItems: 'center',
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
    flexDirection: open ? 'row' : 'column',
    justifyContent: open ? 'flex-start' : 'center',
}));

export default function DesktopSideBar({ open }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const authData = getAuthData();

    return (
        <Drawer variant="permanent" open={open} sx={{ display: { xs: 'none', md: 'block' } }}>
            <LogoContainer open={open} onClick={() => navigate('/dashboard')}>
                <LogoContent direction="row">
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="logo"
                        sx={{
                            width: 48,
                            height: 48,
                            objectFit: 'contain',
                            borderRadius: '10%',
                            backgroundColor: theme.palette.common.white,
                        }}
                    />
                    {open && (
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    letterSpacing: '0.25px',
                                    color: 'white',
                                }}
                            >
                                The Roomies
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    opacity: 0.9,
                                    lineHeight: 1.2,
                                    letterSpacing: '0.75px',
                                    fontWeight: 400,
                                    color: 'white',
                                }}
                            >
                                Room Expenses Management
                            </Typography>
                        </Stack>
                    )}
                </LogoContent>

                {/* Optional: Add a subtle close indicator when expanded */}
                {open && (
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: alpha(theme.palette.common.white, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.common.white, 0.2),
                            },
                        }}
                    >
                        {/* You can add a collapse icon here if needed */}
                    </Box>
                )}
            </LogoContainer>

            <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <MenuContent sidebarCollapsed={!open} />
            </Box>

            <UserSection direction="row" open={open}>
                <OptionsMenu />
                {open && (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                lineHeight: 1.3,
                                color: 'text.primary',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            {authData?.FullName || 'User'}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: alpha(theme.palette.text.secondary, 0.75),
                                lineHeight: 1.2,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.7rem',
                            }}
                        >
                            {authData?.Email || authData?.Phone || authData?.ComID || ''}
                        </Typography>
                    </Box>
                )}
            </UserSection>
        </Drawer>
    );
}