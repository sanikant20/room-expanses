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
    Assessment,
    Balance,
    Groups,
    ReceiptLong,
    TrendingUp,
    DateRange,
    CheckCircle,
    Payments,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        title: 'Monthly Expense Tracking',
        description: 'Record and organize every expense for each Nepali month with clear categorization and dates.',
        icon: <ReceiptLong />,
    },
    {
        title: 'Room Partner Management',
        description: 'Manage room partners and see exactly what each person has paid, expected, and outstanding.',
        icon: <Groups />,
    },
    {
        title: 'Primary & Secondary Expenses',
        description: 'Primary expenses split across everyone; secondary expenses split only among the selected few.',
        icon: <Payments />,
    },
    {
        title: 'Nepali Month Calculations',
        description: 'All records follow Bikram Sambat months, matching the way you plan your monthly budget.',
        icon: <DateRange />,
    },
    {
        title: 'Automatic Settlements',
        description: 'See who paid what, who owes whom, and what each partner should receive — no manual math.',
        icon: <Balance />,
    },
    {
        title: 'Expense Reports & Analytics',
        description: 'Month-wise, partner-wise, and category-wise reports keep your room finances clear and aligned.',
        icon: <Assessment />,
    },
];

const heroHighlights = [
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

const LandingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const handleHash = () => {
            const anchor = window.location.hash.replace('#', '');
            if (anchor) {
                setTimeout(() => {
                    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        };
        handleHash();
        window.scrollTo({ top: 0 });
        return undefined;
    }, []);

    return (
        <Box sx={{ position: 'relative', pb: 4 }}>
            <Container maxWidth="xl">
                {/* ===== Hero Section ===== */}
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
                                    Manage Shared Room Expenses Without the Spreadsheet Chaos
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 640, mb: 3 }}>
                                    Track monthly expenses, manage room partners, calculate Primary and Secondary expenses, and settle contributions effortlessly using a Nepali monthly expense system.
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                    <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/login')} endIcon={<ArrowForward />} sx={{ px: 3, py: 1.2, borderRadius: 999 }}>
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                        sx={{ px: 3, py: 1.2, borderRadius: 999, color: 'common.white', borderColor: 'rgba(255,255,255,0.4)' }}
                                    >
                                        Explore Features
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Box sx={{ p: 2, borderRadius: 3, background: alpha(theme.palette.common.white, 0.14), backdropFilter: 'blur(10px)' }}>
                                    <Stack spacing={1.6}>
                                        {heroHighlights.map((item, index) => (
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

                {/* ===== Features Section ===== */}
                <Box id="features" sx={{ mt: 6, scrollMarginTop: 80 }}>
                    <Stack sx={{ alignItems: 'center', textAlign: 'center', mb: 4 }}>
                        <Chip label="Features" color="primary" sx={{ mb: 1.5, fontWeight: 700 }} />
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                            Everything your shared household needs
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 640, mt: 1 }}>
                            Built around the way roommates actually manage money — clear categories, Nepali months, and simple settlements.
                        </Typography>
                    </Stack>

                    <Grid container spacing={2.5}>
                        {features.map((item) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
                                <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}`, '&:hover': { transform: 'translateY(-3px)' } }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="h6" fontWeight={700}>{item.title}</Typography>
                                        </Box>
                                        <Typography color="text.secondary">{item.description}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ===== Product Preview Section ===== */}
                <Box id="product" sx={{ mt: 7, scrollMarginTop: 80 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Chip label="Product" color="secondary" sx={{ mb: 1.5, fontWeight: 700 }} />
                            <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, mb: 2 }}>
                                A control center for room finances
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
                                From a glanceable dashboard to per-partner settlement summaries, every screen helps you understand your current monthly expenses immediately.
                            </Typography>
                            <Stack spacing={1.5}>
                                {[
                                    'Dashboard overview of total, primary, and secondary expenses',
                                    'Partner contributions and outstanding balances at a glance',
                                    'Monthly expense trends and settlement summaries',
                                    'Searchable, sortable expense records for every Nepali month',
                                ].map((point) => (
                                    <Stack key={point} direction="row" spacing={1} alignItems="flex-start">
                                        <CheckCircle color="success" sx={{ mt: 0.25, fontSize: 20 }} />
                                        <Typography>{point}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>

                        {/* Realistic dashboard-style preview built from existing components */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 0, overflow: 'hidden' }}>
                                <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, background: alpha(theme.palette.primary.main, 0.04) }}>
                                    <Typography variant="subtitle1" fontWeight={700}>August 2083 — Overview</Typography>
                                    <Typography variant="caption" color="text.secondary">Room expenses summary</Typography>
                                </Box>
                                <Box sx={{ p: 2.5 }}>
                                    <Grid container spacing={2}>
                                        {[
                                            { label: 'Total Expenses', value: 'Rs 45,200', color: 'primary.main' },
                                            { label: 'Primary', value: 'Rs 30,000', color: 'secondary.main' },
                                            { label: 'Secondary', value: 'Rs 15,200', color: 'info.main' },
                                            { label: 'Active Partners', value: '4', color: 'success.main' },
                                        ].map((stat) => (
                                            <Grid size={{ xs: 6 }} key={stat.label}>
                                                <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                                                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                                    <Typography variant="h6" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>Partner contributions</Typography>
                                            <Chip label="Settled" color="success" size="small" />
                                        </Stack>
                                        <Stack spacing={1}>
                                            {[
                                                { name: 'Sanikant', value: 'Rs 12,500', pct: '72%' },
                                                { name: 'Aashish', value: 'Rs 8,200', pct: '48%' },
                                                { name: 'Bibek', value: 'Rs 5,300', pct: '31%' },
                                            ].map((row) => (
                                                <Box key={row.name}>
                                                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Typography variant="caption">{row.name}</Typography>
                                                        <Typography variant="caption" fontWeight={600}>{row.value}</Typography>
                                                    </Stack>
                                                    <Box sx={{ mt: 0.5, height: 6, borderRadius: 99, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                                        <Box sx={{ width: row.pct, height: '100%', borderRadius: 99, bgcolor: theme.palette.primary.main }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* ===== CTA Section ===== */}
                <Box id="contact" sx={{ mt: 7, scrollMarginTop: 80 }}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            textAlign: 'center',
                            p: { xs: 4, md: 6 },
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, mb: 1.5 }}>
                            Ready to settle the room accounts?
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
                            Sign in to the admin panel and start managing your shared room expenses today.
                        </Typography>
                        <Button variant="contained" size="large" onClick={() => navigate('/login')} endIcon={<ArrowForward />} sx={{ px: 4, py: 1.2, borderRadius: 999 }}>
                            Login
                        </Button>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;
