import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, InputLabel, MenuItem, Stack, TextField, Typography, alpha, useTheme } from '@mui/material';
import { AccountBalanceWalletRounded, BalanceRounded, CheckCircleRounded, CompareArrowsRounded } from '@mui/icons-material';
import DataTable from '../../../components/table/DataTable';
import { NepaliYearMonthPicker } from '../../../components/date/NepaliYearMonthPicker';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { convertToBSFormat } from '../../../utils/dateConverter';
import { useGetActiveGroups } from '../../../apis/groupAPI/GroupAPI';
import { SETTLEMENT_STATUS } from '../../../constant/constant';

export const SettlementMonthPicker = ({ value, onChange }) => (
    <NepaliYearMonthPicker
        value={value}
        onChange={onChange}
        size="small"
        fullWidth={false}
        sx={{
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: 0, md: 210 },
            '& .MuiTextField-root': { width: '100%' },
        }}
    />
);

export const SettlementStatus = ({ settlement, scope = '', align = { xs: 'flex-start', sm: 'flex-end' } }) => {
    const isSettled = settlement?.status === 'settled';
    const settledByLabel = settlement?.settledBy?.name || 'Auto System';
    const settledAtLabel = settlement?.settledAt
        ? `${convertToBSFormat(settlement.settledAt)}, ${new Date(settlement.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
        : '—';
    if (!isSettled) return null;
    return (
        <Stack direction="column" spacing={0.5} alignItems={align} sx={{ flexWrap: 'wrap' }}>
            <Chip icon={<CheckCircleRounded />} label="Settled" color="success" size="small" />
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: '100%', textAlign: { xs: 'left', sm: 'right' } }}
            >
                Settled by {settledByLabel} on {settledAtLabel}
                {scope ? ` (${scope})` : ''}
            </Typography>
        </Stack>
    );
};

export const GroupSelector = ({ value, onChange, label = 'Group', allLabel = 'All Groups', minWidth = 180 }) => {
    const { data: groups = [] } = useGetActiveGroups();
    const activeGroups = groups.filter((g) => g.status === 'active');
    return (
        <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <InputLabel>{label}</InputLabel>
            <TextField
                select
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{ minWidth: { xs: 0, md: minWidth }, width: { xs: '100%', md: 'auto' } }}
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
                flex: '1 1 220px',
                minWidth: 0,
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: alpha(theme.palette[color].main, 0.12), color: theme.palette[color].main, display: 'flex', flexShrink: 0 }}>
                        {title === 'Total Spent' ? <AccountBalanceWalletRounded /> : title === 'Average Contribution' ? <CompareArrowsRounded /> : <BalanceRounded />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: '1 1 160px' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
                        <Typography variant="h6" fontWeight={700} color={`${color}.main`} sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
                        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export const SettlementSummaryCards = ({ data }) => {
    const partnerCount = (data?.rows || []).length;
    const avgContribution = partnerCount > 0 ? ((data?.expectedTotal || 0) / partnerCount) : 0;
    return (
        <Stack
            direction="row"
            sx={{
                flexWrap: 'wrap',
                width: '100%',
                gap: { xs: 2.5, sm: 2 },
            }}
        >
            <SettlementSummaryCard title="Total Spent" value={formatToNepaliCurrency(data?.grandTotal || 0)} color="primary" subtitle={`${data?.expenseCount || 0} record(s)`} />
            <SettlementSummaryCard title="Average Contribution" value={formatToNepaliCurrency(avgContribution)} color="warning" subtitle={`Avg share per partner (${partnerCount} partner(s))`} />
            <SettlementSummaryCard title="Net Balance" value={formatToNepaliCurrency(data?.netBalance || 0)} color="success" subtitle="Should always be 0 (self-balancing)" />
        </Stack>
    );
};

export const SettlementTable = ({ data, isLoading, filename, extra, actions }) => {
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
            actions={actions}
        />
    );
};
