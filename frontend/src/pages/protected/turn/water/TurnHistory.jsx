import React from 'react';
import {
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { HistoryRounded, ReplayRounded } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useGetTurnHistory, useResetTurnEvent } from '../../../../apis/turnAPI/TurnAPI';
import { isPartnerAccount } from '../../../../helper/getAuthData';
import { formatTurnDateTime, isCoveredEvent } from '../../../../utils/turnFormat';
import { getTurnTypeConfig } from '../../../../utils/turnTypeConfig';

const TurnHistory = ({ type = 'water' }) => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();
    const config = getTurnTypeConfig(type);

    const { data: history, isLoading } = useGetTurnHistory({ type });
    const { mutate: resetEvent, isPending: isResetting } = useResetTurnEvent();

    const cycles = history?.cycles || [];

    const handleReset = (event) => {
        resetEvent(
            { eventId: event._id },
            {
                onSuccess: (response) => {
                    toast.success(response?.message);
                    queryClient.invalidateQueries({ queryKey: ['getTurnState', type] });
                    queryClient.invalidateQueries({ queryKey: ['getTurnHistory', type] });
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Something went wrong');
                },
            }
        );
    };

    if (isLoading) {
        return <Typography variant="body2" color="text.secondary">Loading history...</Typography>;
    }

    if (cycles.length === 0) {
        return (
            <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                <HistoryRounded sx={{ fontSize: 44, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">No turn history recorded yet.</Typography>
            </Stack>
        );
    }

    return (
        <Stack spacing={2}>
            {cycles.map(({ cycle, events }) => (
                <Box key={cycle} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                    <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.06), borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Cycle {cycle}
                        </Typography>
                    </Box>
                    <List dense disablePadding>
                        {events.map((event, index) => (
                            <React.Fragment key={event._id}>
                                {index > 0 && <Divider component="li" />}
                                <ListItem
                                    secondaryAction={
                                        !isPartner && (
                                            <Tooltip title="Reset this event (undo completion)">
                                                <IconButton size="small" onClick={() => handleReset(event)} disabled={isResetting}>
                                                    <ReplayRounded fontSize="small" color="warning" />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={event.broughtByPartner?.image || '/noAvatar.svg'} sx={{ width: 36, height: 36 }}>
                                            {event.broughtByPartner?.name?.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body2" fontWeight={600}>{event.broughtByPartner?.name || '—'}</Typography>
                                                <Chip label={config.verb} color="success" size="small" variant="outlined" />
                                            </Stack>
                                        }
                                        secondary={
                                            <>
                                                {isCoveredEvent(event) && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Covered for {event.assignedPartner.name} — that partner stays pending.
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {formatTurnDateTime(event.completedAt)}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            ))}
        </Stack>
    );
};

export default TurnHistory;