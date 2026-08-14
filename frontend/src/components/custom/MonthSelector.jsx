import React from 'react';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CalendarMonthRounded } from '@mui/icons-material';
import { NEPALI_MONTHS, getNepaliMonthLabel, BS_YEAR_RANGE } from '../../constant/constant';

const MonthSelector = ({ value = { bsYear: null, bsMonth: null }, onChange, size = 'small' }) => {
    const years = [];
    for (let year = BS_YEAR_RANGE.max; year >= BS_YEAR_RANGE.min; year--) {
        years.push(year);
    }

    const handleYearChange = (e) => {
        onChange?.({ ...value, bsYear: Number(e.target.value) });
    };

    const handleMonthChange = (e) => {
        onChange?.({ ...value, bsMonth: Number(e.target.value) });
    };

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <CalendarMonthRounded />
            </Box>
            <TextField
                select
                size={size}
                label="BS Year"
                value={value.bsYear || ''}
                onChange={handleYearChange}
                sx={{ minWidth: 110 }}
            >
                {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                size={size}
                label="Nepali Month"
                value={value.bsMonth || ''}
                onChange={handleMonthChange}
                sx={{ minWidth: 150 }}
            >
                {NEPALI_MONTHS.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                        {getNepaliMonthLabel(month.value)}
                    </MenuItem>
                ))}
            </TextField>
            {value.bsYear && value.bsMonth && (
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {getNepaliMonthLabel(value.bsMonth)} {value.bsYear}
                </Typography>
            )}
        </Stack>
    );
};

export default MonthSelector;
