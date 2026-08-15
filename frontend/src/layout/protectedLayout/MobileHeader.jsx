import React, { useState, useEffect } from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Box, Chip, IconButton, Tooltip, Fade } from '@mui/material';
import { MenuTwoTone, NotificationsNoneRounded, CalendarTodayRounded, WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import { tabsClasses } from '@mui/material/Tabs';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OptionsMenu from './Optionsmenu';
import dayjs from 'dayjs';
import { useDateContext } from '../../context/useDateContext';
import { useThemeMode } from '../../context/useThemeMode';
import { dateFormatToToggledDate } from '../../utils/dateFormatToToggleDate';
import MobileSideMenu from './MobileSideMenu';

const LogoImage = styled('img')(({ theme }) => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    objectFit: 'cover',
    flexShrink: 0,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
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

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1200,
    width: 56,
    height: 56,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'scale(1.05)',
        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
    },
}));

export default function MobileHeader() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [, setCurrentTime] = useState(dayjs());
    const [showFAB, setShowFAB] = useState(false);
    const { useNepaliDate, toggleDateMode } = useDateContext();
    const { mode, toggleThemeMode } = useThemeMode();
    const navigate = useNavigate();

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Show FAB when scrolling down on mobile
    useEffect(() => {
        const handleScroll = () => {
            setShowFAB(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
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
                                aria-label={t('header.openSidebar')}
                                onClick={toggleDrawer(true)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                        transform: 'scale(1.05)',
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
                                    width: 48,
                                    height: 48,
                                    objectFit: 'contain',
                                    borderRadius: '10%',
                                    backgroundColor: theme.palette.common.white,
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Date Display Chip */}
                            <Tooltip
                                title={useNepaliDate ? 'Switch to English date' : 'Switch to Nepali date'}
                                arrow
                                placement="bottom"
                            >
                                <DateChip
                                    icon={<CalendarTodayRounded />}
                                    label={dateFormatToToggledDate(new Date(), useNepaliDate)}
                                    size="small"
                                    variant="outlined"
                                    onClick={toggleDateMode}
                                    sx={{ cursor: 'pointer' }}
                                />
                            </Tooltip>

                            <Tooltip title={mode === 'dark' ? t('header.lightMode') : t('header.darkMode')} arrow>
                                <IconButton
                                    onClick={toggleThemeMode}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                        },
                                        width: 34,
                                        height: 34,
                                    }}
                                >
                                    {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 18 }} /> : <NightsStayRounded sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Tooltip>
                            <OptionsMenu />
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Floating Action Button for Mobile */}
            <Fade in={showFAB}>
                <FloatingActionButton
                    onClick={scrollToTop}
                    size="medium"
                    aria-label="Scroll to top"
                >
                    <MenuTwoTone sx={{ transform: 'rotate(90deg)' }} />
                </FloatingActionButton>
            </Fade>

            {/* Mobile Side Menu */}
            <MobileSideMenu
                open={open}
                toggleDrawer={toggleDrawer}
            />
        </>
    );
}
