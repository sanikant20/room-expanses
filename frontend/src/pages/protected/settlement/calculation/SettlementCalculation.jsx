import React, { useMemo, useState } from 'react';
import { Avatar, Chip, InputLabel, MenuItem, Stack, TableRow, TextField, Typography } from '@mui/material';
import CustomCard from '../../../../components/custom/CustomCard';
import DataTable from '../../../../components/table/DataTable';
import { StyledTableCell } from '../../../../components/table/StyledTableCell';
import { CalculateRounded } from '@mui/icons-material';
import { useGetSettlement, useGetSettlementCalculations } from '../../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../../constant/constant';
import { GroupSelector, SettlementMonthPicker, SettlementStatus } from '../SettlementShared';

const SettlementCalculation = ({ selectedMonth, onMonthChange }) => {
    const [category, setCategory] = useState('all');
    const [group, setGroup] = useState('all');

    const monthObj = parseYearMonthString(selectedMonth);

    const categoryFilter = category === 'all' ? undefined : category;
    const groupFilter = category === 'secondary' && group !== 'all' ? group : undefined;

    const { data, isLoading } = useGetSettlementCalculations({
        ...monthObj,
        category: categoryFilter,
        ...(groupFilter ? { group: groupFilter } : {}),
    });

    const { data: settlementData } = useGetSettlement({
        ...monthObj,
        category: categoryFilter,
        ...(groupFilter ? { group: groupFilter } : {}),
    });
    const settlement = settlementData?.settlement;

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        if (e.target.value !== 'secondary') setGroup('all');
    };

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const settledScopeLabel = settlement?.fromDate && settlement?.toDate
        ? `${settlement.fromDate} - ${settlement.toDate}`
        : monthLabel || 'this month';

    const rows = data?.rows || [];

    const hasGroup = rows.some((row) => row.group);

    const columns = useMemo(() => [
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        { key: 'bsDate', label: 'BS Date' },
        {
            key: 'title', label: 'Items',
            render: (row) => <Typography variant="body2" fontWeight={600}>{row.title}</Typography>,
        },
        {
            key: 'category', label: 'Category',
            render: (row) => (
                <Chip label={row.category === 'primary' ? 'Primary' : 'Secondary'} color={row.category === 'primary' ? 'primary' : 'warning'} size="small" />
            )
        },
        ...(hasGroup ? [{
            key: 'group', label: 'Group',
            render: (row) => row.group ? (
                <Chip label={row.group?.name || row.group} size="small" variant="outlined" color="primary" />
            ) : '—',
        }] : []),
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
    ], [hasGroup]);

    const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    return (
        <CustomCard
            icon={<CalculateRounded />}
            title="Calculations"
            subtitle={`Per-expense split breakdown for ${monthLabel || 'all months'}.`}
            extra={<SettlementStatus settlement={settlement} scope={settledScopeLabel} />}
        >
            <DataTable
                columns={columns}
                data={rows}
                loading={isLoading}
                download={{ enabled: true, filename: 'Settlement Calculations', excludeColumns: ['sn'] }}
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
                                onChange={handleCategoryChange}
                                sx={{ minWidth: { xs: 0, md: 140 }, width: { xs: '100%', md: 'auto' } }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="primary">Primary</MenuItem>
                                <MenuItem value="secondary">Secondary</MenuItem>
                            </TextField>
                        </Stack>
                        {category === 'secondary' && (
                            <GroupSelector value={group} onChange={setGroup} label="Group" allLabel="All Groups" />
                        )}
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
