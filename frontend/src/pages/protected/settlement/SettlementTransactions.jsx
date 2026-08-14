import React, { useMemo, useState } from 'react';
import { Avatar, Box, Chip, InputLabel, MenuItem, Stack, TableRow, TextField, Typography } from '@mui/material';
import { CheckCircleRounded, CompareArrowsRounded } from '@mui/icons-material';
import CustomCard from '../../../components/custom/CustomCard';
import DataTable from '../../../components/table/DataTable';
import { StyledTableCell } from '../../../components/table/StyledTableCell';
import { useGetSettlement } from '../../../apis/settlementAPI/SettlementAPI';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { convertToBSFormat } from '../../../utils/dateConverter';
import { SettlementMonthPicker } from './SettlementShared';

const PartnerCell = ({ partner }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar src={partner?.image || '/noAvatar.svg'} sx={{ width: 28, height: 28 }} />
        <Typography variant="body2" fontWeight={600}>{partner?.name || 'Unknown'}</Typography>
    </Stack>
);

const SettlementTransactions = ({ selectedMonth, onMonthChange }) => {
    const [category, setCategory] = useState('');

    const monthObj = parseYearMonthString(selectedMonth);

    const { data, isLoading } = useGetSettlement({
        ...monthObj,
        category: category || undefined,
    });

    const settlement = data?.settlement;
    const isSettled = settlement?.status === 'settled';
    const transactions = isSettled ? (settlement?.transactions || []) : [];

    const monthLabel = monthObj.bsYear && monthObj.bsMonth
        ? `${getNepaliMonthLabel(monthObj.bsMonth)} ${monthObj.bsYear}`
        : '';

    const categoryLabel = category === 'primary' ? 'Primary' : category === 'secondary' ? 'Secondary' : 'Total';

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
            subtitle={isSettled ? `Who pays whom for ${monthLabel || 'this month'} · ${categoryLabel}.` : `Not settled yet for ${monthLabel || 'this month'} · ${categoryLabel}.`}
            extra={
                <Stack direction="column" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    {isSettled && <Chip icon={<CheckCircleRounded />} label="Settled" color="success" size="small" />}
                    <Typography variant="caption" color="text.secondary">
                        Settled by {settlement?.settledBy?.name || '—'} on {settlement?.settledAt
                            ? `${convertToBSFormat(settlement.settledAt)}, ${new Date(settlement.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                            : '—'}
                    </Typography>
                </Stack>
            }>
            {isSettled ? (
                <>
                    <DataTable
                        columns={columns}
                        data={transactions}
                        loading={isLoading}
                        download={{ enabled: true, filename: 'Settlement Transactions', excludeColumns: ['sn'] }}
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
