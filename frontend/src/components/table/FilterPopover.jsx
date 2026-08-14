import React, { useMemo } from 'react';
import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    TextField,
    Typography,
    useTheme,
    Stack,
    IconButton,
    Divider,
    Badge,
    Tooltip
} from '@mui/material';
import {
    TuneRounded,
    CloseRounded,
    FilterListAlt
} from '@mui/icons-material';

const FilterPopover = ({ columns = [], handleFilterChange, clearAllFilters, filterConfig, uniqueValues, excludeColumns = [] }) => {
    const theme = useTheme();

    const filterableColumns = useMemo(
        () => columns.filter(col => col.filterType !== false && !excludeColumns.includes(col.key)),
        [columns, excludeColumns]
    );

    const hasActiveFilters = useMemo(
        () => Object.keys(filterConfig).some(
            key => filterConfig[key]?.value !== undefined &&
                (!Array.isArray(filterConfig[key]?.value) || filterConfig[key]?.value.length > 0)
        ),
        [filterConfig]
    );

    const activeFilterCount = useMemo(
        () => Object.keys(filterConfig).filter(key =>
            filterConfig[key]?.value !== undefined &&
            (!Array.isArray(filterConfig[key]?.value) || filterConfig[key]?.value.length > 0)
        ).length,
        [filterConfig]
    );

    return (
        <Box sx={{
            p: 1.5,
            width: 300,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton size="small" sx={{
                        px: 1, borderRadius: 1,
                        backgroundColor: `${theme.palette.primary.main}10`,
                        color: theme.palette.primary.main,
                    }}>
                        <FilterListAlt sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight={600} fontSize="0.9rem">
                        Filters
                    </Typography>
                </Stack>

                <Tooltip title={hasActiveFilters ? 'Clear all filters' : 'No active filters'} arrow>
                    <IconButton
                        size="small"
                        onClick={clearAllFilters}
                        disabled={!hasActiveFilters}
                        sx={{
                            ml: 'auto',
                            p: 0.5, borderRadius: 1,
                            color: hasActiveFilters ? theme.palette.primary.main : theme.palette.text.disabled,
                            '&:hover': { backgroundColor: `${theme.palette.primary.main}08` },
                        }}
                    >
                        <Badge
                            badgeContent={activeFilterCount}
                            color="primary"
                            sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16, borderRadius: 8 } }}
                        >
                            <CloseRounded sx={{ fontSize: 16 }} />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {filterableColumns.length > 0 ? (
                <Stack spacing={0.5} sx={{
                    maxHeight: '400px', overflowY: 'auto', pr: 0.5,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.action.hover, borderRadius: 2 },
                }}>
                    {filterableColumns.map(col => {
                        const options = col.filterType === 'boolean'
                            ? ['true', 'false']
                            : (uniqueValues[col.key] || []);

                        return (
                            <Box key={col.key} sx={{
                                p: 1, borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.default,
                            }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                                    {col.label}
                                </Typography>

                                <Autocomplete
                                    multiple
                                    size="small"
                                    options={options}
                                    value={filterConfig[col.key]?.value || []}
                                    onChange={(event, newValue) => handleFilterChange(col.key, newValue, 'select')}
                                    getOptionLabel={(option) => {
                                        if (option === null || option === undefined) return '';
                                        return col.filterType === 'boolean' ? (option === 'true' ? 'Yes' : 'No') : String(option);
                                    }}
                                    disableCloseOnSelect
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            placeholder="Select..."
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.8rem' } }}
                                        />
                                    )}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props} style={{ padding: '4px 8px' }}>
                                            <Checkbox size="small" sx={{ mr: 0.5, py: 0 }} checked={selected} color="primary" />
                                            <Typography variant="body2" fontSize="0.8rem">
                                                {col.filterType === 'boolean' ? (option === 'true' ? 'Yes' : 'No') : String(option)}
                                            </Typography>
                                        </li>
                                    )}
                                    renderTags={(value) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, mt: 0.5 }}>
                                            {value.slice(0, 2).map((option, index) => (
                                                <Chip
                                                    key={option}
                                                    label={col.filterType === 'boolean' ? (option === 'true' ? 'Yes' : 'No') : String(option)}
                                                    size="small"
                                                    color="primary"
                                                    variant="filled"
                                                    onDelete={() => {
                                                        const newValue = value.filter((_, i) => i !== index);
                                                        handleFilterChange(col.key, newValue, 'select');
                                                    }}
                                                    deleteIcon={<CloseRounded sx={{ fontSize: 14 }} />}
                                                    sx={{ height: 20, fontSize: '0.7rem', borderRadius: 1 }}
                                                />
                                            ))}
                                            {value.length > 2 && (
                                                <Chip
                                                    label={`+${value.length - 2}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.7rem', borderRadius: 1 }}
                                                />
                                            )}
                                        </Box>
                                    )}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                mt: 0.5, borderRadius: 1, boxShadow: theme.shadows[3],
                                                '& .MuiAutocomplete-listbox': {
                                                    py: 0, maxHeight: 160,
                                                    '& li': { minHeight: 32 },
                                                    '& .MuiAutocomplete-option': { padding: '4px 8px' },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Stack>
            ) : (
                <Box sx={{ textAlign: 'center', py: 2, borderRadius: 1 }}>
                    <TuneRounded sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5, opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem" sx={{ fontStyle: 'italic' }}>
                        No filters available
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(FilterPopover);
