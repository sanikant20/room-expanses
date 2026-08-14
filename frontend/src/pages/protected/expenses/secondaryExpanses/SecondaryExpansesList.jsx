import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    Button,
    Chip,
    IconButton,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    GroupWorkRounded,
    StarOutlineRounded,
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
import { useGetActiveGroups } from '../../../../apis/groupAPI/GroupAPI';
import { useDialogState, useModalState } from '../../../../hooks/useUIState';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getAuthData, isPartnerAccount } from '../../../../helper/getAuthData';
import SecondaryExpansesForm from './SecondaryExpansesForm';

const SecondaryExpansesList = ({ selectedMonth, onMonthChange }) => {
    const queryClient = useQueryClient();
    const modal = useModalState();
    const dialog = useDialogState();
    const [selectedGroup, setSelectedGroup] = useState('');
    const isPartner = isPartnerAccount();
    const selfId = getAuthData()?._id;

    const selectedMonthObj = parseYearMonthString(selectedMonth);
    const groupFilter = selectedGroup || undefined;
    const { data: expenses, isLoading } = useGetExpenses({
        ...selectedMonthObj,
        category: 'secondary',
        ...(groupFilter ? { group: groupFilter } : {}),
    });
    const { data: activePartners = [] } = useGetPartners({ status: 'active' });
    const { data: allGroups = [] } = useGetActiveGroups();
    const groups = isPartner
        ? allGroups.filter((g) => (g.partners || []).some((p) => String(p?._id || p) === String(selfId)))
        : allGroups;
    const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

    const isOwnRow = (row) => !isPartner || String(row.createdBy) === String(selfId);

    useEffect(() => {
        if (groups.length > 0 && !groups.some((g) => g._id === selectedGroup)) {
            setSelectedGroup(groups[0]._id);
        }
    }, [groups, selectedGroup]);

    const selectedGroupDoc = groups.find((g) => g._id === selectedGroup) || null;

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
        queryClient.invalidateQueries({ queryKey: ['getDashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        queryClient.invalidateQueries({ queryKey: ['getMonthlyReport'] });
    };

    const data = useMemo(() => {
        const scopedExpenses = isPartner
            ? (expenses || []).filter((row) => String(row.createdBy) === String(selfId))
            : (expenses || []);
        return scopedExpenses;
    }, [expenses, isPartner, selfId]);

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

    const partnerNames = (row) => {
        const ids = (row.applicablePartners || []).map((p) => p?._id || p);
        return ids.map((id) => {
            const p = activePartners.find((x) => String(x._id) === String(id));
            return p?.name || String(id);
        });
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
            key: 'group', label: 'Group',
            render: (row) => {
                const groupId = row.group?._id || row.group || '';
                const groupName = row.group?.name || groups.find((g) => g._id === groupId)?.name || '—';
                return (
                    <Chip
                        size="small"
                        icon={<GroupWorkRounded />}
                        label={groupName}
                        color={groupName !== '—' ? 'primary' : 'default'}
                        variant={groupName !== '—' ? 'filled' : 'outlined'}
                    />
                );
            },
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
            render: (row) => {
                const names = partnerNames(row);
                return (
                    <Chip
                        size="small"
                        icon={<GroupWorkRounded />}
                        label={names.length ? names.join(', ') : '—'}
                        variant="outlined"
                    />
                );
            },
        },
    ];

    return (
        <>
            <CustomCard
                icon={<StarOutlineRounded />}
                title="Secondary Expenses"
                subtitle="Select a group, then choose partners each expense applies to"
                extra={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddRounded />}
                        disabled={!selectedGroupDoc}
                        onClick={() => {
                            if (!selectedGroupDoc) {
                                toast.error('Select a group before adding an expense');
                                return;
                            }
                            modal.openAdd();
                        }}
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
                        filename: `Secondary Expenses ${selectedMonth}`,
                        excludeColumns: ['actions', 'sn'],
                    }}
                    extra={
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1}
                            alignItems={{ xs: 'stretch', md: 'center' }}
                            sx={{ flexWrap: 'wrap', width: '100%' }}
                        >
                            <Stack
                                spacing={0.25}
                                alignItems={{ xs: 'stretch', md: 'center' }}
                                sx={{ width: { xs: '100%', md: 'auto' } }}
                            >
                                <InputLabel>Group</InputLabel>
                                <TextField
                                    select
                                    size="small"
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    sx={{ minWidth: { xs: 0, md: 200 }, width: { xs: '100%', md: 'auto' } }}
                                >
                                    {groups.map((g) => (
                                        <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                            <NepaliYearMonthPicker
                                value={selectedMonth}
                                onChange={onMonthChange}
                                size="small"
                                fullWidth={false}
                                sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { xs: 0, md: 210 } }}
                            />
                        </Stack>
                    }
                />
            </CustomCard>

            <CustomModal
                open={modal.open}
                onClose={modal.close}
                title={modal.mode === 'add' ? 'Add Secondary Expense' : 'Edit Expense'}
                width={700}
            >
                <SecondaryExpansesForm
                    mode={modal.mode}
                    selectedData={modal.data}
                    onClose={modal.close}
                    activePartners={activePartners}
                    groups={groups}
                    defaultGroup={selectedGroup}
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

export default SecondaryExpansesList;
