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
    ReceiptLong,
    RocketLaunch,
    TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const highlights = [
        {
            title: 'Fair expense splitting',
            description: 'Primary expenses split across everyone, secondary expenses split among the selected few.',
            icon: <Groups />,
        },
        {
            title: 'Nepali month tracking',
            description: 'Record and report expenses by Bikram Sambat months, the way you plan your budget.',
            icon: <ReceiptLong />,
        },
        {
            title: 'Automatic settlement',
            description: 'Know exactly who paid what, who owes, and who receives — no manual math.',
            icon: <TrendingUp />,
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
                                <Chip label="Room expenses, solved" color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                                <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
                                    Share the room, share the costs
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 640, mb: 3 }}>
                                    Track shared expenses, compare contributions, and settle balances in Nepali months — all in one elegant control center.
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                    <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/login')} endIcon={<ArrowForward />} sx={{ px: 3, py: 1.2, borderRadius: 999 }}>
                                        Access admin panel
                                    </Button>
                                    <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} sx={{ px: 3, py: 1.2, borderRadius: 999, color: 'common.white', borderColor: 'rgba(255,255,255,0.4)' }}>
                                        View dashboard
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
                                    <Typography variant="h6" fontWeight={700}>Room partner insights</Typography>
                                </Box>
                                <Typography color="text.secondary">See each partner's paid, expected, and outstanding amounts at a glance.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <RocketLaunch color="primary" />
                                    <Typography variant="h6" fontWeight={700}>Quick recording tools</Typography>
                                </Box>
                                <Typography color="text.secondary">Add expenses in seconds and keep every housemate informed without delay.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TrendingUp color="primary" />
                                    <Typography variant="h6" fontWeight={700}>Growth-ready reports</Typography>
                                </Box>
                                <Typography color="text.secondary">Use monthly, partner-wise, and category-wise reports to keep your room finances aligned.</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;
