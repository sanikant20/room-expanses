import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    CheckCircleRounded,
    LocalDrinkRounded,
    PendingRounded,
    ReplayRounded,
    VerifiedRounded,
    WaterDropRounded,
} from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import CustomModal from '../../../../components/custom/CustomModal';
import { useModalState } from '../../../../hooks/useUIState';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
    useCompleteTurn,
    useGetTurnState,
} from '../../../../apis/turnAPI/TurnAPI';
import { isPartnerAccount } from '../../../../helper/getAuthData';
import { getTurnPartnerStatus } from '../../../../utils/turnFormat';
import TurnRotationForm from './TurnRotationForm';
import TurnHistory from './TurnHistory';

const PartnerAvatar = ({ partner, size = 48 }) => (
    <Avatar
        src={partner?.image || '/noAvatar.svg'}
        alt={partner?.name}
        sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700 }}
    >
        {partner?.name?.charAt(0)}
    </Avatar>
);

const WaterTurn = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();

    const modal = useModalState();
    const historyModal = useModalState();

    const { data: turn } = useGetTurnState();
    const { mutate: completeTurn, isPending: isCompleting } = useCompleteTurn();
    const [adminPartnerId, setAdminPartnerId] = useState('');

    const configured = !!turn?.rotation?.configured;
    const currentTurn = turn?.currentTurn || null;
    const nextTurn = turn?.nextTurn || null;
    const completed = turn?.completed || [];
    const cycle = turn?.cycle || 1;
    const myStatus = turn?.myStatus || null;

    const handleComplete = (partnerId) => {
        completeTurn(
            partnerId ? { partnerId } : {},
            {
                onSuccess: (response) => {
                    toast.success(response?.message);
                    setAdminPartnerId('');
                    queryClient.invalidateQueries({ queryKey: ['getTurnState'] });
                    queryClient.invalidateQueries({ queryKey: ['getTurnHistory'] });
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Something went wrong');
                },
            }
        );
    };

    const canActAsPartner = isPartner && myStatus?.inRotation && !myStatus?.fulfilled;

    const renderCurrentTurnCard = () => {
        if (!configured) {
            return (
                <CustomCard icon={<WaterDropRounded />} title="Water Turn">
                    <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
                        <LocalDrinkRounded sx={{ fontSize: 56, color: 'text.disabled' }} />
                        <Typography color="text.secondary">
                            No water turn rotation configured yet.
                        </Typography>
                        {!isPartner && (
                            <Button variant="contained" size="small" onClick={modal.openAdd}>
                                Configure Water Turn
                            </Button>
                        )}
                    </Stack>
                </CustomCard>
            );
        }

        return (
            <CustomCard
                icon={<WaterDropRounded />}
                title={`Water Turn — Cycle ${cycle}`}
                subtitle={`Current turn keeps track of whose water obligation is due next.`}
                headerInline
                extra={
                    <>
                        {!isPartner && (
                            <Button variant="contained" size="small" onClick={modal.openEdit}>
                                Manage Rotation
                            </Button>
                        )}
                        {isPartner && canActAsPartner && currentTurn && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={isCompleting ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <VerifiedRounded />}
                                onClick={() => handleComplete()}
                                disabled={isCompleting}
                            >
                                {isCompleting ? 'Marking...' : 'I Brought Water'}
                            </Button>
                        )}
                    </>
                }
            >
                <Box sx={{ p: 2, borderRadius: 3, background: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                            <PartnerAvatar partner={currentTurn} size={72} />
                            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    CURRENT TURN
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                                    {currentTurn?.name || '—'}
                                </Typography>
                                {nextTurn && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Next: <strong>{nextTurn.name}</strong>
                                    </Typography>
                                )}
                            </Box>
                            {currentTurn && (
                                <Chip
                                    icon={<VerifiedRounded />}
                                    label="Water due"
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Stack>
                        {isPartner && currentTurn && myStatus && myStatus.fulfilled && (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.25)}` }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CheckCircleRounded color="success" fontSize="small" />
                                    <Typography variant="body2">
                                        You have already fulfilled your water obligation for this cycle. Nice work!
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                        {isPartner && currentTurn && myStatus && !myStatus.fulfilled && (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.25)}` }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <LocalDrinkRounded color="info" fontSize="small" />
                                    <Typography variant="body2">
                                        {myStatus.isCurrentTurn
                                            ? `It is your turn to bring water. Tap "I Brought Water" when done.`
                                            : `The current turn is ${currentTurn?.name || 'a partner'}. You can bring water for this turn — it fulfills your own obligation and the current turn stays due.`}
                                    </Typography>
                                </Stack>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={isCompleting ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <LocalDrinkRounded />}
                                    onClick={() => handleComplete()}
                                    disabled={isCompleting}
                                    sx={{ mt: 1 }}
                                >
                                    {isCompleting ? 'Marking...' : 'I Brought Water For This Turn'}
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </CustomCard>
        );
    };

    const renderQueueCard = () => (
        <CustomCard icon={<PendingRounded />} title="Rotation Queue" subtitle="Active partners in turn order.">
            <List dense disablePadding>
                {(turn?.rotation?.partners || []).map((partnerItem, index) => {
                    const status = getTurnPartnerStatus(partnerItem, currentTurn, completed);
                    const isCurrent = status === 'current';
                    const isDone = status === 'done';
                    return (
                        <React.Fragment key={partnerItem._id}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                                secondaryAction={
                                    isCurrent ? (
                                        <Chip label="Current" color="primary" size="small" sx={{ fontWeight: 600 }} />
                                    ) : isDone ? (
                                        <Chip label="Done" color="success" size="small" variant="outlined" />
                                    ) : (
                                        <Chip label="Pending" color="default" size="small" variant="outlined" />
                                    )
                                }
                            >
                                <ListItemAvatar>
                                    <PartnerAvatar partner={partnerItem} size={40} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={partnerItem.name}
                                    primaryTypographyProps={{ fontWeight: isCurrent ? 700 : 500 }}
                                    secondary={partnerItem.status === 'active' ? 'Active' : 'Inactive'}
                                />
                            </ListItem>
                        </React.Fragment>
                    );
                })}
            </List>
        </CustomCard>
    );

    const renderMyStatusCard = () => {
        if (!isPartner) return null;
        return (
            <CustomCard icon={<VerifiedRounded />} title="My Obligation" subtitle="Your status in the current cycle.">
                <Stack spacing={1.5}>
                    {!configured ? (
                        <Typography variant="body2" color="text.secondary">No rotation configured.</Typography>
                    ) : myStatus?.inRotation ? (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 40, height: 40, bgcolor: myStatus.fulfilled ? 'success.main' : 'warning.main' }}>
                                {myStatus.fulfilled ? <CheckCircleRounded /> : <PendingRounded />}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {myStatus.fulfilled ? 'Fulfilled for this cycle' : 'Pending for this cycle'}
                                </Typography>
                                {myStatus.isCurrentTurn && (
                                    <Typography variant="caption" color="primary" fontWeight={600}>
                                        It is your turn now
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            You are not part of the active water rotation.
                        </Typography>
                    )}
                </Stack>
            </CustomCard>
        );
    };

    const renderActionsCard = () => {
        if (isPartner) return null;
        const rotationPartners = turn?.rotation?.partners || [];
        const completedIds = completed.map((p) => String(p._id));
        const markable = rotationPartners.filter(
            (p) => p.status === 'active' && !completedIds.includes(String(p._id))
        );
        return (
            <CustomCard icon={<LocalDrinkRounded />} title="Admin Actions" subtitle="Configure, manage, and record water turns.">
                <Stack spacing={1.5}>
                    <Button variant="contained" size="small" startIcon={<WaterDropRounded />} onClick={modal.openEdit}>
                        {configured ? 'Edit Rotation' : 'Configure Water Turn'}
                    </Button>
                    <Button variant="outlined" size="small" onClick={historyModal.openView}>
                        View Turn History
                    </Button>

                    {configured && (
                        <Box
                            sx={{
                                mt: 0.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                            }}
                        >
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                Mark Water Brought
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                Record that a partner brought water. This fulfills that partner's obligation for the
                                cycle. Use it only when they genuinely brought the water.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    value={adminPartnerId}
                                    onChange={(e) => setAdminPartnerId(e.target.value)}
                                    slotProps={{
                                        select: {
                                            displayEmpty: true,
                                            renderValue: (value) => {
                                                if (!value) return 'Select a partner...';
                                                const p = rotationPartners.find((x) => String(x._id) === String(value));
                                                return p?.name || 'Select a partner...';
                                            },
                                        },
                                    }}
                                >
                                    {markable.length === 0 && (
                                        <MenuItem value="" disabled>All partners fulfilled this cycle</MenuItem>
                                    )}
                                    {markable.map((partner) => (
                                        <MenuItem key={partner._id} value={partner._id}>
                                            {partner.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isCompleting ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <VerifiedRounded />}
                                    onClick={() => handleComplete(adminPartnerId)}
                                    disabled={!adminPartnerId || isCompleting}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {isCompleting ? 'Marking...' : 'Mark Brought'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </CustomCard>
        );
    };

    return (
        <Stack spacing={2}>
            {renderCurrentTurnCard()}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {renderQueueCard()}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                        {renderMyStatusCard()}
                        {renderActionsCard()}
                    </Stack>
                </Grid>
            </Grid>

            <CustomModal open={modal.open} onClose={modal.close} title={modal.mode === 'edit' ? 'Manage Water Rotation' : 'Configure Water Turn'} width={720}>
                <TurnRotationForm mode={modal.mode} onClose={modal.close} />
            </CustomModal>

            <CustomModal open={historyModal.open} onClose={historyModal.close} title="Water Turn History" width={720}>
                <TurnHistory />
            </CustomModal>
        </Stack>
    );
};

export default WaterTurn;