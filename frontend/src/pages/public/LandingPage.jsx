import React, { useEffect } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ArrowForward,
    CheckCircleRounded,
    LoginRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetPublicTurnState } from '../../apis/turnAPI/TurnAPI';
import { getTurnTypeConfig, TURN_TYPES } from '../../utils/turnTypeConfig';

const PartnerAvatar = ({ partner, size = 56 }) => (
    <Avatar
        src={partner?.image || '/noAvatar.svg'}
        alt={partner?.name}
        sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700 }}
    >
        {partner?.name?.charAt(0)}
    </Avatar>
);

const TurnRow = ({ label, partner, sub, highlight = false, emptyText = '—' }) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
        <PartnerAvatar partner={partner} size={48} />
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={highlight ? 700 : 600}>
                {partner?.name || emptyText}
            </Typography>
            {sub && (
                <Typography variant="caption" color="text.secondary">
                    {sub}
                </Typography>
            )}
        </Box>
    </Stack>
);

const LiveTurnCard = ({ config, turn }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const configured = !!turn?.rotation?.configured;
    const currentTurn = turn?.currentTurn || null;
    const nextTurn = turn?.nextTurn || null;
    const cycle = turn?.cycle || 1;
    const lastCompleted = turn?.lastCompleted || null;
    const TypeIcon = config.icon;

    return (
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
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Chip label={`Live ${config.label.toLowerCase()} turn`} color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
                            {config.title}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 520 }}>
                            See whose turn it is to bring {config.noun} for the room — updated live.
                        </Typography>
                    </Box>

                    <Box sx={{ p: 3, borderRadius: 3, background: alpha(theme.palette.common.white, 0.14), backdropFilter: 'blur(10px)', textAlign: 'center', minWidth: 260 }}>
                        {configured && currentTurn ? (
                            <>
                                <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.9, letterSpacing: '0.08em' }}>
                                    CURRENT TURN — CYCLE {cycle}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ justifyContent: 'center', mt: 1.5 }}>
                                    <PartnerAvatar partner={currentTurn} size={64} />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="h5" fontWeight={800}>{currentTurn.name}</Typography>
                                        {nextTurn && (
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Next: {nextTurn.name}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    startIcon={<LoginRounded />}
                                    onClick={() => navigate('/login')}
                                    sx={{ mt: 2, borderRadius: 999, fontWeight: 600 }}
                                >
                                    Partner Login
                                </Button>
                            </>
                        ) : (
                            <>
                                <TypeIcon sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="h6" fontWeight={700}>No active turn</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                    The {config.label.toLowerCase()} turn rotation is not configured yet.
                                </Typography>
                            </>
                        )}
                    </Box>
                </Stack>

                {configured && (
                    <>
                        <Divider sx={{ my: 3, borderColor: alpha(theme.palette.common.white, 0.2) }} />
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 2, sm: 3 }}
                            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: alpha(theme.palette.common.white, 0.15) }} />}
                        >
                            <Box sx={{ flex: 1 }}>
                                <TurnRow
                                    label="Current turn"
                                    partner={currentTurn}
                                    sub={`Cycle ${cycle}`}
                                    highlight
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                {nextTurn ? (
                                    <TurnRow label="Next turn" partner={nextTurn} />
                                ) : (
                                    <TurnRow
                                        label="Next turn"
                                        partner={null}
                                        emptyText="Cycle ending"
                                        sub="No partners left — the cycle will restart"
                                    />
                                )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                {lastCompleted ? (
                                    <TurnRow
                                        label="Recent"
                                        partner={lastCompleted.broughtByPartner}
                                        sub={
                                            lastCompleted.assignedPartner?._id !== lastCompleted.broughtByPartner?._id && lastCompleted.assignedPartner?.name
                                                ? `Brought ${config.noun} for ${lastCompleted.assignedPartner.name}`
                                                : `Brought ${config.noun}`
                                        }
                                    />
                                ) : (
                                    <TurnRow label="Recent" partner={null} sub={`No ${config.noun} brought yet`} />
                                )}
                            </Box>
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const LandingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const turnTypes = Object.keys(TURN_TYPES);

    const { data: waterTurn } = useGetPublicTurnState({ type: 'water' });
    const { data: riceTurn } = useGetPublicTurnState({ type: 'rice' });
    const { data: cleaningTurn } = useGetPublicTurnState({ type: 'cleaning' });

    const turnData = { water: waterTurn, rice: riceTurn, cleaning: cleaningTurn };
    const turnConfigs = turnTypes.map((type) => getTurnTypeConfig(type));

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return (
        <Box sx={{ position: 'relative', pb: 4 }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    {turnConfigs.map((config) => (
                        <LiveTurnCard
                            key={config.type}
                            config={config}
                            turn={turnData[config.type]}
                        />
                    ))}
                </Stack>

                {/* ===== CTA Section ===== */}
                <Box sx={{ mt: 6 }}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            textAlign: 'center',
                            p: { xs: 4, md: 5 },
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, mb: 1.5 }}>
                            Sign in to manage your turns
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
                            Room partners can mark when they bring water, rice, or clean the flat, and the admin can configure and manage the rotation order.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
                            <Button variant="contained" size="large" onClick={() => navigate('/login')} endIcon={<ArrowForward />} sx={{ px: 4, py: 1.2, borderRadius: 999 }}>
                                Admin Login
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{ px: 4, py: 1.2, borderRadius: 999 }}
                            >
                                Partner Login
                            </Button>
                        </Stack>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;