import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import {
    AccessTimeRounded,
    CalendarTodayRounded,
    CloseTwoTone,
    EmojiPeopleRounded,
    MenuTwoTone,
    WbSunnyRounded,
    NightsStayRounded,
} from '@mui/icons-material';
import { Tooltip, Box, IconButton, Chip } from '@mui/material';
import dayjs from 'dayjs';
import OptionsMenu from './Optionsmenu';
import { useThemeMode } from '../../context/useThemeMode';
import { convertToBSFormat } from '../../utils/dateConverter';
import BreadcrumbsPath from './BreadcrumbsPath';
import { getAuthData } from '../../helper/getAuthData';

const InfoChip = ({ label, color = 'primary' }) => {
    const theme = useTheme();
    return (
        <Tooltip title={label} arrow>
            <Chip
                label={label}
                size="small"
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    height: 34,
                    borderRadius: '999px',
                    background: alpha(theme.palette[color].main, 0.08),
                    color: theme.palette[color].main,
                    border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
                    '&:hover': {
                        background: alpha(theme.palette[color].main, 0.15),
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
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 1.25,
                    maxWidth: '1700px',
                    mx: 'auto',
                }}
                spacing={2}
            >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                    <IconButton
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
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
                            aria-label={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                color: theme.palette.text.secondary,
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            {mode === 'dark' ? <WbSunnyRounded sx={{ fontSize: 16 }} /> : <NightsStayRounded sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                    <OptionsMenu />
                </Stack>
            </Stack>
        </Box>
    );
}
