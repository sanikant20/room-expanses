import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    Box,
    Button,
    Checkbox,
    IconButton,
    MenuItem,
    MenuList,
    Popover,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    ArrowDropDownRounded,
    CheckRounded,
    CloseRounded,
    DeleteRounded,
    StarOutlineRounded,
} from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import CustomDialog from '../../../../components/custom/CustomDialog';
import DataTable from '../../../../components/table/DataTable';
import { NepaliYearMonthPicker } from '../../../../components/date/NepaliYearMonthPicker';
import {
    useCreateExpense,
    useDeleteExpense,
    useGetExpenses,
    useUpdateExpense,
} from '../../../../apis/expenseAPI/ExpenseAPI';
import { useGetPartners } from '../../../../apis/partnerAPI/PartnerAPI';
import { useDialogState } from '../../../../hooks/useUIState';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';

const isDraft = (row) => typeof row._id === 'string' && row._id.startsWith('draft-');

const InlineTextField = ({ value = '', onCommit, placeholder = '', minWidth = 140, type = 'text' }) => {
    const [val, setVal] = useState(value);

    const handleBlur = () => {
        const next = String(val ?? '').trim();
        if (String(next) !== String(value ?? '').trim()) {
            onCommit(type === 'number' ? val : next);
        } else {
            setVal(value);
        }
    };

    return (
        <TextField
            size="small"
            type={type}
            value={val}
            placeholder={placeholder}
            onChange={(e) => setVal(e.target.value)}
            onBlur={handleBlur}
            sx={{
                minWidth,
                '& .MuiInputBase-input': { fontSize: 13, py: 0.6 },
            }}
        />
    );
};

