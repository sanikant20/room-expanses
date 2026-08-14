import React, { useMemo, useState } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Popover, Select, Stack, TextField } from '@mui/material'
import { CalendarMonthRounded } from '@mui/icons-material'

const NEPALI_MONTHS = [
    { value: 1, label: 'Baisakh' },
    { value: 2, label: 'Jestha' },
    { value: 3, label: 'Ashad' },
    { value: 4, label: 'Shrawan' },
    { value: 5, label: 'Bhadra' },
    { value: 6, label: 'Ashwin' },
    { value: 7, label: 'Kartik' },
    { value: 8, label: 'Mangsir' },
    { value: 9, label: 'Poush' },
    { value: 10, label: 'Magh' },
    { value: 11, label: 'Falgun' },
    { value: 12, label: 'Chaitra' },
]

export const NepaliYearMonthPicker = ({ value, onChange, size = 'small', fullWidth = true, sx = {}, minYear = 2070, maxYear = 2100 }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const year = value ? value.split('/')[0] : ''
    const month = value ? value.split('/')[1] : ''

    const monthLabel = month
        ? NEPALI_MONTHS.find((m) => String(m.value).padStart(2, '0') === month)?.label || ''
        : ''

    const displayText = year && monthLabel ? `${year} ${monthLabel}` : ''

    const years = useMemo(() => {
        const result = []
        for (let y = minYear; y <= maxYear; y++) {
            result.push(y)
        }
        return result
    }, [minYear, maxYear])

    const handleClick = (e) => {
        setAnchorEl(e.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleYearChange = (e) => {
        const newYear = e.target.value
        const newMonth = value ? value.split('/')[1] || '' : ''
        if (newYear && newMonth) {
            onChange(`${newYear}/${String(newMonth).padStart(2, '0')}`)
            handleClose()
        } else {
            onChange(newYear ? `${newYear}/` : '')
        }
    }

    const handleMonthChange = (e) => {
        const newMonth = e.target.value
        const newYear = value ? value.split('/')[0] || '' : ''
        if (newYear && newMonth) {
            onChange(`${newYear}/${String(newMonth).padStart(2, '0')}`)
            handleClose()
        } else {
            onChange('')
        }
    }

    return (
        <Box sx={{ ...sx }}>
            <Stack spacing={0.25} alignItems="center">
                <InputLabel>Year & Month</InputLabel>
                <TextField
                    size={size}
                    fullWidth={fullWidth}
                    placeholder="Select Nepali Year-Month"
                    value={displayText}
                    onClick={handleClick}
                    slotProps={{
                        input: {
                            readOnly: true,
                            sx: { cursor: 'pointer' },
                            endAdornment: <CalendarMonthRounded sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />,
                        },
                    }}
                />
            </Stack>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ paper: { sx: { p: 1.5, display: 'flex', gap: 1, minWidth: 240 } } }}
            >
                <Stack size={size} fullWidth spacing={0.25}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={year}
                        onChange={handleYearChange}
                        label="Year"
                        displayEmpty
                        autoFocus
                        MenuProps={{ disablePortal: true }}
                    >
                        <MenuItem value="">--Year--</MenuItem>
                        {years.map((y) => (
                            <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                        ))}
                    </Select>
                </Stack>
                <Stack size={size} fullWidth spacing={0.25}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={month}
                        onChange={handleMonthChange}
                        label="Month"
                        displayEmpty
                        disabled={!year}
                        MenuProps={{ disablePortal: true }}
                    >
                        <MenuItem value="">--Month--</MenuItem>
                        {NEPALI_MONTHS.map((m) => (
                            <MenuItem key={m.value} value={String(m.value).padStart(2, '0')}>{m.label}</MenuItem>
                        ))}
                    </Select>
                </Stack>
            </Popover>
        </Box>
    )
}
