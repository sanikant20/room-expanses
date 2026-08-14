import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    Button,
    Chip,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    GroupRounded,
    StarRounded,
} from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import CustomDialog from '../../../../components/custom/CustomDialog';
import CustomModal from '../../../../components/custom/CustomModal';
import DataTable from '../../../../components/table/DataTable';
import { NepaliYearMonthPicker } from '../../../../components/date/NepaliYearMonthPicker';
import {
    useDeleteExpense,
    useGetExpenses,
} from '../../../../apis/expenseAPI/ExpenseAPI';
import { useGetPartners } from '../../../../apis/partnerAPI/PartnerAPI';
import { useDialogState, useModalState } from '../../../../hooks/useUIState';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getAuthData, isPartnerAccount } from '../../../../helper/getAuthData';
import PrimaryExpansesForm from './PrimaryExpansesForm';

const PrimaryExpansesList = ({ selectedMonth, onMonthChange }) => {
    const queryClient = useQueryClient();
    const modal = useModalState();
    const dialog = useDialogState();
    const isPartner = isPartnerAccount();
    const selfId = getAuthData()?._id;

    const selectedMonthObj = parseYearMonthString(selectedMonth);
    const { data: expenses, isLoading } = useGetExpenses({ ...selectedMonthObj, category: 'primary' });
    const { data: activePartners = [] } = useGetPartners({ status: 'active' });
    const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

    const isOwnRow = (row) => !isPartner || String(row.createdBy) === String(selfId);

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
        queryClient.invalidateQueries({ queryKey: ['getDashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        queryClient.invalidateQueries({ queryKey: ['getMonthlyReport'] });
    };

    const data = useMemo(() => (
        isPartner
            ? (expenses || []).filter((row) => String(row.createdBy) === String(selfId))
            : (expenses || [])
    ), [expenses, isPartner, selfId]);

    const handleDelete = () => {
        deleteExpense(
            { id: dialog.data?._id },
            {
                onSuccess: (res) => {
                    if (res?.success) {
                        invalidateAll();
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    dialog.close();
                },
                onError: (error) => toast.error(error?.response?.data?.message),
            }
        );
    };

    const columns = [
        {
            key: 'actions', label: 'Actions', fixed: 'left',
            render: (row) => (
                isOwnRow(row) ? (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit expense">
                            <IconButton size="small" onClick={() => modal.openEdit(row)}>
                                <EditRounded fontSize="small" color="primary" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete expense">
                            <IconButton size="small" onClick={() => dialog.show(row, 'delete')}>
                                <DeleteRounded fontSize="small" color="error" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ) : null
            ),
        },
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        {
            key: 'bsDate', label: 'BS Date',
            render: (row) => <Typography variant="body2">{row.bsDate}</Typography>,
        },
        {
            key: 'title', label: 'Items',
            render: (row) => <Typography variant="body2">{row.title}</Typography>,
        },
        {
            key: 'amount', label: 'Cost',
            render: (row) => (
                <Typography variant="body2">{formatToNepaliCurrency(Number(row.amount) || 0)}</Typography>
            ),
            footer: 'Total',
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, r) => sum + (Number(r.amount) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'paidBy', label: 'Paid By',
            render: (row) => {
                const payerId = row.paidBy?._id || row.paidBy || '';
                const payerName = activePartners.find((p) => String(p._id) === String(payerId))?.name
                    || row.paidBy?.name
                    || (isPartner ? 'You' : '—');
                return <Typography variant="body2">{payerName}</Typography>;
            },
        },
        {
            key: 'applicablePartners', label: 'Apply To',
            render: () => (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Chip
                        size="small"
                        color="primary"
                        icon={<GroupRounded />}
                        label={`All Active (${activePartners.length})`}
                    />
                </Stack>
            ),
        },
    ];

    return (
        <>
            <CustomCard
                icon={<StarRounded />}
                title="Primary Expenses"
                subtitle={isPartner ? 'Applies only to you' : 'Applies to all active partners'}
                extra={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddRounded />}
                        onClick={modal.openAdd}
                    >
                        Add Expense
                    </Button>
                }
            >
                <DataTable
                    columns={columns}
                    data={data}
                    loading={isLoading}
                    download={{
                        enabled: true,
                        filename: `Primary Expenses ${selectedMonth}`,
                        excludeColumns: ['actions', 'sn'],
                    }}
                    extra={
                        <NepaliYearMonthPicker
                            value={selectedMonth}
                            onChange={onMonthChange}
                            size="small"
                            fullWidth={false}
                            sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { xs: 0, md: 210 } }}
                        />
                    }
                />
            </CustomCard>

            <CustomModal
                open={modal.open}
                onClose={modal.close}
                title={modal.mode === 'add' ? 'Add Primary Expense' : 'Edit Expense'}
                width={700}
            >
                <PrimaryExpansesForm
                    mode={modal.mode}
                    selectedData={modal.data}
                    onClose={modal.close}
                    activePartners={activePartners}
                />
            </CustomModal>

            <CustomDialog
                open={dialog.open}
                title="Delete Expense"
                content={
                    <>
                        Are you sure you want to delete <strong>"{dialog.data?.title}"</strong>? This action cannot be undone.
                    </>
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={dialog.close}
                loading={isDeleting}
                type="error"
            />
        </>
    );
};

export default PrimaryExpansesList;
