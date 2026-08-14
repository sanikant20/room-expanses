import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ArrowForward,
    BusinessCenter,
    Groups,
    Inventory2,
    ReceiptLong,
    RocketLaunch,
    TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const highlights = [
        {
            title: t('landing.heroCard1Title', 'Distributor growth'),
            description: t('landing.heroCard1Desc', 'Track new enrollments, active leaders, and steady network expansion.'),
            icon: <Groups />, 
        },
        {
            title: t('landing.heroCard2Title', 'Order visibility'),
            description: t('landing.heroCard2Desc', 'Monitor fulfilment, inventory movement, and customer demand in real time.'),
            icon: <Inventory2 />, 
        },
        {
            title: t('landing.heroCard3Title', 'Commission control'),
            description: t('landing.heroCard3Desc', 'Keep payout workflows efficient with clear payment and report tracking.'),
            icon: <ReceiptLong />, 
        },
    ];

    return (
        <Box sx={{ position: 'relative', pb: 4 }}>
            <Container maxWidth="xl">
                <Card
                    sx={{
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'common.white',
                        overflow: 'hidden',
                        boxShadow: `0 20px 50px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Chip label={t('landing.badge', 'Direct selling admin portal')} color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                                <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
                                    {t('landing.heroTitle', 'Run your Arora network with confidence')}
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 640, mb: 3 }}>
                                    {t('landing.heroSubtitle', 'Bring distributor performance, order flow, and commission visibility into one elegant control center for your team.')}
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                    <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/login')} endIcon={<ArrowForward />} sx={{ px: 3, py: 1.2, borderRadius: 999 }}>
                                        {t('landing.primaryCta', 'Access admin panel')}
                                    </Button>
                                    <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} sx={{ px: 3, py: 1.2, borderRadius: 999, color: 'common.white', borderColor: 'rgba(255,255,255,0.4)' }}>
                                        {t('landing.secondaryCta', 'View dashboard')} 
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Box sx={{ p: 2, borderRadius: 3, background: alpha(theme.palette.common.white, 0.14), backdropFilter: 'blur(10px)' }}>
                                    <Stack spacing={1.6}>
                                        {highlights.map((item, index) => (
                                            <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.common.white, 0.18) }}>
                                                    {item.icon}
                                                </Box>
                                                <Box>
                                                    <Typography fontWeight={700}>{item.title}</Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.description}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <BusinessCenter color="primary" />
                                    <Typography variant="h6" fontWeight={700}>{t('landing.section1Title', 'Executive overview')}</Typography>
                                </Box>
                                <Typography color="text.secondary">{t('landing.section1Desc', 'Get a clear snapshot of team performance, daily activity, and growth priorities at a glance.')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <RocketLaunch color="primary" />
                                    <Typography variant="h6" fontWeight={700}>{t('landing.section2Title', 'Fast action tools')}</Typography>
                                </Box>
                                <Typography color="text.secondary">{t('landing.section2Desc', 'Jump into order processing, distributor management, and reporting without delay.')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TrendingUp color="primary" />
                                    <Typography variant="h6" fontWeight={700}>{t('landing.section3Title', 'Growth-ready insights')}</Typography>
                                </Box>
                                <Typography color="text.secondary">{t('landing.section3Desc', 'Use live summaries to keep your direct-selling operations aligned with business goals.')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;
