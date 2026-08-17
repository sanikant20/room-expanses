import React from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';
import { CheckCircleRounded, UndoRounded } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import CustomCard from '../../../../components/custom/CustomCard';
import CustomDialog from '../../../../components/custom/CustomDialog';
import AutoSettleBanner from '../../../../components/custom/AutoSettleBanner';
import { useGetSettlement, useSettleSettlement, useUnsettleSettlement } from '../../../../apis/settlementAPI/SettlementAPI';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../../constant/constant';
import { SettlementMonthPicker, SettlementSummaryCards, SettlementTable, GroupSelector, SettlementStatus } from '../SettlementShared';
import { useDialogState } from '../../../../hooks/useUIState';

const SettlementSummary = ({ title, icon, subtitlePrefix, filename, category, allowSettle, selectedMonth, onMonthChange, group = 'all', onGroupChange }) => {
    const dialog = useDialogState(); // dialogueType: 'settle' | 'revert'
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
    const isAutoSettled = isSettled && (
        (settlement?.settleActions?.length
            ? settlement.settleActions.every((action) => action.source === 'auto')
            : !settlement?.settledBy)
    );
    const settleLocked = category === 'secondary' && !groupFilter;

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const autoSettleBanner = <AutoSettleBanner color="warning" />;

    const settledScopeLabel = settlement?.fromDate && settlement?.toDate
        ? `${settlement.fromDate} - ${settlement.toDate}`
        : monthLabel || 'this month';

    const openSettleDialog = () => {
        dialog.show(null, 'settle');
    };

    const handleSettle = () => {
        const payload = { ...monthObj, category, ...(groupFilter ? { group: groupFilter } : {}) };
        settleMutation.mutate(payload, {
            onSuccess: (res) => {
                toast.success(res?.message || 'Settlement marked as settled');
                dialog.close();
                queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
                queryClient.invalidateQueries({ queryKey: ['getSettlementCalculations'] });
                queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to settle the month');
                dialog.close();
            },
        });
    };

    const handleRevert = () => {
        revertMutation.mutate({ ...monthObj, category, ...(groupFilter ? { group: groupFilter } : {}) }, {
            onSuccess: (res) => {
                toast.success(res?.message || 'Settlement reverted');
                dialog.close();
                queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
                queryClient.invalidateQueries({ queryKey: ['getSettlementCalculations'] });
                queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to revert the settlement');
                dialog.close();
            },
        });
    };

    const settleRevertActions = allowSettle ? (
        isSettled ? (
            <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<UndoRounded />}
                onClick={() => dialog.show(null, 'revert')}
                disabled={revertMutation.isPending || isAutoSettled}
                title={isAutoSettled ? 'Auto-settled settlements cannot be reverted' : undefined}
            >
                {revertMutation.isPending ? 'Reverting...' : 'Revert'}
            </Button>
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
                    openSettleDialog();
                }}
                disabled={settleMutation.isPending}
            >
                {settleMutation.isPending ? 'Settling...' : 'Settle Month'}
            </Button>
        )
    ) : null;

    const settleContent = (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                This records who-pays-whom transactions for the whole month and marks the month's expenses as settled.
                {!category && ' Settling from All Summary also settles Primary and Secondary (per group) automatically.'}
            </Typography>
        </Stack>
    );

    return (
        <CustomCard
            icon={icon}
            title={title}
            subtitle={`${subtitlePrefix} for ${monthLabel || 'all months'}.`}
            extra={allowSettle ? <SettlementStatus settlement={settlement} scope={settledScopeLabel} /> : null}
        >
            {!category && autoSettleBanner}
            <SettlementSummaryCards data={data} isLoading={isLoading} />
            <Box sx={{ mt: 2 }}>
                <SettlementTable
                    data={data?.rows || []}
                    isLoading={isLoading}
                    filename={filename}
                    actions={settleRevertActions}
                    extra={
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'stretch', md: 'flex-end' }}
                            sx={{ flexWrap: 'wrap', width: '100%' }}
                        >
                            {category === 'secondary' && (
                                <GroupSelector value={group} onChange={onGroupChange} label="Group" allLabel="All Groups" />
                            )}
                            <SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />
                        </Stack>
                    }
                />
            </Box>

            <CustomDialog
                open={dialog.open}
                type={dialog.dialogueType === 'settle' ? 'success' : 'error'}
                title={
                    dialog.dialogueType === 'settle'
                        ? `Settle ${monthLabel || 'this month'}?`
                        : `Revert settlement for ${monthLabel || 'this month'}?`
                }
                content={
                    dialog.dialogueType === 'settle' ? (
                        settleContent
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            This undoes the settlement for the month: it removes the recorded who-pays-whom transactions
                            and marks the month as not settled. You can settle it again later.
                        </Typography>
                    )
                }
                confirmText={dialog.dialogueType === 'settle' ? 'Settle' : 'Revert'}
                cancelText="Cancel"
                onConfirm={dialog.dialogueType === 'settle' ? handleSettle : handleRevert}
                onCancel={dialog.close}
                loading={dialog.dialogueType === 'settle' ? settleMutation.isPending : revertMutation.isPending}
            />
        </CustomCard>
    );
};

export default SettlementSummary;
