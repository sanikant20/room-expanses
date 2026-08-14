import React, { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { CheckCircleRounded, UndoRounded } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import CustomCard from '../../../components/custom/CustomCard';
import { useGetSettlement, useSettleSettlement, useUnsettleSettlement } from '../../../apis/settlementAPI/SettlementAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { convertToBSFormat } from '../../../utils/dateConverter';
import { SettlementMonthPicker, SettlementSummaryCards, SettlementTable, GroupSelector } from './SettlementShared';

const SettlementSummary = ({ title, icon, subtitlePrefix, filename, category, allowSettle, selectedMonth, onMonthChange, group = 'all', onGroupChange }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [revertOpen, setRevertOpen] = useState(false);
    const queryClient = useQueryClient();
    const settleMutation = useSettleSettlement();
    const revertMutation = useUnsettleSettlement();

    const monthObj = parseYearMonthString(selectedMonth);

    const groupFilter = group === 'all' ? undefined : group;

    const { data, isLoading } = useGetSettlement({
        ...monthObj,
        category,
        ...(groupFilter ? { group: groupFilter } : {}),
    });

    const settlement = data?.settlement;
    const isSettled = settlement?.status === 'settled';
    const settleLocked = category === 'secondary' && !groupFilter;

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const handleSettle = () => {
        settleMutation.mutate({ ...monthObj, category, ...(groupFilter ? { group: groupFilter } : {}) }, {
            onSuccess: (res) => {
                toast.success(res?.message || 'Settlement marked as settled');
                setConfirmOpen(false);
                queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
                queryClient.invalidateQueries({ queryKey: ['getSettlementCalculations'] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to settle the month');
                setConfirmOpen(false);
            },
        });
    };

    const handleRevert = () => {
        revertMutation.mutate({ ...monthObj, category, ...(groupFilter ? { group: groupFilter } : {}) }, {
            onSuccess: (res) => {
                toast.success(res?.message || 'Settlement reverted');
                setRevertOpen(false);
                queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
                queryClient.invalidateQueries({ queryKey: ['getSettlementCalculations'] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to revert the settlement');
                setRevertOpen(false);
            },
        });
    };

    const headerExtra = allowSettle ? (
        isSettled ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Chip
                    icon={<CheckCircleRounded />}
                    label={settlement?.settledAt ? `Settled ${convertToBSFormat(settlement.settledAt)}` : 'Settled'}
                    color="success"
                    size="small"
                />
                <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<UndoRounded />}
                    onClick={() => setRevertOpen(true)}
                    disabled={revertMutation.isPending}
                >
                    {revertMutation.isPending ? 'Reverting...' : 'Revert'}
                </Button>
            </Stack>
        ) : (
            <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<CheckCircleRounded />}
                onClick={() => {
                    if (settleLocked) {
                        toast.error('Select a group to settle secondary expenses');
                        return;
                    }
                    setConfirmOpen(true);
                }}
                disabled={settleMutation.isPending}
            >
                {settleMutation.isPending ? 'Settling...' : 'Settle Month'}
            </Button>
        )
    ) : null;

    return (
        <CustomCard
            icon={icon}
            title={title}
            subtitle={`${subtitlePrefix} for ${monthLabel || 'all months'}.`}
            extra={headerExtra}
        >
            <SettlementSummaryCards data={data} />
            <Box sx={{ mt: 2 }}>
                <SettlementTable
                    data={data?.rows || []}
                    isLoading={isLoading}
                    filename={filename}
                    extra={
                        <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ flexWrap: 'wrap' }}>
                            {category === 'secondary' && (
                                <GroupSelector value={group} onChange={onGroupChange} label="Group" allLabel="All Groups" />
                            )}
                            <SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />
                        </Stack>
                    }
                />
            </Box>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Settle {monthLabel || 'this month'}?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        This finalizes the settlement for the month: it records who-pays-whom transactions and marks
                        the month as settled. You can revert this later if needed.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSettle} color="success" variant="contained" autoFocus disabled={settleMutation.isPending}>
                        {settleMutation.isPending ? 'Settling...' : 'Settle'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={revertOpen} onClose={() => setRevertOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Revert settlement for {monthLabel || 'this month'}?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        This undoes the settlement for the month: it removes the recorded who-pays-whom transactions
                        and marks the month as not settled. You can settle it again later.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevertOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleRevert} color="error" variant="contained" autoFocus disabled={revertMutation.isPending}>
                        {revertMutation.isPending ? 'Reverting...' : 'Revert'}
                    </Button>
                </DialogActions>
            </Dialog>
        </CustomCard>
    );
};

export default SettlementSummary;
