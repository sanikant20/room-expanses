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
import { useAuthData } from '../../context/authContext';

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
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
        borderRadius: 0, // Remove border radius
    },
}));

const LogoContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'space-between' : 'center',
    padding: theme.spacing(1.25, 1.5),
    minHeight: 72,
    position: 'relative',
    cursor: 'pointer',
    color: 'text.primary',
    borderBottom: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
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
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.white : alpha(theme.palette.common.white, 0.9),
    boxShadow: theme.shadows[1],
}));

const UserSection = styled(Stack, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    padding: open ? theme.spacing(1) : theme.spacing(0.5),
    gap: theme.spacing(1.5),
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    flexDirection: open ? 'row' : 'column',
    justifyContent: open ? 'flex-start' : 'center',
}));

export default function DesktopSideBar({ open }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const authData = useAuthData();

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
                                    fontWeight: 600,
                                    lineHeight: 1.1,
                                    letterSpacing: '0.25px',
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
                                    letterSpacing: '0.5px',
                                    fontWeight: 400,
                                }}
                            >
                                Room Expenses Management
                            </Typography>
                        </Stack>
                    )}
                </LogoContent>
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
                            {authData?.name || 'User'}
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
                            {authData?.email || authData?.phone || ''}
                        </Typography>
                    </Box>
                )}
            </UserSection>
        </Drawer>
    );
}