const PartnerMultiSelect = ({ value = [], partners = [], onChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const selectedNames = partners.filter((p) => value.includes(p._id)).map((p) => p.name);
    const label = selectedNames.length === 0
        ? 'Select partners…'
        : selectedNames.length <= 2
            ? selectedNames.join(', ')
            : `${selectedNames.length} partners`;

    const toggle = (id) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    const toggleAll = () => {
        onChange(value.length === partners.length ? [] : partners.map((p) => p._id));
    };

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ArrowDropDownRounded />}
                sx={{
                    minWidth: 170,
                    textTransform: 'none',
                    fontSize: 12,
                    py: 0.5,
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </Box>
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ minWidth: 240 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1, pb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>Apply calculation to</Typography>
                        <Button size="small" onClick={toggleAll}>
                            {value.length === partners.length ? 'Clear' : 'Select All'}
                        </Button>
                    </Stack>
                    <MenuList dense>
                        {partners.map((p) => (
                            <MenuItem key={p._id} onClick={() => toggle(p._id)} sx={{ borderRadius: 1, mx: 0.5 }}>
                                <Checkbox size="small" checked={value.includes(p._id)} />
                                <Typography variant="body2">{p.name}</Typography>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Box>
            </Popover>
        </>
    );
};

const SecondaryExpansesList = ({
    selectedMonth,
    onMonthChange,
    drafts = [],
    onAddDraft,
    onUpdateDraft,
    onRemoveDraft,
}) => {
    const queryClient = useQueryClient();
    const dialog = useDialogState();
    const [edits, setEdits] = useState({});

    const selectedMonthObj = parseYearMonthString(selectedMonth);
    const { data: expenses, isLoading } = useGetExpenses({ ...selectedMonthObj, category: 'secondary' });
    const { data: activePartners = [] } = useGetPartners({ status: 'active' });
    const { mutate: createExpense } = useCreateExpense();
    const { mutate: updateExpense } = useUpdateExpense();
    const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

    const draftDate = selectedMonthObj.bsYear
        ? `${selectedMonthObj.bsYear}/${String(selectedMonthObj.bsMonth).padStart(2, '0')}/01`
        : '';

    const rowDate = (row) => (isDraft(row) ? (row.bsDate || draftDate) : row.bsDate);

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
        queryClient.invalidateQueries({ queryKey: ['getDashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        queryClient.invalidateQueries({ queryKey: ['getMonthlyReport'] });
    };

    const combined = useMemo(() => [...drafts, ...(expenses || [])], [drafts, expenses]);

    const commitUpdate = (row, field, value) => {
        const original =
            field === 'paidBy'
                ? row.paidBy?._id
                : field === 'applicablePartners'
                    ? (row.applicablePartners || []).map((p) => p?._id || p)
                    : row[field];

        const normalize = (v) => (Array.isArray(v) ? v.join('|') : String(v ?? ''));
        if (normalize(original) === normalize(value)) {
            setEdits((prev) => {
                const next = { ...prev };
                delete next[row._id];
                return next;
            });
            return;
        }

        setEdits((prev) => ({ ...prev, [row._id]: { ...(prev[row._id] || {}), [field]: value } }));

        const payload = {
            title: row.title,
            amount: Number(row.amount),
            category: row.category,
            paidBy: row.paidBy?._id,
            applicablePartners: (row.applicablePartners || []).map((p) => p?._id || p),
            bsDate: row.bsDate,
            ...{ [field]: value },
        };

        updateExpense(
            { id: row._id, values: payload },
            {
                onSuccess: (res) => {
                    if (res?.success) {
                        invalidateAll();
                        setEdits((prev) => {
                            const next = { ...prev };
                            delete next[row._id];
                            return next;
                        });
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                },
                onError: (error) => toast.error(error?.response?.data?.message),
            }
        );
    };

    const saveDraft = (draft) => {
        const title = String(draft.title || '').trim();
        const amount = Number(draft.amount);
        const paidBy = draft.paidBy;

        if (!title) return toast.error('Item name is required');
        if (!(amount > 0)) return toast.error('Cost must be greater than zero');
        if (!paidBy) return toast.error('Select who paid for this expense');

        const applicablePartners = draft.applicablePartners;
        if (!applicablePartners || applicablePartners.length === 0) {
            return toast.error('Select at least one partner to apply this expense to');
        }

        const bsDate = draft.bsDate || draftDate;

        createExpense(
            {
                values: { title, amount, category: 'secondary', paidBy, applicablePartners, bsDate },
            },
            {
                onSuccess: (res) => {
                    if (res?.success) {
                        invalidateAll();
                        onRemoveDraft(draft._id);
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                },
                onError: (error) => toast.error(error?.response?.data?.message),
            }
        );
    };

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
                isDraft(row) ? (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Save expense">
                            <IconButton size="small" onClick={() => saveDraft(row)}>
                                <CheckRounded fontSize="small" color="success" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Discard">
                            <IconButton size="small" onClick={() => onRemoveDraft(row._id)}>
                                <CloseRounded fontSize="small" color="error" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ) : (
                    <Tooltip title="Delete expense">
                        <IconButton size="small" onClick={() => dialog.show(row, 'delete')}>
                            <DeleteRounded fontSize="small" color="error" />
                        </IconButton>
                    </Tooltip>
                )
            ),
        },
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        {
            key: 'bsDate', label: 'BS Date',
            render: (row) => (
                <Typography variant="body2" color={isDraft(row) ? 'text.secondary' : 'inherit'}>
                    {rowDate(row)}
                </Typography>
            ),
        },
        {
            key: 'title', label: 'Items',
            render: (row) => (
                isDraft(row) ? (
                    <TextField
                        size="small"
                        placeholder="Item name"
                        value={row.title}
                        onChange={(e) => onUpdateDraft(row._id, { title: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                saveDraft(row);
                            }
                        }}
                        sx={{ minWidth: 170, '& .MuiInputBase-input': { fontSize: 13, py: 0.6 } }}
                    />
                ) : (
                    <InlineTextField
                        value={row.title}
                        placeholder="Item name"
                        minWidth={170}
                        onCommit={(v) => commitUpdate(row, 'title', v)}
                    />
                )
            ),
        },
        {
            key: 'amount', label: 'Cost',
            render: (row) => (
                isDraft(row) ? (
                    <TextField
                        size="small"
                        type="number"
                        placeholder="0"
                        value={row.amount}
                        onChange={(e) => onUpdateDraft(row._id, { amount: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                saveDraft(row);
                            }
                        }}
                        sx={{ minWidth: 130, '& .MuiInputBase-input': { fontSize: 13, py: 0.6 } }}
                    />
                ) : (
                    <InlineTextField
                        value={row.amount}
                        type="number"
                        placeholder="0"
                        minWidth={130}
                        onCommit={(v) => commitUpdate(row, 'amount', v)}
                    />
                )
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
                const current = isDraft(row)
                    ? row.paidBy
                    : edits[row._id]?.paidBy ?? row.paidBy?._id;
                return (
                    <TextField
                        select
                        size="small"
                        value={current || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (isDraft(row)) {
                                onUpdateDraft(row._id, { paidBy: value });
                            } else {
                                commitUpdate(row, 'paidBy', value);
                            }
                        }}
                        sx={{ minWidth: 150, '& .MuiInputBase-input': { fontSize: 13, py: 0.6 } }}
                    >
                        <MenuItem value="" disabled>Paid by…</MenuItem>
                        {activePartners.map((p) => (
                            <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                        ))}
                    </TextField>
                );
            },
        },
        {
            key: 'applicablePartners', label: 'Apply To',
            render: (row) => {
                const current = isDraft(row)
                    ? row.applicablePartners
                    : edits[row._id]?.applicablePartners
                    ?? (row.applicablePartners || []).map((p) => p?._id || p);
                return (
                    <PartnerMultiSelect
                        value={current || []}
                        partners={activePartners}
                        onChange={(ids) => {
                            if (isDraft(row)) {
                                onUpdateDraft(row._id, { applicablePartners: ids });
                            } else {
                                commitUpdate(row, 'applicablePartners', ids);
                            }
                        }}
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
                subtitle="Select partners each expense applies to"
                extra={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddRounded />}
                        onClick={onAddDraft}
                    >
                        Add Expense
                    </Button>
                }
            >
                <DataTable
                    columns={columns}
                    data={combined}
                    loading={isLoading}
                    download={{
                        enabled: true,
                        filename: `Secondary Expenses ${selectedMonth}`,
                        excludeColumns: ['actions', 'sn'],
                    }}
                    extra={
                        <NepaliYearMonthPicker
                            value={selectedMonth}
                            onChange={onMonthChange}
                            size="small"
                            fullWidth={false}
                            sx={{ minWidth: 210 }}
                        />
                    }
                />
            </CustomCard>

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
