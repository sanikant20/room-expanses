import React, { useState } from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { MenuTwoTone, CalendarTodayRounded, WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import { tabsClasses } from '@mui/material/Tabs';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router-dom';
import OptionsMenu from './Optionsmenu';
import NotificationBell from './NotificationBell';
import { useThemeMode } from '../../context/useThemeMode';
import { convertToBSFormat } from '../../utils/dateConverter';
import MobileSideMenu from './MobileSideMenu';

const LogoImage = styled('img')(({ theme }) => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    objectFit: 'cover',
    flexShrink: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.main,
}));

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1, 2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
    minHeight: '64px !important',
    [`& ${tabsClasses.flexContainer}`]: {
        gap: '8px',
        p: '8px',
        pb: 0,
    },
}));

const DateChip = styled(Chip)(({ theme }) => ({
    fontSize: '0.7rem',
    fontWeight: 600,
    height: 34,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .MuiChip-icon': {
        marginLeft: '8px',
        marginRight: '-4px',
        color: theme.palette.primary.main,
        fontSize: '16px',
    },
    '& .MuiChip-label': {
        px: 1.5,
        fontWeight: 600,
    },
}));

export default function MobileHeader() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const { mode, toggleThemeMode } = useThemeMode();
    const navigate = useNavigate();

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    display: { xs: 'block', md: 'none' },
                    boxShadow: 'none',
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    borderRadius: 0,
                }}
            >
                <Toolbar variant="regular">
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexGrow: 1,
                            width: '100%',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <IconButton
                                aria-label="Open sidebar"
                                onClick={toggleDrawer(true)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${theme.palette.divider}`,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            >
                                <MenuTwoTone sx={{ fontSize: 22 }} />
                            </IconButton>

                            <Box
                                component="img"
                                src="/logo.png"
                                alt="logo"
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    objectFit: 'contain',
                                    borderRadius: '10%',
                                    backgroundColor: theme.palette.common.white,
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Current date (Nepali BS)" arrow placement="bottom">
                                <DateChip
                                    icon={<CalendarTodayRounded />}
                                    label={convertToBSFormat(new Date()) || ''}
                                    size="small"
                                    variant="outlined"
                                />
                            </Tooltip>

                            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} arrow>
                                <IconButton
                                    onClick={toggleThemeMode}
                                    size="small"
                                    aria-label={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        color: theme.palette.text.secondary,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                            color: theme.palette.primary.main,
                                        },
                                        width: 34,
                                        height: 34,
                                    }}
                                >
                                    {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 18 }} /> : <NightsStayRounded sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Tooltip>
                            <NotificationBell />
                            <OptionsMenu />
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Mobile Side Menu */}
            <MobileSideMenu
                open={open}
                toggleDrawer={toggleDrawer}
            />
        </>
    );
}
