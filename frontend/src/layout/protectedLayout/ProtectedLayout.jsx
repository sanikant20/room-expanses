import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { alpha, Box, Chip, Stack, Typography, CircularProgress } from '@mui/material';
import DesktopSideBar from './DesktopSideBar';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

export default function ProtectedLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <DesktopSideBar open={sidebarOpen} onToggle={handleToggleSidebar} />
            <MobileHeader />

                {/* Main content */}
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        width: { md: sidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 70px)' },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        mt: { xs: '64px', md: 0 }, // 64px is the typical AppBar height
                    })}
                >
                    {/* Sticky Header Container - Hidden on mobile, shown on desktop */}
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: (theme) => theme.zIndex.appBar,
                            flexShrink: 0,
                            display: { xs: 'none', md: 'block' }, // Hide on mobile, show on desktop
                        }}
                    >
                        <DesktopHeader onToggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />
                    </Box>

                    {/* Scrollable Content Area */}
                    <Box
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            pb: { xs: 2, md: 0 },
                        }}
                    >
                        <Stack
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                                mx: 1,
                                p: 1,
                                pt: { xs: 1, md: 2 },
                            }}
                        >
                            <Suspense
                                fallback={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: '60vh',
                                            width: '100%',
                                        }}
                                    >
                                        <CircularProgress size={40} thickness={4} />
                                    </Box>
                                }
                            >
                                <Outlet />
                            </Suspense>
                        </Stack>
                    </Box>
                </Box>
            </Box>
    );
}