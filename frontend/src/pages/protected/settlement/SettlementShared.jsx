import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, InputLabel, MenuItem, Stack, TextField, Typography, alpha, useTheme } from '@mui/material';
import { AccountBalanceWalletRounded, BalanceRounded, CompareArrowsRounded } from '@mui/icons-material';
import DataTable from '../../../components/table/DataTable';
import { NepaliYearMonthPicker } from '../../../components/date/NepaliYearMonthPicker';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { useGetActiveGroups } from '../../../apis/groupAPI/GroupAPI';
import { SETTLEMENT_STATUS } from '../../../constant/constant';

export const SettlementMonthPicker = ({ value, onChange }) => (
    <NepaliYearMonthPicker
        value={value}
        onChange={onChange}
        size="small"
        fullWidth={false}
        sx={{ minWidth: 210 }}
    />
);

export const GroupSelector = ({ value, onChange, label = 'Group', allLabel = 'All Groups', minWidth = 180 }) => {
    const { data: groups = [] } = useGetActiveGroups();
    const activeGroups = groups.filter((g) => g.status === 'active');
    return (
        <Stack spacing={0.25} alignItems="center">
            <InputLabel>{label}</InputLabel>
            <TextField
                select
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{ minWidth }}
            >
                <MenuItem value="all">{allLabel}</MenuItem>
                {activeGroups.map((g) => (
                    <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                ))}
            </TextField>
        </Stack>
    );
};

export const SettlementSummaryCard = ({ title, value, subtitle, color }) => {
    const theme = useTheme();
    return (
        <Card
            sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
                background: theme.palette.background.paper,
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: alpha(theme.palette[color].main, 0.12), color: theme.palette[color].main, display: 'flex' }}>
                        {title === 'Total Spent' ? <AccountBalanceWalletRounded /> : title === 'Expected Contribution' ? <CompareArrowsRounded /> : <BalanceRounded />}
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
                        <Typography variant="h6" fontWeight={700} color={`${color}.main`}>{value}</Typography>
                        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export const SettlementSummaryCards = ({ data }) => (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <SettlementSummaryCard title="Total Spent" value={formatToNepaliCurrency(data?.grandTotal || 0)} color="primary" subtitle={`${data?.expenseCount || 0} record(s)`} />
        <SettlementSummaryCard title="Expected Contribution" value={formatToNepaliCurrency(data?.expectedTotal || 0)} color="warning" subtitle="Sum of all fair shares" />
        <SettlementSummaryCard title="Net Balance" value={formatToNepaliCurrency(data?.netBalance || 0)} color="success" subtitle="Should always be 0 (self-balancing)" />
    </Stack>
);

export const SettlementTable = ({ data, isLoading, filename, extra }) => {
    const columns = useMemo(() => [
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        {
            key: 'partner', label: 'Partner',
            render: (row) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        component="img"
                        src={row.partner?.image || '/noAvatar.svg'}
                        onError={(e) => { e.target.src = '/noAvatar.svg'; }}
                        sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <Typography variant="body2" fontWeight={600}>{row.partner?.name || 'Unknown'}</Typography>
                </Stack>
            ),
        },
        {
            key: 'paid', label: 'Paid',
            render: (row) => formatToNepaliCurrency(row.paid),
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.paid) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'expected', label: 'Expected',
            render: (row) => formatToNepaliCurrency(row.expected),
            footerRenderer: ({ data }) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatToNepaliCurrency(data.reduce((sum, row) => sum + (Number(row.expected) || 0), 0))}
                </Typography>
            ),
        },
        {
            key: 'balance', label: 'Balance',
            render: (row) => (
                <Typography
                    variant="body2"
                    fontWeight={700}
                    color={row.balance > 0 ? 'success.main' : row.balance < 0 ? 'error.main' : 'text.secondary'}
                >
                    {formatToNepaliCurrency(Math.abs(row.balance))}
                    {row.balance !== 0 && ` ${row.balance > 0 ? 'to receive' : 'to pay'}`}
                </Typography>
            ),
        },
        {
            key: 'status', label: 'Status',
            render: (row) => {
                const status = SETTLEMENT_STATUS.find((s) => s.value === row.status) || {};
                return (
                    <Chip
                        label={status.label || row.status}
                        color={status.color || 'default'}
                        size="small"
                    />
                );
            },
        },
    ], []);

    return (
        <DataTable
            columns={columns}
            data={data || []}
            loading={isLoading}
            download={{ enabled: true, filename, excludeColumns: ['sn'] }}
            extra={extra}
        />
    );
};
