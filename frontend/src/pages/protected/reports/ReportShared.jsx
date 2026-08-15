import React, { useMemo } from 'react';
import { Box, Chip, InputLabel, Stack, TableRow, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DataTable from '../../../components/table/DataTable';
import { StyledTableCell } from '../../../components/table/StyledTableCell';
import { NepaliYearMonthPicker } from '../../../components/date/NepaliYearMonthPicker';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';

export const StatBadge = ({ label, value, color }) => (
    <Box sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.3)}`,
        minWidth: 0,
        flex: '1 1 0%',
    }}>
        <InputLabel sx={{ fontSize: '0.7rem', mb: 0 }}>{label}</InputLabel>
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color }}>
            {value}
        </Box>
    </Box>
);

export const StatBadges = ({ items = [] }) => (
    <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, flex: '1 1 0%', minWidth: 0 }}>
        {items.map((item, index) => (
            <StatBadge key={index} {...item} />
        ))}
    </Stack>
);

export const ReportMonthPicker = ({ value, onChange }) => (
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

export const ExpenseTable = ({ data, isLoading, filename, extra }) => {
    const hasGroup = (data || []).some((row) => row.group);

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
            key: 'amount', label: 'Amount',
            render: (row) => <Typography variant="body2" fontWeight={700}>{formatToNepaliCurrency(row.amount)}</Typography>,
        },
    ], [hasGroup]);

    const total = (data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    return (
        <DataTable
            columns={columns}
            data={data || []}
            loading={isLoading}
            download={{ enabled: true, filename, excludeColumns: ['sn'] }}
            extra={extra}
            footer={(data || []).length > 0 ? (
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
    );
};
