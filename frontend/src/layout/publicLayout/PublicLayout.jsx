import React, { useState } from 'react';
import { alpha, Box, Container, Stack } from '@mui/material';
import PublicDesktopHeader from './PublicDesktopHeader';
import PublicMobileHeader from './PublicMobileHeader';
import { Outlet } from 'react-router-dom';
import PublicFooter from './PublicFooter';

const PublicLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Mobile Header - Fixed at top */}
            <Box
                sx={{
                    display: { xs: 'block', md: 'none' },
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: (theme) => theme.zIndex.appBar,
                }}
            >
                <PublicMobileHeader
                    mobileMenuOpen={mobileMenuOpen}
                    onMenuToggle={handleMobileMenuToggle}
                    onMenuClose={handleMobileMenuClose}
                />
            </Box>

            {/* Desktop Header - Fixed at top */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: (theme) => theme.zIndex.appBar,
                }}
            >
                <PublicDesktopHeader />
            </Box>

            {/* Main content area with padding for fixed headers */}
            <Box
                component="main"
                sx={(theme) => ({
                    flexGrow: 1,
                    backgroundColor: theme.vars
                        ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                        : alpha(theme.palette.background.default, 1),
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    // Add padding top to account for fixed headers
                    pt: { xs: '72px', md: '80px' },
                    width: '100%',
                })}
            >
                {/* Scrollable Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        width: '100%',
                    }}
                >
                    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
                        <Outlet />
                    </Container>
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        mt: 'auto',
                        width: '100%',
                    }}
                >
                    <PublicFooter />
                </Box>
            </Box>
        </Box>
    );
};

export default PublicLayout;