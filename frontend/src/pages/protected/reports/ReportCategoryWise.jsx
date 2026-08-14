import React, { useState } from 'react';
import { InputLabel, MenuItem, Stack, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomCard from '../../../components/custom/CustomCard';
import { CategoryRounded } from '@mui/icons-material';
import { useGetCategoryReport } from '../../../apis/reportAPI/ReportAPI';
import { useGetActiveGroups } from '../../../apis/groupAPI/GroupAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { formatToNepaliCurrency } from '../../../utils/currencyFormat';
import { ExpenseTable, ReportMonthPicker, StatBadges } from './ReportShared';

const ReportCategoryWise = ({ selectedMonth, onMonthChange }) => {
    const theme = useTheme();
    const [category, setCategory] = useState('primary');
    const [group, setGroup] = useState('all');

    const { data: groups = [] } = useGetActiveGroups();

    const selectedMonthObj = parseYearMonthString(selectedMonth);

    const { data: categoryData, isLoading } = useGetCategoryReport({
        category,
        group: group === 'all' ? undefined : group,
        ...selectedMonthObj,
    });
    const summary = categoryData?.summary || {};

    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    return (
        <CustomCard
            icon={<CategoryRounded />}
            title="Category Report"
            subtitle={`Expenses by category for ${monthLabel || 'all months'}.`}
            extra={
                <StatBadges items={[
                    { label: `Total (${summary.expenseCount || 0} records)`, value: formatToNepaliCurrency(summary.grandTotal || 0), color: theme.palette.primary.main },
                ]} />
            }
        >
            <ExpenseTable
                data={categoryData?.expenses}
                isLoading={isLoading}
                filename="Category Expense Report"
                extra={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <ReportMonthPicker value={selectedMonth} onChange={onMonthChange} />
                        <Stack spacing={0.25} alignItems="center">
                            <InputLabel>Category</InputLabel>
                            <TextField
                                select
                                size="small"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Select category"
                                sx={{ minWidth: 160 }}
                            >
                                <MenuItem value="primary">Primary</MenuItem>
                                <MenuItem value="secondary">Secondary</MenuItem>
                            </TextField>
                        </Stack>
                        {category === 'secondary' && (
                            <Stack spacing={0.25} alignItems="center">
                                <InputLabel>Group</InputLabel>
                                <TextField
                                    select
                                    size="small"
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    placeholder="Select group"
                                    sx={{ minWidth: 180 }}
                                >
                                    <MenuItem value="all">All Groups</MenuItem>
                                    {groups.map((g) => (
                                        <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        )}
                    </Stack>
                }
            />
        </CustomCard>
    );
};

export default ReportCategoryWise;
