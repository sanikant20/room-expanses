import React, { useCallback, useMemo } from 'react';
import { Avatar, Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { CheckCircleRounded, CompareArrowsRounded, PaymentsRounded, ReceiptLongRounded, ReplayRounded } from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import DataTable from '../../../../components/table/DataTable';
import CustomDialog from '../../../../components/custom/CustomDialog';
import { useConfirmTransactionReceipt, useGetSettlement, useMarkTransactionPaid, useResetTransactionPayment } from '../../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getNepaliMonthLabel, PAYMENT_STATUS } from '../../../../constant/constant';
import { SettlementMonthPicker } from '../SettlementShared';
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
        <Chip label={found.label || status} color={found.color || 'default'} size="small" sx={{ alignSelf: 'flex-start' }} />
    );
};

const SettlementMyPayments = ({ selectedMonth, onMonthChange }) => {
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();
    const myId = getAuthData()?._id;

    const monthObj = parseYearMonthString(selectedMonth);
    const { data, isLoading } = useGetSettlement({ ...monthObj, category: undefined });

    const settlement = data?.settlement;
    const isSettled = settlement?.status === 'settled';

    const transactions = useMemo(() => (isSettled ? settlement?.transactions || [] : []), [isSettled, settlement?.transactions]);

    const myPayments = useMemo(() => (
        transactions.filter((tx) => String(tx.from?._id || tx.from) === String(myId))
    ), [transactions, myId]);

    const myReceives = useMemo(() => (
        transactions.filter((tx) => String(tx.to?._id || tx.to) === String(myId))
    ), [transactions, myId]);

    const dialog = useDialogState();
    const showDialog = dialog.show;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        dialog.close();
    };

    const payMutation = useMarkTransactionPaid();
    const confirmMutation = useConfirmTransactionReceipt();
    const resetMutation = useResetTransactionPayment();

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const scope = { ...monthObj };

    const handleMarkPaid = (tx) => {
        payMutation.mutate(
            { ...scope, category: undefined, group: undefined, from: tx.from?._id || tx.from, to: tx.to?._id || tx.to },
            {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Transaction marked as paid');
                    invalidate();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to mark as paid');
                    dialog.close();
                },
            }
        );
    };

    const handleConfirmReceipt = (tx) => {
        confirmMutation.mutate(
            { ...scope, category: undefined, group: undefined, from: tx.from?._id || tx.from, to: tx.to?._id || tx.to },
            {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Transaction confirmed as received');
                    invalidate();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to confirm receipt');
                    dialog.close();
                },
            }
        );
    };

    const handleReset = (tx) => {
        resetMutation.mutate(
            { ...scope, category: undefined, group: undefined, from: tx.from?._id || tx.from, to: tx.to?._id || tx.to },
            {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Transaction payment status reset');
                    invalidate();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to reset payment status');
                    dialog.close();
                },
            }
        );
    };

    const buildActionColumn = useCallback((payAction) => ({
        key: 'action', label: 'Action', filterable: false,
        render: (row) => {
            const canPay = payAction && row.paymentStatus === 'pending';
            const canConfirm = !payAction && row.paymentStatus === 'paid';
            if (!canPay && !canConfirm) return null;
            return canPay ? (
                <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<PaymentsRounded />}
                    onClick={() => showDialog(row, 'pay')}
                >
                    I Paid Them
                </Button>
            ) : (
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircleRounded />}
                    onClick={() => showDialog(row, 'confirm')}
                >
                    Confirm Received
                </Button>
            );
        },
    }), [showDialog]);

    const payColumns = useMemo(() => {
        const cols = [
            { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
            { key: 'to', label: 'Pay To', render: (row) => <PartnerCell partner={row.to} /> },
            {
                key: 'amount', label: 'Amount',
                render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
                footerRenderer: ({ data }) => (
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))}
                    </Typography>
                ),
            },
            {
                key: 'paymentStatus', label: 'Status',
                filterValue: (row) => row.paymentStatus || 'pending',
                render: (row) => <PaymentStatusCell row={row} />,
            },
        ];
        cols.push(buildActionColumn(true));
        return cols;
    }, [buildActionColumn]);

    const receiveColumns = useMemo(() => {
        const cols = [
            { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
            { key: 'from', label: 'Receive From', render: (row) => <PartnerCell partner={row.from} /> },
            {
                key: 'amount', label: 'Amount',
                render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
                footerRenderer: ({ data }) => (
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))}
                    </Typography>
                ),
            },
            {
                key: 'paymentStatus', label: 'Status',
                filterValue: (row) => row.paymentStatus || 'pending',
                render: (row) => <PaymentStatusCell row={row} />,
            },
        ];
        cols.push(buildActionColumn(false));
        return cols;
    }, [buildActionColumn]);

    const adminColumns = useMemo(() => [
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
        {
            key: 'paymentStatus', label: 'Payment Status',
            filterValue: (row) => row.paymentStatus || 'pending',
            render: (row) => <PaymentStatusCell row={row} />,
        },
        {
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
        },
    ], [showDialog]);

    const dialogType = dialog.dialogueType;
    const dialogContent = dialog.open
        ? dialogType === 'pay'
            ? `You will mark as paid ${formatToNepaliCurrency(dialog.data.amount)} to ${dialog.data.to?.name || 'this partner'} for ${monthLabel}. Make sure the payment is completed before confirming.`
            : dialogType === 'confirm'
                ? `Confirm that you received ${formatToNepaliCurrency(dialog.data.amount)} from ${dialog.data.from?.name || 'this partner'} for ${monthLabel}.`
                : `Reset the payment status to pending for ${formatToNepaliCurrency(dialog.data.amount)} from ${dialog.data.from?.name || 'this partner'} to ${dialog.data.to?.name || 'this partner'} for ${monthLabel}?`
        : '';

    return (
        <Stack spacing={2}>
            {isSettled ? (
                isPartner ? (
                    <>
                        <CustomCard
                            icon={<PaymentsRounded />}
                            title="You Pay"
                            subtitle="Payments you need to make to your partners"
                            headerColor="#2e7d32"
                        >
                            <DataTable
                                columns={payColumns}
                                data={myPayments}
                                loading={isLoading}
                                download={{ enabled: true, filename: 'My Payments', excludeColumns: ['sn', 'action'] }}
                                extra={<SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />}
                            />
                        </CustomCard>
                        <CustomCard
                            icon={<ReceiptLongRounded />}
                            title="You Receive"
                            subtitle="Payments your partners owe you"
                            headerColor="#1976d2"
                        >
                            <DataTable
                                columns={receiveColumns}
                                data={myReceives}
                                loading={isLoading}
                                download={{ enabled: true, filename: 'My Receivables', excludeColumns: ['sn', 'action'] }}
                                extra={<SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />}
                            />
                        </CustomCard>
                    </>
                ) : (
                    <CustomCard
                        icon={<CompareArrowsRounded />}
                        title="All Pays & Receives"
                        subtitle="All payment transactions for this month"
                    >
                        <DataTable
                            columns={adminColumns}
                            data={transactions}
                            loading={isLoading}
                            download={{ enabled: true, filename: 'All Pays & Receives', excludeColumns: ['sn', 'actions'] }}
                            extra={<SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />}
                        />
                    </CustomCard>
                )
            ) : (
                <CustomCard icon={<CompareArrowsRounded />} title="My Payments">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                            {isPartner
                                ? 'This month has not been settled yet. Please wait for the admin to settle it.'
                                : 'This month has not been settled yet. Please settle the month from the primary or secondary summary tabs.'}
                        </Typography>
                    </Box>
                </CustomCard>
            )}

            <CustomDialog
                open={dialog.open}
                title={
                    dialogType === 'pay'
                        ? 'Mark Payment as Paid'
                        : dialogType === 'confirm'
                            ? 'Confirm Received'
                            : 'Reset Payment Status'
                }
                content={dialogContent}
                confirmText={
                    dialogType === 'pay'
                        ? 'I Paid Them'
                        : dialogType === 'confirm'
                            ? 'Confirm Received'
                            : 'Reset Status'
                }
                loading={payMutation.isPending || confirmMutation.isPending || resetMutation.isPending}
                type={
                    dialogType === 'pay'
                        ? 'success'
                        : dialogType === 'confirm'
                            ? 'info'
                            : 'warning'
                }
                onConfirm={() => {
                    if (dialogType === 'pay') handleMarkPaid(dialog.data);
                    else if (dialogType === 'confirm') handleConfirmReceipt(dialog.data);
                    else handleReset(dialog.data);
                }}
                onCancel={dialog.close}
            />
        </Stack>
    );
};

export default SettlementMyPayments;

