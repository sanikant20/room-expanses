import React, { useState } from 'react';
import { InputLabel, MenuItem, Stack, TextField } from '@mui/material';
import CustomCard from '../../../components/custom/CustomCard';
import { CategoryRounded } from '@mui/icons-material';
import { useGetCategoryReport } from '../../../apis/reportAPI/ReportAPI';
import { useGetActiveGroups } from '../../../apis/groupAPI/GroupAPI';
import { parseYearMonthString } from '../../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../../constant/constant';
import { ExpenseTable, ReportMonthPicker } from './ReportShared';

const ReportCategoryWise = ({ selectedMonth, onMonthChange }) => {
    const [category, setCategory] = useState('all');
    const [group, setGroup] = useState('all');

    const { data: groups = [] } = useGetActiveGroups();

    const selectedMonthObj = parseYearMonthString(selectedMonth);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        if (e.target.value !== 'secondary') setGroup('all');
    };

    const { data: categoryData, isLoading } = useGetCategoryReport({
        category,
        group: category === 'secondary' && group !== 'all' ? group : undefined,
        ...selectedMonthObj,
    });

    const monthLabel = selectedMonthObj.bsYear && selectedMonthObj.bsMonth
        ? `${getNepaliMonthLabel(selectedMonthObj.bsMonth)} ${selectedMonthObj.bsYear}`
        : '';

    return (
        <CustomCard
            icon={<CategoryRounded />}
            headerInline={false}
            title="Category Report"
            subtitle={`Expenses by category for ${monthLabel || 'all months'}.`}
        >
            <ExpenseTable
                data={categoryData?.expenses}
                isLoading={isLoading}
                filename="Category Expense Report"
                extra={
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'stretch', md: 'flex-end' }}
                        sx={{ flexWrap: 'wrap', width: '100%' }}
                    >
                        <ReportMonthPicker value={selectedMonth} onChange={onMonthChange} />
                        <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            <InputLabel>Category</InputLabel>
                            <TextField
                                select
                                size="small"
                                value={category}
                                onChange={handleCategoryChange}
                                placeholder="Select category"
                                sx={{ minWidth: { xs: 0, md: 160 }, width: { xs: '100%', md: 'auto' } }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="primary">Primary</MenuItem>
                                <MenuItem value="secondary">Secondary</MenuItem>
                            </TextField>
                        </Stack>
                        {category === 'secondary' && (
                            <Stack spacing={0.25} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                                <InputLabel>Group</InputLabel>
                                <TextField
                                    select
                                    size="small"
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    placeholder="Select group"
                                    sx={{ minWidth: { xs: 0, md: 180 }, width: { xs: '100%', md: 'auto' } }}
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
