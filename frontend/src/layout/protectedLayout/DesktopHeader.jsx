import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import {
    AccessTimeRounded,
    CalendarTodayRounded,
    CloseTwoTone,
    EmojiPeopleRounded,
    MenuTwoTone,
    PersonRounded,
    WbSunnyRounded,
    NightsStayRounded,
} from '@mui/icons-material';
import { Tooltip, Box, IconButton, Chip, keyframes } from '@mui/material';
import dayjs from 'dayjs';
import OptionsMenu from './Optionsmenu';
import { useThemeMode } from '../../context/useThemeMode';
import { convertToBSFormat } from '../../utils/dateConverter';
import BreadcrumbsPath from './BreadcrumbsPath';
import { getAuthData } from '../../helper/getAuthData';

// Animation for shimmer effect
const shimmer = keyframes`
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
`;

const InfoChip = ({ label, color = 'primary' }) => {
    const theme = useTheme();
    return (
        <Tooltip title={label} arrow>
            <Chip
                label={label}
                size="small"
                // icon={icon}
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    height: 34,
                    borderRadius: 2,
                    background: alpha(theme.palette[color].main, 0.08),
                    color: theme.palette[color].main,
                    border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                        background: alpha(theme.palette[color].main, 0.15),
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease',
                        boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.2)}`,
                    },
                }}
            />
        </Tooltip>
    );
};

export default function DesktopHeader({ onToggleSidebar, sidebarOpen }) {
    const theme = useTheme();
    const { mode, toggleThemeMode } = useThemeMode();
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.hour();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };
    const authData = getAuthData();

    // Get greeting icon based on time of day
    const getGreetingIcon = () => {
        const hour = currentTime.hour();
        if (hour < 12) return <WbSunnyRounded sx={{ fontSize: 16 }} />;
        if (hour < 17) return <WbSunnyRounded sx={{ fontSize: 16 }} />;
        return <NightsStayRounded sx={{ fontSize: 16 }} />;
    };

    return (
        <Box
            sx={{
                display: { xs: 'none', md: 'block' },
                width: '100%',
                position: 'sticky',
                top: 0,
                p: 0.5,
                zIndex: 1100,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%)`,
                    pointerEvents: 'none',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                    animation: `${shimmer} 3s infinite`,
                    pointerEvents: 'none',
                },
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 1.5,
                    maxWidth: '1700px',
                    mx: 'auto',
                    position: 'relative',
                    zIndex: 1,
                }}
                spacing={2}
            >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={onToggleSidebar}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: 0,
                                height: 0,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'translate(-50%, -50%)',
                                transition: 'width 0.6s, height 0.6s',
                            },
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.15),
                                transform: 'scale(1.05)',
                                '&::before': {
                                    width: 100,
                                    height: 100,
                                },
                            },
                        }}
                    >
                        {sidebarOpen ? <CloseTwoTone /> : <MenuTwoTone />}
                    </IconButton>
                    <BreadcrumbsPath />
                </Stack>

                <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                    <InfoChip label={convertToBSFormat(new Date()) || ''} icon={<CalendarTodayRounded sx={{ fontSize: 16 }} />} />
                    <InfoChip label={currentTime.format('HH:mm:ss')} icon={<AccessTimeRounded sx={{ fontSize: 16 }} />} />
                    <InfoChip
                        label={`${getGreeting()}, ${authData?.FullName?.split(' ')[0] || 'User'}!`}
                        icon={getGreetingIcon()}
                    />
                    <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} arrow>
                        <IconButton
                            onClick={toggleThemeMode}
                            size="small"
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                background: alpha(theme.palette.primary.main, 0.08),
                                color: theme.palette.primary.main,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.15),
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 16 }} /> : <NightsStayRounded sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                    <OptionsMenu />
                </Stack>
            </Stack>

            {/* Subtle bottom accent line */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.5)}, transparent)`,
                }}
            />
        </Box>
    );
}
