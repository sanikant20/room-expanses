import React, { useState } from 'react';
import {
    Box,
    Button,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
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
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { getNepaliMonthLabel } from '../../../../constant/constant';
import { SettlementMonthPicker, SettlementSummaryCards, SettlementTable, GroupSelector, SettlementStatus } from '../SettlementShared';
import { useGetActiveGroups } from '../../../../apis/groupAPI/GroupAPI';
import { useDialogState } from '../../../../hooks/useUIState';

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
];

const SettlementSummary = ({ title, icon, subtitlePrefix, filename, category: categoryProp, allowSettle, showCategoryFilter, selectedMonth, onMonthChange, group = 'all', onGroupChange }) => {
    const [categoryFilter, setCategoryFilter] = useState(categoryProp || 'all');
    const category = categoryProp || categoryFilter;
    const effectiveCategory = category === 'all' ? undefined : category;
    const dialog = useDialogState(); // dialogueType: 'settle' | 'revert'
    const queryClient = useQueryClient();
    const settleMutation = useSettleSettlement();
    const revertMutation = useUnsettleSettlement();
    const { data: groups = [] } = useGetActiveGroups();

    const handleCategoryChange = (newCategory) => {
        setCategoryFilter(newCategory);
        if (newCategory !== 'secondary' && onGroupChange) {
            onGroupChange('all');
        }
    };

    const monthObj = parseYearMonthString(selectedMonth);

    const groupFilter = group === 'all' ? undefined : group;
    const selectedGroupName = groupFilter ? (groups.find((g) => g._id === groupFilter)?.name || '') : '';

    const { data, isLoading } = useGetSettlement({
        ...monthObj,
        category: effectiveCategory,
        ...(groupFilter ? { group: groupFilter } : {}),
    });

    const settlement = data?.settlement;
    const isSettled = settlement?.status === 'settled';
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
        const payload = { ...monthObj, category: effectiveCategory, ...(groupFilter ? { group: groupFilter } : {}) };
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
        revertMutation.mutate({ ...monthObj, category: effectiveCategory, ...(groupFilter ? { group: groupFilter } : {}) }, {
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
                disabled={revertMutation.isPending}
                title={undefined}
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
                This will record who-pays-whom transactions and mark expenses as settled for <strong>{monthLabel || 'this month'}</strong>.
            </Typography>
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                        <Typography variant="body2" fontWeight={700}>{data?.expenseCount || 0}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                        <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(data?.grandTotal || 0)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Partners</Typography>
                        <Typography variant="body2" fontWeight={700}>{(data?.rows || []).length}</Typography>
                    </Stack>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>Scopes to settle:</Typography>
                        <Stack spacing={0.5}>
                            {!effectiveCategory && (
                                <>
                                    <Typography variant="body2" color="text.secondary">• All (combined)</Typography>
                                    <Typography variant="body2" color="text.secondary">• Primary</Typography>
                                    <Typography variant="body2" color="text.secondary">• Secondary (per group)</Typography>
                                </>
                            )}
                            {effectiveCategory === 'primary' && (
                                <Typography variant="body2" color="text.secondary">• Primary only</Typography>
                            )}
                            {effectiveCategory === 'secondary' && !groupFilter && (
                                <Typography variant="body2" color="text.secondary">• Secondary (all groups)</Typography>
                            )}
                            {effectiveCategory === 'secondary' && groupFilter && (
                                <Typography variant="body2" color="text.secondary">• Secondary ({selectedGroupName || 'group'})</Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );

    return (
        <CustomCard
            icon={icon}
            title={title}
            subtitle={`${subtitlePrefix} for ${monthLabel || 'all months'}.`}
            extra={allowSettle ? <SettlementStatus settlement={settlement} scope={settledScopeLabel} /> : null}
        >
            {!effectiveCategory && autoSettleBanner}
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
                            {showCategoryFilter && (
                                <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                    <InputLabel>Category</InputLabel>
                                    <TextField
                                        select
                                        size="small"
                                        value={categoryFilter}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        sx={{ minWidth: { xs: 0, md: 140 }, width: { xs: '100%', md: 'auto' } }}
                                    >
                                        {CATEGORY_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            )}
                            {effectiveCategory === 'secondary' && (
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
