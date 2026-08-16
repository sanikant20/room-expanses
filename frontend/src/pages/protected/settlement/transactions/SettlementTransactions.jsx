import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Chip, InputLabel, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { CheckCircleRounded, CompareArrowsRounded, PaymentsRounded, ReplayRounded } from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import DataTable from '../../../../components/table/DataTable';
import CustomDialog from '../../../../components/custom/CustomDialog';
import {
    useConfirmTransactionReceipt,
    useGetSettlement,
    useMarkTransactionPaid,
    useResetTransactionPayment,
} from '../../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { convertToBSFormat } from '../../../../utils/dateConverter';
import { getNepaliMonthLabel, PAYMENT_STATUS } from '../../../../constant/constant';
import { GroupSelector, SettlementMonthPicker, SettlementStatus } from '../SettlementShared';
import { getAuthData, isPartnerAccount } from '../../../../helper/getAuthData';
import { useDialogState } from '../../../../hooks/useUIState';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const PartnerCell = ({ partner }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar src={partner?.image || '/noAvatar.svg'} sx={{ width: 28, height: 28 }} />
        <Typography variant="body2" fontWeight={600}>{partner?.name || 'Unknown'}</Typography>
    </Stack>
);

const PaymentStatusCell = ({ row }) => {
    const found = PAYMENT_STATUS.find((s) => s.value === row.paymentStatus) || {};
    const status = row.paymentStatus || 'pending';
    return (
        <Stack spacing={0.5}>
            <Chip label={found.label || status} color={found.color || 'default'} size="small" sx={{ alignSelf: 'flex-start' }} />
            {row.paidAt && (
                <Typography variant="caption" color="text.secondary">
                    Paid: {convertToBSFormat(row.paidAt)}, {new Date(row.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            )}
            {row.confirmedAt && (
                <Typography variant="caption" color="text.secondary">
                    Confirmed: {convertToBSFormat(row.confirmedAt)}, {new Date(row.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            )}
        </Stack>
    );
};

const SettlementTransactions = ({ selectedMonth, onMonthChange, group = 'all', onGroupChange }) => {
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();
    const myId = getAuthData()?._id;
    const [category, setCategory] = useState(group && group !== 'all' ? 'secondary' : 'all');
    const [source, setSource] = useState('all');
    const dialog = useDialogState();

    useEffect(() => {
        if (group && group !== 'all') setCategory('secondary');
    }, [group]);

    const monthObj = parseYearMonthString(selectedMonth);

    const categoryFilter = category === 'all' ? undefined : category;
    const groupFilter = category === 'secondary' && group !== 'all' ? group : undefined;

    const { data, isLoading } = useGetSettlement({
        ...monthObj,
        category: categoryFilter,
        ...(groupFilter ? { group: groupFilter } : {}),
    });

    const settlement = data?.settlement;
    const isSettled = settlement?.status === 'settled';

    const transactions = useMemo(() => {
        const wholeMonthTransactions = isSettled ? (settlement?.transactions || []) : [];
        if (source === 'all') return wholeMonthTransactions;
        const actions = (settlement?.settleActions || []).filter((action) => action.source === source);
        const map = new Map();
        for (const action of actions) {
            for (const tx of action.transactions || []) {
                const key = `${tx.from?._id || tx.from}->${tx.to?._id || tx.to}`;
                const current = map.get(key);
                if (current) {
                    current.amount = Math.round((current.amount + (Number(tx.amount) || 0)) * 100) / 100;
                } else {
                    map.set(key, { ...tx });
                }
            }
        }
        return [...map.values()];
    }, [source, isSettled, settlement?.transactions, settlement?.settleActions]);

    const showPaymentStatus = source === 'all';

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const categoryLabel = category === 'primary' ? 'Primary' : category === 'secondary' ? 'Secondary' : 'Total';
    const sourceLabel = source === 'manual' ? 'Manual' : source === 'auto' ? 'Auto' : monthLabel || 'Whole Month';
    const sourceSuffix = source === 'all' ? categoryLabel : `${categoryLabel} · ${sourceLabel}`;

    const closeDialog = dialog.close;
    const showDialog = dialog.show;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        closeDialog();
    };

    const payMutation = useMarkTransactionPaid();
    const confirmMutation = useConfirmTransactionReceipt();
    const resetMutation = useResetTransactionPayment();

    const runMutation = (mutation, tx) => {
        mutation.mutate(
            {
                ...monthObj,
                category: categoryFilter,
                ...(groupFilter ? { group: groupFilter } : {}),
                from: tx.from?._id || tx.from,
                to: tx.to?._id || tx.to,
            },
            {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Transaction updated');
                    invalidate();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to update transaction');
                    closeDialog();
                },
            }
        );
    };

    const columns = useMemo(() => {
        const cols = [
            { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
            { key: 'from', label: 'Pays', render: (row) => <PartnerCell partner={row.from} /> },
            { key: 'to', label: 'Receives', render: (row) => <PartnerCell partner={row.to} /> },
            {
                key: 'amount', label: 'Amount',
                render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
                footerRenderer: ({ data }) => (
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))}
                    </Typography>
                ),
            },
        ];
        if (showPaymentStatus) {
            cols.push({
                key: 'paymentStatus', label: 'Payment Status',
                filterValue: (row) => row.paymentStatus || 'pending',
                render: (row) => <PaymentStatusCell row={row} />,
            });
            if (!isPartner) {
                cols.push({
                    key: 'actions', label: 'Actions', filterable: false,
                    render: (row) => {
                        const status = row.paymentStatus || 'pending';
                        return (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                {status === 'pending' && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<PaymentsRounded />}
                                        onClick={() => showDialog(row, 'pay')}
                                    >
                                        Mark Paid
                                    </Button>
                                )}
                                {status === 'paid' && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CheckCircleRounded />}
                                        onClick={() => showDialog(row, 'confirm')}
                                    >
                                        Confirm
                                    </Button>
                                )}
                                {status !== 'pending' && (
                                    <Tooltip title="Reset payment status to pending">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="warning"
                                            startIcon={<ReplayRounded />}
                                            onClick={() => showDialog(row, 'reset')}
                                        >
                                            Reset
                                        </Button>
                                    </Tooltip>
                                )}
                            </Stack>
                        );
                    },
                });
            } else {
                cols.push({
                    key: 'actions', label: 'Actions', filterable: false,
                    render: (row) => {
                        const status = row.paymentStatus || 'pending';
                        const fromId = String(row.from?._id || row.from);
                        const toId = String(row.to?._id || row.to);
                        const canPay = status === 'pending' && fromId === myId;
                        const canConfirm = status === 'paid' && toId === myId;
                        if (!canPay && !canConfirm) return null;
                        return (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                {canPay && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<PaymentsRounded />}
                                        onClick={() => showDialog(row, 'pay')}
                                    >
                                        Mark Paid
                                    </Button>
                                )}
                                {canConfirm && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CheckCircleRounded />}
                                        onClick={() => showDialog(row, 'confirm')}
                                    >
                                        Confirm
                                    </Button>
                                )}
                            </Stack>
                        );
                    },
                });
            }
        }
        return cols;
    }, [showPaymentStatus, isPartner, myId, showDialog]);

    const dialogConfig = {
        pay: { title: 'Mark Payment as Paid', confirmText: 'Mark as Paid', type: 'success' },
        confirm: { title: 'Confirm Received', confirmText: 'Confirm Received', type: 'info' },
        reset: { title: 'Reset Payment Status', confirmText: 'Reset', type: 'warning' },
    }[dialog.dialogueType] || {};

    const dialogContent = dialog.open ? (
        dialog.dialogueType === 'pay'
            ? `Mark ${dialog.data.from?.name || 'this partner'}'s payment of ${formatToNepaliCurrency(dialog.data.amount)} to ${dialog.data.to?.name || 'the receiving partner'} as paid?`
            : dialog.dialogueType === 'confirm'
                ? `Confirm that ${dialog.data.to?.name || 'the receiving partner'} received ${formatToNepaliCurrency(dialog.data.amount)} from ${dialog.data.from?.name || 'the paying partner'}?`
                : `Reset the payment status of ${formatToNepaliCurrency(dialog.data.amount)} from ${dialog.data.from?.name || 'paying partner'} to ${dialog.data.to?.name || 'receiving partner'} back to pending?`
    ) : '';

    return (
        <CustomCard
            icon={<CompareArrowsRounded />}
            title="Settlement Transactions"
            subtitle={isSettled ? `Who pays whom for ${monthLabel || 'this month'} · ${sourceSuffix}.` : `Not settled yet for ${monthLabel || 'this month'} · ${categoryLabel}.`}
            extra={<SettlementStatus settlement={settlement} />}
        >
            {isSettled ? (
                <>
                    <DataTable
                        columns={columns}
                        data={transactions}
                        loading={isLoading}
                        download={{ enabled: true, filename: 'Settlement Transactions', excludeColumns: ['sn', 'actions'] }}
                        extra={
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={1}
                                alignItems={{ xs: 'stretch', md: 'flex-end' }}
                                sx={{ flexWrap: 'wrap', width: '100%' }}
                            >
                                <SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />
                                <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                    <InputLabel>Category</InputLabel>
                                    <TextField
                                        select
                                        size="small"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        sx={{ minWidth: { xs: 0, md: 140 }, width: { xs: '100%', md: 'auto' } }}
                                    >
                                        <MenuItem value="all">All</MenuItem>
                                        <MenuItem value="primary">Primary</MenuItem>
                                        <MenuItem value="secondary">Secondary</MenuItem>
                                    </TextField>
                                </Stack>
                                {category === 'secondary' && (
                                    <GroupSelector value={group} onChange={onGroupChange} label="Group" allLabel="All Groups" />
                                )}
                                <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                    <InputLabel>Source</InputLabel>
                                    <TextField
                                        select
                                        size="small"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        sx={{ minWidth: { xs: 0, md: 150 }, width: { xs: '100%', md: 'auto' } }}
                                    >
                                        <MenuItem value="all">{monthLabel || 'Whole Month'}</MenuItem>
                                        <MenuItem value="manual">Manual</MenuItem>
                                        <MenuItem value="auto">Auto</MenuItem>
                                    </TextField>
                                </Stack>
                            </Stack>
                        }
                    />
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                        This month has not been settled yet. Go to the Settlement Summary tab and click "Settle Month".
                    </Typography>
                </Box>
            )}

            <CustomDialog
                open={dialog.open}
                title={dialogConfig.title}
                content={dialogContent}
                confirmText={dialogConfig.confirmText}
                loading={payMutation.isPending || confirmMutation.isPending || resetMutation.isPending}
                type={dialogConfig.type}
                onConfirm={() => {
                    if (dialog.dialogueType === 'pay') runMutation(payMutation, dialog.data);
                    else if (dialog.dialogueType === 'confirm') runMutation(confirmMutation, dialog.data);
                    else if (dialog.dialogueType === 'reset') runMutation(resetMutation, dialog.data);
                }}
                onCancel={closeDialog}
            />
        </CustomCard >
    );
};

export default SettlementTransactions;
