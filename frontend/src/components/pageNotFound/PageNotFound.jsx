import React from 'react';
import { Box, Typography, Container, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ArrowBack, Home } from '@mui/icons-material';

const PageNotFound = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 2,
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '6rem', sm: '8rem' },
                        lineHeight: 1,
                        color: 'text.primary',
                        letterSpacing: '-0.06em',
                    }}
                >
                    404
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Page not found
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
                    The page you're looking for doesn't exist or has been moved.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                        Go back
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Home />}
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                        {isAuthenticated ? 'Dashboard' : 'Home'}
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
};

export default PageNotFound;