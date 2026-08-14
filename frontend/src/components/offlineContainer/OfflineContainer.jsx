import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import { WifiOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const OfflineContainer = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleRetry = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 1500);
    };

    return (
        <Box
            sx={(theme) => ({
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : 'background.default',
            })}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: 'warning.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                        }}
                    >
                        <WifiOff sx={{ fontSize: 32, color: 'warning.contrastText' }} />
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {t('offline.title')}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                        {t('offline.message')}
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                        onClick={handleRetry}
                        disabled={loading}
                        sx={{ textTransform: 'none', fontWeight: 500, mt: 1 }}
                    >
                        {loading ? t('button.loading') : t('button.retry')}
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
                        {t('offline.retry')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};
