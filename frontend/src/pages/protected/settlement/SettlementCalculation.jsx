import React, { useMemo, useState } from 'react';
import { Avatar, Chip, InputLabel, MenuItem, Stack, TableRow, TextField, Typography } from '@mui/material';
import CustomCard from '../../../components/custom/CustomCard';
import DataTable from '../../../components/table/DataTable';
import { StyledTableCell } from '../../../components/table/StyledTableCell';
import { CalculateRounded } from '@mui/icons-material';
import { useGetSettlementCalculations } from '../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { SettlementMonthPicker } from './SettlementShared';

const SettlementCalculation = ({ selectedMonth, onMonthChange }) => {
    const [category, setCategory] = useState('');

    const monthObj = parseYearMonthString(selectedMonth);

    const { data, isLoading } = useGetSettlementCalculations({
        ...monthObj,
        category: category || undefined,
    });

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const columns = useMemo(() => [
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        { key: 'bsDate', label: 'BS Date' },
        {
            key: 'title', label: 'Title',
            render: (row) => <Typography variant="body2" fontWeight={600}>{row.title}</Typography>,
        },
        {
            key: 'category', label: 'Category',
            render: (row) => (
                <Chip label={row.category === 'primary' ? 'Primary' : 'Secondary'} color={row.category === 'primary' ? 'primary' : 'warning'} size="small" />
            )
        },
        { key: 'paidBy', label: 'Paid By', render: (row) => row.paidBy?.name || '—' },
        {
            key: 'split', label: 'Split Among',
            render: (row) => (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {(row.partners || []).map((p) => (
                        <Chip
                            key={p._id}
                            size="small"
                            avatar={<Avatar src={p.image || '/noAvatar.svg'} />}
                            label={`${p.name} · ${formatToNepaliCurrency(p.share)}`}
                        />
                    ))}
                </Stack>
            ),
        },
        {
            key: 'amount', label: 'Amount',
            render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
        },
    ], []);

    const rows = data?.rows || [];
    const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    return (
        <CustomCard
            icon={<CalculateRounded />}
            title="Calculations"
            subtitle={`Per-expense split breakdown for ${monthLabel || 'all months'}.`}
        >
            <DataTable
                columns={columns}
                data={rows}
                loading={isLoading}
                download={{ enabled: true, filename: 'Settlement Calculations', excludeColumns: ['sn'] }}
                extra={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <SettlementMonthPicker value={selectedMonth} onChange={onMonthChange} />
                        <Stack spacing={0.25} alignItems="center">
                            <InputLabel>Category</InputLabel>
                            <TextField
                                select
                                size="small"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                sx={{ minWidth: 140 }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="primary">Primary</MenuItem>
                                <MenuItem value="secondary">Secondary</MenuItem>
                            </TextField>
                        </Stack>
                    </Stack>
                }
                footer={rows.length > 0 ? (
                    <TableRow key="total">
                        <StyledTableCell colSpan={columns.length - 1} align="right">
                            <strong>Total:</strong>
                        </StyledTableCell>
                        <StyledTableCell>
                            <strong>{formatToNepaliCurrency(total)}</strong>
                        </StyledTableCell>
                    </TableRow>
                ) : null}
            />
        </CustomCard>
    );
};

export default SettlementCalculation;
