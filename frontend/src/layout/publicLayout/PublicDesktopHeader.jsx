import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Container,
    Typography,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
    styled
} from '@mui/material';
import { WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../context/themeModeContext';
import LoginModalButton from './LoginModalButton';
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

const PublicDesktopHeader = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleThemeMode } = useThemeMode();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            color="default"
            sx={{
                bgcolor: alpha(theme.palette.background.paper, scrolled ? 0.98 : 0.85),
                backdropFilter: scrolled ? 'blur(12px)' : 'blur(8px)',
                borderBottom: `1px solid ${alpha(theme.palette.divider, scrolled ? 0.12 : 0.06)}`,
                boxShadow: scrolled
                    ? `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}`
                    : 'none',
                transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                },
            }}
        >
            <Container maxWidth="xl">
                <Toolbar
                    sx={{
                        justifyContent: 'space-between',
                        py: 1,
                        px: { xs: 2, md: 0 },
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
                                fontSize: '1.25rem',
                                lineHeight: 1.2,
                            }}
                        >
                            We Roomies
                        </Typography>
                    </Box>

                    {/* Right side - Server status, Theme Toggle & Login */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HealthStatus />
                        <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} arrow>
                            <IconButton
                                onClick={toggleThemeMode}
                                size="small"
                                aria-label={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    color: theme.palette.text.secondary,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                                    backgroundColor: 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                                        borderColor: alpha(theme.palette.divider, 0.3),
                                        transform: 'scale(1.04)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.96)',
                                    },
                                    '@media (prefers-reduced-motion: reduce)': {
                                        transition: 'none',
                                        '&:hover': { transform: 'none' },
                                        '&:active': { transform: 'none' },
                                    },
                                }}
                            >
                                {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 20 }} /> : <NightsStayRounded sx={{ fontSize: 20 }} />}
                            </IconButton>
                        </Tooltip>

                        <LoginModalButton />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default PublicDesktopHeader;