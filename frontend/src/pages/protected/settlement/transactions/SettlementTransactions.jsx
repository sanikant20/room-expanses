import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, InputLabel, MenuItem, Stack, TableRow, TextField, Typography } from '@mui/material';
import { CompareArrowsRounded } from '@mui/icons-material';
import CustomCard from '../../../../components/custom/CustomCard';
import DataTable from '../../../../components/table/DataTable';
import { StyledTableCell } from '../../../../components/table/StyledTableCell';
import { useGetSettlement } from '../../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../../constant/constant';
import { GroupSelector, SettlementMonthPicker, SettlementStatus } from '../SettlementShared';

const PartnerCell = ({ partner }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar src={partner?.image || '/noAvatar.svg'} sx={{ width: 28, height: 28 }} />
        <Typography variant="body2" fontWeight={600}>{partner?.name || 'Unknown'}</Typography>
    </Stack>
);

const SettlementTransactions = ({ selectedMonth, onMonthChange, group = 'all', onGroupChange }) => {
    const [category, setCategory] = useState(group && group !== 'all' ? 'secondary' : 'all');
    const [source, setSource] = useState('all');

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
    const wholeMonthTransactions = isSettled ? (settlement?.transactions || []) : [];

    const transactions = useMemo(() => {
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
    }, [source, wholeMonthTransactions, settlement?.settleActions]);

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const categoryLabel = category === 'primary' ? 'Primary' : category === 'secondary' ? 'Secondary' : 'Total';
    const sourceLabel = source === 'manual' ? 'Manual' : source === 'auto' ? 'Auto' : monthLabel || 'Whole Month';
    const sourceSuffix = source === 'all' ? categoryLabel : `${categoryLabel} · ${sourceLabel}`;

    const columns = useMemo(() => [
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        { key: 'from', label: 'Pays', render: (row) => <PartnerCell partner={row.from} /> },
        { key: 'to', label: 'Receives', render: (row) => <PartnerCell partner={row.to} /> },
        {
            key: 'amount', label: 'Amount',
            render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
        },
    ], []);

    const total = transactions.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

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
                        download={{ enabled: true, filename: 'Settlement Transactions', excludeColumns: ['sn'] }}
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
                        footer={transactions.length > 0 ? (
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
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                        This month has not been settled yet. Go to the Settlement Summary tab and click "Settle Month".
                    </Typography>
                </Box>
            )}
        </CustomCard >
    );
};

export default SettlementTransactions;
