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
    Grid,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ArrowForward,
    CheckCircleRounded,
    LocalDrinkRounded,
    LoginRounded,
    PendingRounded,
    WaterDropRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetPublicTurnState } from '../../apis/turnAPI/TurnAPI';

const PartnerAvatar = ({ partner, size = 56 }) => (
    <Avatar
        src={partner?.image || '/noAvatar.svg'}
        alt={partner?.name}
        sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700 }}
    >
        {partner?.name?.charAt(0)}
    </Avatar>
);

const LandingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { data: turn } = useGetPublicTurnState();

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const configured = !!turn?.rotation?.configured;
    const currentTurn = turn?.currentTurn || null;
    const nextTurn = turn?.nextTurn || null;
    const pending = turn?.pending || [];
    const cycle = turn?.cycle || 1;
    const lastCompleted = turn?.lastCompleted || null;

    return (
        <Box sx={{ position: 'relative', pb: 4 }}>
            <Container maxWidth="lg">
                {/* ===== Water Turn Hero ===== */}
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
                                <Chip label="Live water turn" color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                                <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
                                    Water Turn
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 520 }}>
                                    See whose turn it is to bring water for the room — updated live.
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
                                        <LocalDrinkRounded sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography variant="h6" fontWeight={700}>No active turn</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                            The water turn rotation is not configured yet.
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* ===== Rotation Status ===== */}
                {configured && (
                    <Grid container spacing={2.5} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <PendingRounded color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Rotation queue</Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        {(turn?.rotation?.partners || []).map((partnerItem, index) => {
                                            const isCurrent = currentTurn && String(currentTurn._id) === String(partnerItem._id);
                                            const isDone = pending.every((p) => String(p._id) !== String(partnerItem._id));
                                            return (
                                                <Stack
                                                    key={partnerItem._id}
                                                    direction="row"
                                                    spacing={1.5}
                                                    alignItems="center"
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        bgcolor: isCurrent ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                                        border: isCurrent ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : '1px solid transparent',
                                                    }}
                                                >
                                                    <Typography variant="caption" color="text.secondary" sx={{ width: 20 }}>{index + 1}.</Typography>
                                                    <PartnerAvatar partner={partnerItem} size={40} />
                                                    <Typography variant="body2" fontWeight={isCurrent ? 700 : 500} sx={{ flex: 1 }}>
                                                        {partnerItem.name}
                                                    </Typography>
                                                    {isCurrent && <Chip label="Current" color="primary" size="small" sx={{ fontWeight: 600 }} />}
                                                    {!isCurrent && isDone && <Chip label="Done" color="success" size="small" variant="outlined" />}
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <WaterDropRounded color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Recent water brought</Typography>
                                    </Stack>
                                    {lastCompleted ? (
                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <PartnerAvatar partner={lastCompleted.broughtByPartner} size={40} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {lastCompleted.broughtByPartner?.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Brought water{lastCompleted.assignedPartner?._id !== lastCompleted.broughtByPartner?._id && lastCompleted.assignedPartner?.name
                                                            ? ` for ${lastCompleted.assignedPartner.name}`
                                                            : ''}
                                                    </Typography>
                                                </Box>
                                                <CheckCircleRounded color="success" fontSize="small" />
                                            </Stack>
                                            <Divider />
                                            <Typography variant="body2" color="text.secondary">
                                                Still to bring water this cycle: {pending.length} of {(turn?.rotation?.partners || []).length}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No water brought yet this cycle.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

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
                            Sign in to manage your water turn
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
                            Room partners can mark when they bring water, and the admin can configure and manage the rotation order.
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