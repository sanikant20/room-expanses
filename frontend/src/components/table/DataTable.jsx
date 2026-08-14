import React, { useState, useMemo, useEffect } from 'react';
import {
    Table, TableBody, TableContainer, TableHead, TableRow, TableFooter,
    TextField, Pagination, Typography,
    Box, useTheme, IconButton, Tooltip, Checkbox, TableSortLabel, CircularProgress, Popover,
    Skeleton, Autocomplete, InputAdornment, Badge
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Search, Close, FilterListAlt, ViewColumn,
    PushPinRounded,
    PushPinOutlined,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material';
import FilterPopover from './FilterPopover';
import DataExporter from './DataExporter';
import ColumnVisibilityPopover from './ColumnVisibilityPopover';
import useColumnVisibility from './useColumnVisibility';
import { StyledTableCell } from './StyledTableCell';

// Extract a searchable/filterable scalar (or array of scalars) from a row for
// a given column. Handles plain values, object values (e.g. paidBy/group) and
// array values (e.g. applicablePartners) so filters display real data.
const getCellValueForFilter = (row, col) => {
    if (typeof col.filterValue === 'function') {
        return col.filterValue(row);
    }
    const value = row?.[col.key];
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) {
        return value
            .map((item) => (item && typeof item === 'object' ? (item.name ?? item._id) : item))
            .filter((item) => item !== null && item !== undefined);
    }
    if (typeof value === 'object') {
        return value.name ?? value._id ?? String(value);
    }
    return value;
};

const DataTable = ({
    columns = [],
    data = [],
    rowsPerPageOptions = [10, 25, 50],
    defaultRowsPerPage = 15,
    selectable = false,
    onSelectionChange = () => { },
    extra = null,
    actions = null,
    download = { enabled: true, excludeColumns: ['sn', 'actions'], filename: '' },
    footer = null,
    loading = false,
    tableId = 'default',
    footerProps = { sticky: true, backgroundColor: 'background.paper' }
}) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [selected, setSelected] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterConfig, setFilterConfig] = useState({});
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [columnVisibilityAnchorEl, setColumnVisibilityAnchorEl] = useState(null);
    const [isPinningEnabled, setIsPinningEnabled] = useState(true); // Default enabled

    // Use column visibility hook
    const {
        hiddenColumns,
        filteredColumns,
        toggleColumn,
        showAllColumns,
        hideAllColumns,
        getAllSelectableColumnKeys,
    } = useColumnVisibility(columns, tableId);

    // Separate fixed columns based on column definition - now supports left and right
    const { leftFixedColumns, rightFixedColumns, scrollableColumns } = useMemo(() => {
        const leftFixed = filteredColumns.filter(col => col.fixed === 'left' || col.fixed === true);
        const rightFixed = filteredColumns.filter(col => col.fixed === 'right');
        const scrollable = filteredColumns.filter(col => !col.fixed && col.fixed !== 'left' && col.fixed !== 'right' && col.fixed !== true);

        return {
            leftFixedColumns: leftFixed,
            rightFixedColumns: rightFixed,
            scrollableColumns: scrollable
        };
    }, [filteredColumns]);

    // Check if any column has footer
    const hasColumnFooters = useMemo(() => {
        return filteredColumns.some(col => col.footer || col.footerRenderer);
    }, [filteredColumns]);

    const filterExcludeColumns = useMemo(() => {
        const excluded = new Set(['actions', 'sn']);
        filteredColumns.forEach((col) => {
            if (col.filterable === false || col.filterType === false) {
                excluded.add(col.key);
            }
        });
        return [...excluded];
    }, [filteredColumns]);

    const uniqueValues = useMemo(() => {
        const map = {};
        filteredColumns.forEach(col => {
            if (col.filterType === false || filterExcludeColumns.includes(col.key)) return;
            const values = (data || []).flatMap((row) => {
                const extracted = getCellValueForFilter(row, col);
                return Array.isArray(extracted) ? extracted : [extracted];
            });
            map[col.key] = [...new Set(
                values
                    .filter((v) => v !== undefined && v !== null && v !== '')
                    .map((v) => String(v))
            )];
        });
        return map;
    }, [filteredColumns, data, filterExcludeColumns]);

    const processedData = useMemo(() => {
        let result = data !== null ? [...data] : [];

        if (searchTerm) {
            result = result.filter(row =>
                filteredColumns.some(col => {
                    const extracted = getCellValueForFilter(row, col);
                    const values = Array.isArray(extracted) ? extracted : [extracted];
                    return values.some(v =>
                        v !== undefined && v !== null &&
                        String(v).toLowerCase().includes(searchTerm.toLowerCase())
                    );
                })
            );
        }

        Object.entries(filterConfig).forEach(([key, filter]) => {
            if (filter?.value && filteredColumns.some(col => col.key === key)) {
                const col = filteredColumns.find(c => c.key === key);
                result = result.filter(row => {
                    const cellValue = getCellValueForFilter(row, col);
                    if (filter.type === 'text') {
                        return cellValue !== undefined && cellValue !== null &&
                            String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase());
                    } else if (filter.type === 'boolean') {
                        return String(cellValue) === String(filter.value);
                    } else if (filter.type === 'select') {
                        if (Array.isArray(filter.value) && filter.value.length === 0) {
                            return true;
                        }
                        const values = Array.isArray(cellValue) ? cellValue : [cellValue];
                        return values.some(v =>
                            v !== undefined && v !== null && filter.value.includes(String(v))
                        );
                    } else if (filter.type === 'date') {
                        const rowDateObj = new Date(cellValue);
                        const filterDateObj = new Date(filter.value);

                        if (isNaN(rowDateObj) || isNaN(filterDateObj)) {
                            return false;
                        }

                        const rowDate = rowDateObj.toISOString().split('T')[0];
                        const filterDate = filterDateObj.toISOString().split('T')[0];
                        return rowDate === filterDate;
                    }
                    return true;
                });
            }
        });

        if (sortConfig.key && filteredColumns.some(col => col.key === sortConfig.key)) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortConfig, filterConfig, filteredColumns]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return processedData?.slice(start, start + rowsPerPage);
    }, [processedData, page, rowsPerPage]);

    // Selection helper functions
    const getRowId = (row) => {
        return row.id || row._id || JSON.stringify(row);
    };

    const isRowSelected = (row) => {
        return selected.some(selectedRow => getRowId(selectedRow) === getRowId(row));
    };

    const isAllRowsSelected = () => {
        return processedData.length > 0 && selected.length === processedData.length;
    };

    const isSomeRowsSelected = () => {
        return selected.length > 0 && selected.length < processedData.length;
    };

    // Selection handlers
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(processedData);
            onSelectionChange(processedData);
        } else {
            setSelected([]);
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (event, row) => {
        event.stopPropagation();

        let newSelected;

        if (isRowSelected(row)) {
            newSelected = selected.filter(selectedRow =>
                getRowId(selectedRow) !== getRowId(row)
            );
        } else {
            newSelected = [...selected, row];
        }

        setSelected(newSelected);
        onSelectionChange(newSelected);
    };

    const handleSelectAllOnCurrentPage = () => {
        const allOnPageSelected = paginatedData.every(isRowSelected);

        let newSelected;

        if (allOnPageSelected) {
            newSelected = selected.filter(selectedRow =>
                !paginatedData.some(pageRow => getRowId(pageRow) === getRowId(selectedRow))
            );
        } else {
            const toAdd = paginatedData.filter(pageRow => !isRowSelected(pageRow));
            newSelected = [...selected, ...toAdd];
        }

        setSelected(newSelected);
        onSelectionChange(newSelected);
    };

    // Reset selection when data changes significantly
    useEffect(() => {
        if (selected.length > 0) {
            setSelected([]);
            onSelectionChange([]);
        }
    }, [data]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
        setPage(1);
    };

    const handleFilterChange = (key, value, type) => {
        setFilterConfig(prev => {
            if ((Array.isArray(value) && value.length === 0) || !value) {
                const newConfig = { ...prev };
                delete newConfig[key];
                return newConfig;
            }
            return {
                ...prev,
                [key]: { value, type }
            };
        });
        setPage(1);
    };

    const clearAllFilters = () => {
        setFilterConfig({});
        setPage(1);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleColumnVisibilityClick = (event) => {
        setColumnVisibilityAnchorEl(event.currentTarget);
    };

    const handleColumnVisibilityClose = () => {
        setColumnVisibilityAnchorEl(null);
    };

    const togglePinning = () => {
        setIsPinningEnabled(!isPinningEnabled);
    };

    const filterOpen = Boolean(filterAnchorEl);
    const columnVisibilityOpen = Boolean(columnVisibilityAnchorEl);

    // Calculate left position for left fixed columns
    const getLeftPosition = (index) => {
        if (!isPinningEnabled) return 0;

        let left = selectable ? 48 : 0; // Checkbox column width

        for (let i = 0; i < index; i++) {
            const col = leftFixedColumns[i];
            const estimatedWidth = col.estimatedWidth ||
                (col.label.length * 8) + 52;
            left += estimatedWidth;
        }

        return left;
    };

    // Calculate right position for right fixed columns
    const getRightPosition = (index) => {
        if (!isPinningEnabled) return 0;

        let right = 0;

        // Calculate from the rightmost column inward
        for (let i = rightFixedColumns.length - 1; i > index; i--) {
            const col = rightFixedColumns[i];
            const estimatedWidth = col.estimatedWidth ||
                (col.label.length * 8) + 10;
            right += estimatedWidth;
        }

        return right;
    };

    // Render footer cell content
    const renderFooterCell = (col) => {
        if (col.footerRenderer) {
            return col.footerRenderer({
                data: processedData,
                paginatedData,
                column: col
            });
        }
        if (col.footer) {
            return col.footer;
        }
        return null;
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    mb: 1,
                    width: '100%',
                }}
            >
                {/* Left Section - Selection Info & Actions */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                    order: { xs: 2, md: 1 },
                    justifyContent: { xs: 'flex-start', md: 'flex-start' },
                    minWidth: 0,
                    flexWrap: 'wrap'
                }}>
                    {/* Selection Info */}
                    {/* {selected.length > 0 && selectable && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexShrink: 0
                        }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                {selected.length} {selected.length === 1 ? 'row' : 'rows'} selected
                            </Typography>
                            <Tooltip title="Clear selection" arrow>
                                <IconButton
                                    size="small"
                                    onClick={clearAllSelection}
                                    sx={{ p: 0.5, flexShrink: 0 }}
                                >
                                    <Close fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )} */}

                    {/* Extra Content - Forms, Filters etc. */}
                    {extra && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'stretch', md: 'center' },
                            gap: 1,
                            flexShrink: 0,
                            minWidth: 0,
                            width: { xs: '100%', md: 'auto' }
                        }}>
                            {typeof extra === 'function'
                                ? extra({ selectedRows: selected, data: paginatedData })
                                : extra}
                        </Box>
                    )}
                </Box>

                {/* Right Section - Search, Filters, Download, Button & Extra */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.5,
                    flex: { xs: '0 1 auto', md: 1 },
                    minWidth: 0,
                    order: { xs: 1, md: 2 },
                    justifyContent: 'flex-end'
                }}>
                    {/* Search and Action Buttons Group */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexShrink: 0,
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: 'flex-end'
                    }}>
                        {/* Search */}
                        <Tooltip title="Search data's" arrow>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder={`Search among ${processedData?.length} records...`}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: <Search fontSize="small" />,
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <Tooltip title="Clear search" arrow>
                                                    <IconButton
                                                        aria-label="clear search"
                                                        onClick={() => setSearchTerm('')}
                                                        onMouseDown={(e) => e.preventDefault()} edge="end"
                                                        size="small"
                                                    >
                                                        <Close />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 1,
                                            width: { xs: '100%', md: 220 },
                                            height: 36,
                                            '& input': {
                                                py: 0.75,
                                                fontSize: '0.8125rem'
                                            },
                                        },
                                    },
                                }}
                            />
                        </Tooltip>

                        {/* Action Buttons */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            flexShrink: 0
                        }}>
                            {/* Column Visibility Button */}
                            <Tooltip title="Column visibility" arrow>
                                <Badge
                                    badgeContent={hiddenColumns.length}
                                    color="primary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '0.6rem',
                                            height: 16,
                                            minWidth: 16,
                                            borderRadius: 8,
                                        }
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={handleColumnVisibilityClick}
                                        sx={{
                                            px: 1,
                                            borderRadius: 1,
                                            backgroundColor: `${theme.palette.primary.main}10`,
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        <ViewColumn fontSize="small" />
                                    </IconButton>
                                </Badge>
                            </Tooltip>

                            {/* Fixed Columns Toggle */}
                            {(leftFixedColumns.length > 0 || rightFixedColumns.length > 0) && (
                                <Tooltip title={isPinningEnabled ? "Disable fixed columns" : "Enable fixed columns"} arrow>
                                    <IconButton
                                        size="small"
                                        onClick={togglePinning}
                                        sx={{
                                            px: 1,
                                            borderRadius: 1,
                                            backgroundColor: isPinningEnabled
                                                ? `${theme.palette.primary.main}20`
                                                : `${theme.palette.primary.main}10`,
                                            color: isPinningEnabled
                                                ? theme.palette.primary.main
                                                : theme.palette.primary.main,
                                        }}
                                    >
                                        {isPinningEnabled ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            )}

                            {/* Filter Button */}
                            <Tooltip title="Filter data" arrow>
                                <Badge
                                    badgeContent={Object.keys(filterConfig).filter(key =>
                                        filterConfig[key]?.value !== undefined &&
                                        (!Array.isArray(filterConfig[key]?.value) || filterConfig[key]?.value.length > 0)
                                    ).length}
                                    color="primary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '0.6rem',
                                            height: 16,
                                            minWidth: 16,
                                            borderRadius: 8,
                                        }
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={handleFilterClick}
                                        sx={{
                                            px: 1,
                                            borderRadius: 1,
                                            backgroundColor: `${theme.palette.primary.main}10`,
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        <FilterListAlt fontSize="small" />
                                    </IconButton>
                                </Badge>
                            </Tooltip>

                            {/* Download Button */}
                            {(download.enabled && data.length > 0) && (
                                <DataExporter
                                    columns={filteredColumns}
                                    data={data}
                                    fileName={download?.filename}
                                    excludeColumns={download.excludeColumns}
                                />
                            )}

                            {/* Main Button */}
                            {actions && (
                                <Box sx={{ flexShrink: 0 }}>
                                    {typeof actions === 'function'
                                        ? actions({ selectedRows: selected, data: paginatedData })
                                        : actions}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Filter Popover */}
            <Popover
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <FilterPopover
                    columns={filteredColumns}
                    handleFilterChange={handleFilterChange}
                    clearAllFilters={clearAllFilters}
                    filterConfig={filterConfig}
                    uniqueValues={uniqueValues}
                    excludeColumns={filterExcludeColumns}
                />
            </Popover>

            {/* Column Visibility Popover */}
            <Popover
                open={columnVisibilityOpen}
                anchorEl={columnVisibilityAnchorEl}
                onClose={handleColumnVisibilityClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        borderRadius: 1,
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 4px 20px rgba(0,0,0,0.4)'
                            : '0 4px 20px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <ColumnVisibilityPopover
                    columns={columns}
                    hiddenColumns={hiddenColumns}
                    getAllSelectableColumnKeys={getAllSelectableColumnKeys}
                    onToggleColumn={toggleColumn}
                    onShowAll={showAllColumns}
                    onHideAll={hideAllColumns}
                />
            </Popover>

            {/* Table Container */}
            <TableContainer sx={{ maxHeight: 560, position: 'relative', overflow: 'auto' }}>
                {loading && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                        zIndex: 1
                    }}>
                        <CircularProgress />
                    </Box>
                )}

                <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <TableRow>
                            {/* Selectable checkbox - sticky if selectable AND pinning enabled */}
                            {selectable && (
                                <StyledTableCell
                                    padding="checkbox"
                                    sx={{
                                        position: isPinningEnabled ? 'sticky' : 'relative',
                                        left: 0,
                                        background: isPinningEnabled
                                            ? theme.palette.primary.main
                                            : undefined,
                                        zIndex: isPinningEnabled ? 99 : 'auto',
                                        boxShadow: isPinningEnabled && leftFixedColumns.length === 0
                                            ? (theme) => theme.palette.mode === 'dark'
                                                ? '2px 0 6px rgba(0,0,0,0.5)'
                                                : '2px 0 6px rgba(0,0,0,0.12)'
                                            : 'none',
                                        width: '48px',
                                        minWidth: '48px',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                        <Checkbox
                                            size="small"
                                            indeterminate={isSomeRowsSelected()}
                                            checked={isAllRowsSelected()}
                                            onChange={handleSelectAll}
                                            title={isAllRowsSelected() ? "Unselect all" : "Select all"}
                                            sx={{
                                                padding: 0.25,
                                                '& .MuiSvgIcon-root': { fontSize: 12 }
                                            }}
                                        />
                                        {paginatedData.length > 0 && (
                                            <Tooltip title={
                                                paginatedData.every(isRowSelected)
                                                    ? "Unselect all on this page"
                                                    : "Select all on this page"
                                            } arrow>
                                                <Checkbox
                                                    size="small"
                                                    checked={paginatedData.every(isRowSelected)}
                                                    indeterminate={
                                                        paginatedData.some(isRowSelected) &&
                                                        !paginatedData.every(isRowSelected)
                                                    }
                                                    onChange={handleSelectAllOnCurrentPage}
                                                    sx={{
                                                        padding: 0.25,
                                                        '& .MuiSvgIcon-root': { fontSize: 16 }
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </StyledTableCell>
                            )}

                            {/* LEFT FIXED COLUMNS */}
                            {leftFixedColumns?.map((col, index) => {
                                const leftPosition = getLeftPosition(index);

                                return (
                                    <StyledTableCell
                                        key={`left-${col?.key}`}
                                        title={col?.label}
                                        sx={{
                                            position: isPinningEnabled ? 'sticky' : 'relative',
                                            left: isPinningEnabled ? leftPosition : 'auto',
                                            background: isPinningEnabled
                                                ? theme.palette.primary.main
                                                : undefined,
                                            zIndex: isPinningEnabled ? 99 : 'auto',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            boxShadow: isPinningEnabled && index === leftFixedColumns.length - 1
                                                ? (theme) => theme.palette.mode === 'dark'
                                                    ? '2px 0 6px rgba(0,0,0,0.5)'
                                                    : '2px 0 6px rgba(0,0,0,0.12)'
                                                : 'none',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <TableSortLabel
                                                active={sortConfig.key === col?.key}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort(col?.key)}
                                                sx={{
                                                    color: theme =>
                                                        sortConfig.key === col?.key
                                                            ? theme.palette.warning.light
                                                            : theme.palette.common.white,
                                                    fontWeight: sortConfig.key === col?.key ? 800 : 600,
                                                    textShadow: theme =>
                                                        sortConfig.key === col?.key
                                                            ? `0 0 8px ${theme.palette.warning.light}80`
                                                            : '0 1px 1px rgba(0, 0, 0, 0.1)',
                                                    '&:hover': {
                                                        color: theme => theme.palette.warning.light,
                                                        textShadow: theme => `0 0 12px ${theme.palette.warning.light}`,
                                                    },
                                                    '&.Mui-active': {
                                                        color: theme => theme.palette.warning.light,
                                                    },
                                                    '& .MuiTableSortLabel-icon': {
                                                        color: 'inherit !important',
                                                        fontSize: '1.1rem',
                                                        filter: theme =>
                                                            sortConfig.key === col?.key
                                                                ? `drop-shadow(0 0 4px ${theme.palette.warning.light})`
                                                                : 'none',
                                                    },
                                                }}
                                            >
                                                {col?.label}
                                            </TableSortLabel>
                                            {/* {isPinningEnabled && (
                                                <Tooltip title="Left fixed column" arrow>
                                                    <ChevronLeft fontSize="small" sx={{
                                                        fontSize: '0.875rem',
                                                        color: theme.palette.success.main,
                                                        ml: 0.5
                                                    }} />
                                                </Tooltip>
                                            )} */}
                                        </Box>
                                    </StyledTableCell>
                                );
                            })}

                            {/* SCROLLABLE COLUMNS */}
                            {scrollableColumns?.map((col) => (
                                <StyledTableCell
                                    key={col?.key}
                                    title={col?.label}
                                    sx={{
                                        position: 'relative',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <TableSortLabel
                                            active={sortConfig.key === col?.key}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort(col?.key)}
                                            sx={{
                                                color: theme =>
                                                    sortConfig.key === col?.key
                                                        ? theme.palette.warning.light
                                                        : theme.palette.common.white,
                                                fontWeight: sortConfig.key === col?.key ? 800 : 600,
                                                textShadow: theme =>
                                                    sortConfig.key === col?.key
                                                        ? `0 0 8px ${theme.palette.warning.light}80`
                                                        : '0 1px 1px rgba(0, 0, 0, 0.1)',
                                                '&:hover': {
                                                    color: theme => theme.palette.warning.light,
                                                    textShadow: theme => `0 0 12px ${theme.palette.warning.light}`,
                                                },
                                                '&.Mui-active': {
                                                    color: theme => theme.palette.warning.light,
                                                },
                                                '& .MuiTableSortLabel-icon': {
                                                    color: 'inherit !important',
                                                    fontSize: '1.1rem',
                                                    filter: theme =>
                                                        sortConfig.key === col?.key
                                                            ? `drop-shadow(0 0 4px ${theme.palette.warning.light})`
                                                            : 'none',
                                                },
                                            }}
                                        >
                                            {col?.label}
                                        </TableSortLabel>
                                    </Box>
                                </StyledTableCell>
                            ))}

                            {/* RIGHT FIXED COLUMNS */}
                            {rightFixedColumns?.map((col, index) => {
                                const rightPosition = getRightPosition(index);

                                return (
                                    <StyledTableCell
                                        key={`right-${col?.key}`}
                                        title={col?.label}
                                        sx={{
                                            position: isPinningEnabled ? 'sticky' : 'relative',
                                            right: isPinningEnabled ? rightPosition : 'auto',
                                            background: isPinningEnabled
                                                ? theme.palette.primary.main
                                                : undefined,
                                            zIndex: isPinningEnabled ? 99 : 'auto',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            boxShadow: isPinningEnabled && index === 0
                                                ? (theme) => theme.palette.mode === 'dark'
                                                    ? '-2px 0 6px rgba(0,0,0,0.5)'
                                                    : '-2px 0 6px rgba(0,0,0,0.12)'
                                                : 'none',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <TableSortLabel
                                                active={sortConfig.key === col?.key}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort(col?.key)}
                                                sx={{
                                                    color: theme =>
                                                        sortConfig.key === col?.key
                                                            ? theme.palette.warning.light
                                                            : theme.palette.common.white,
                                                    fontWeight: sortConfig.key === col?.key ? 800 : 600,
                                                    textShadow: theme =>
                                                        sortConfig.key === col?.key
                                                            ? `0 0 8px ${theme.palette.warning.light}80`
                                                            : '0 1px 1px rgba(0, 0, 0, 0.1)',
                                                    '&:hover': {
                                                        color: theme => theme.palette.warning.light,
                                                        textShadow: theme => `0 0 12px ${theme.palette.warning.light}`,
                                                    },
                                                    '&.Mui-active': {
                                                        color: theme => theme.palette.warning.light,
                                                    },
                                                    '& .MuiTableSortLabel-icon': {
                                                        color: 'inherit !important',
                                                        fontSize: '1.1rem',
                                                        filter: theme =>
                                                            sortConfig.key === col?.key
                                                                ? `drop-shadow(0 0 4px ${theme.palette.warning.light})`
                                                                : 'none',
                                                    },
                                                }}
                                            >
                                                {col?.label}
                                            </TableSortLabel>
                                            {/* {isPinningEnabled && (
                                                <Tooltip title="Right fixed column" arrow>
                                                    <ChevronRight fontSize="small" sx={{
                                                        fontSize: '0.875rem',
                                                        color: theme.palette.success.main,
                                                        ml: 0.5
                                                    }} />
                                                </Tooltip>
                                            )} */}
                                        </Box>
                                    </StyledTableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ textOverflow: 'ellipsis' }}>
                        {loading && (
                            Array.from({ length: rowsPerPage }).map((_, index) => (
                                <TableRow key={index}>
                                    {filteredColumns?.map((_, i) => (
                                        <StyledTableCell key={i}>
                                            <Skeleton variant="text" />
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                        {!loading && paginatedData?.length === 0 ? (
                            <TableRow>
                                <StyledTableCell
                                    colSpan={filteredColumns.length + (selectable ? 1 : 0)}
                                    align="center"
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No data found
                                    </Typography>
                                </StyledTableCell>
                            </TableRow>
                        ) : (
                            paginatedData?.map((row, index) => {
                                const serialNumber = (page - 1) * rowsPerPage + index;
                                const isItemSelected = isRowSelected(row);

                                return (
                                    <TableRow
                                        key={serialNumber}
                                        hover
                                        selected={isItemSelected}
                                        onClick={(event) => selectable && handleSelectRow(event, row)}
                                        sx={{ cursor: selectable ? 'pointer' : 'default' }}
                                    >
                                        {/* Selectable checkbox cell */}
                                        {selectable && (
                                            <StyledTableCell
                                                padding="checkbox"
                                                sx={{
                                                    position: isPinningEnabled ? 'sticky' : 'relative',
                                                    left: 0,
                                                    background: isPinningEnabled
                                                        ? theme.palette.background.paper
                                                        : undefined,
                                                    zIndex: isPinningEnabled ? 99 : 'auto',
                                                    boxShadow: isPinningEnabled && leftFixedColumns.length === 0
                                                        ? (theme) => theme.palette.mode === 'dark'
                                                            ? '2px 0 6px rgba(0,0,0,0.5)'
                                                            : '2px 0 6px rgba(0,0,0,0.12)'
                                                        : 'none',
                                                    width: '48px',
                                                    minWidth: '48px',
                                                    ...(isPinningEnabled && {
                                                        '&.MuiTableCell-body': {
                                                            backgroundColor: theme.palette.background.paper,
                                                        },
                                                        'tr:hover &.MuiTableCell-body': {
                                                            backgroundColor: theme.palette.background.paper,
                                                        },
                                                        'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                            backgroundColor: theme.palette.background.paper,
                                                        },
                                                    }),
                                                }}
                                            >
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    onChange={(event) => handleSelectRow(event, row)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </StyledTableCell>
                                        )}

                                        {/* LEFT FIXED COLUMNS DATA */}
                                        {leftFixedColumns?.map((col, colIndex) => {
                                            const leftPosition = getLeftPosition(colIndex);

                                            return (
                                                <StyledTableCell
                                                    key={`left-${col.key}-${colIndex}`}
                                                    sx={{
                                                        position: isPinningEnabled ? 'sticky' : 'relative',
                                                        left: isPinningEnabled ? leftPosition : 'auto',
                                                        background: isPinningEnabled
                                                            ? theme.palette.background.paper
                                                            : undefined,
                                                        zIndex: isPinningEnabled ? 99 : 'auto',
                                                        boxShadow: isPinningEnabled && colIndex === leftFixedColumns.length - 1
                                                            ? (theme) => theme.palette.mode === 'dark'
                                                                ? '2px 0 6px rgba(0,0,0,0.5)'
                                                                : '2px 0 6px rgba(0,0,0,0.12)'
                                                            : 'none',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        ...(isPinningEnabled && {
                                                            '&.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                            'tr:hover &.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                            'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                        }),
                                                    }}
                                                    title={col?.render ? (() => { const r = col.render(row, serialNumber); return typeof r === 'string' ? r : r?.props?.label || r?.props?.title || (typeof r?.props?.children === 'string' ? r.props.children : '') || row[col?.key] || ''; })() : (row[col?.key] || '—')}
                                                >
                                                    {col?.render ? col.render(row, serialNumber) : (row[col?.key] || '—')}
                                                </StyledTableCell>
                                            );
                                        })}

                                        {/* SCROLLABLE COLUMNS DATA */}
                                        {scrollableColumns?.map((col, colIndex) => (
                                            <StyledTableCell
                                                key={`scroll-${col.key}-${colIndex}`}
                                                sx={{
                                                    position: 'relative',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                title={col?.render ? (() => { const r = col.render(row, serialNumber); return typeof r === 'string' ? r : r?.props?.label || r?.props?.title || (typeof r?.props?.children === 'string' ? r.props.children : '') || row[col?.key] || ''; })() : (row[col?.key] || '—')}
                                            >
                                                {col?.render ? col.render(row, serialNumber) : (row[col?.key] || '—')}
                                            </StyledTableCell>
                                        ))}

                                        {/* RIGHT FIXED COLUMNS DATA */}
                                        {rightFixedColumns?.map((col, colIndex) => {
                                            const rightPosition = getRightPosition(colIndex);

                                            return (
                                                <StyledTableCell
                                                    key={`right-${col.key}-${colIndex}`}
                                                    sx={{
                                                        position: isPinningEnabled ? 'sticky' : 'relative',
                                                        right: isPinningEnabled ? rightPosition : 'auto',
                                                        background: isPinningEnabled
                                                            ? theme.palette.background.paper
                                                            : undefined,
                                                        zIndex: isPinningEnabled ? 99 : 'auto',
                                                        boxShadow: isPinningEnabled && colIndex === 0
                                                            ? (theme) => theme.palette.mode === 'dark'
                                                                ? '-2px 0 6px rgba(0,0,0,0.5)'
                                                                : '-2px 0 6px rgba(0,0,0,0.12)'
                                                            : 'none',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        ...(isPinningEnabled && {
                                                            '&.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                            'tr:hover &.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                            'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                                backgroundColor: theme.palette.background.paper,
                                                            },
                                                        }),
                                                    }}
                                                    title={col?.render ? (() => { const r = col.render(row, serialNumber); return typeof r === 'string' ? r : r?.props?.label || r?.props?.title || (typeof r?.props?.children === 'string' ? r.props.children : '') || row[col?.key] || ''; })() : (row[col?.key] || '—')}
                                                >
                                                    {col?.render ? col.render(row, serialNumber) : (row[col?.key] || '—')}
                                                </StyledTableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>

                    {/* FOOTER SECTION - NEW with pinning support */}
                    {(hasColumnFooters || footer) && (
                        <TableFooter
                            sx={{
                                position: footerProps.sticky ? 'sticky' : 'relative',
                                bottom: 0,
                                backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                zIndex: isPinningEnabled ? 10 : 'auto',
                                borderTop: `2px solid ${theme.palette.divider}`,
                            }}
                        >
                            <TableRow>
                                {/* Selectable checkbox footer cell - sticky */}
                                {selectable && (
                                    <StyledTableCell
                                        padding="checkbox"
                                        sx={{
                                            position: isPinningEnabled ? 'sticky' : 'relative',
                                            left: 0,
                                            background: isPinningEnabled
                                                ? (footerProps.backgroundColor || theme.palette.background.paper)
                                                : undefined,
                                            zIndex: isPinningEnabled ? 99 : 'auto',
                                            boxShadow: isPinningEnabled && leftFixedColumns.length === 0
                                                ? (theme) => theme.palette.mode === 'dark'
                                                    ? '2px 0 6px rgba(0,0,0,0.5)'
                                                    : '2px 0 6px rgba(0,0,0,0.12)'
                                                : 'none',
                                            width: '48px',
                                            minWidth: '48px',
                                            fontWeight: 'bold',
                                            ...(isPinningEnabled && {
                                                '&.MuiTableCell-body': {
                                                    backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                },
                                                'tr:hover &.MuiTableCell-body': {
                                                    backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                },
                                                'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                    backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                },
                                            }),
                                        }}
                                        title=''
                                    >
                                        {/* Optional: Show total count or leave empty */}
                                        {paginatedData?.length > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                {paginatedData.length}
                                            </Typography>
                                        )}
                                    </StyledTableCell>
                                )}

                                {/* LEFT FIXED COLUMNS FOOTER */}
                                {leftFixedColumns?.map((col, index) => {
                                    const leftPosition = getLeftPosition(index);
                                    const footerContent = renderFooterCell(col, index, 'left');

                                    return (
                                        <StyledTableCell
                                            key={`footer-left-${col.key}`}
                                            sx={{
                                                position: isPinningEnabled ? 'sticky' : 'relative',
                                                left: isPinningEnabled ? leftPosition : 'auto',
                                                background: isPinningEnabled
                                                    ? (footerProps.backgroundColor || theme.palette.background.paper)
                                                    : undefined,
                                                zIndex: isPinningEnabled ? 99 : 'auto',
                                                boxShadow: isPinningEnabled && index === leftFixedColumns.length - 1
                                                    ? (theme) => theme.palette.mode === 'dark'
                                                        ? '2px 0 6px rgba(0,0,0,0.5)'
                                                        : '2px 0 6px rgba(0,0,0,0.12)'
                                                    : 'none',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontWeight: 'bold',
                                                ...(isPinningEnabled && {
                                                    '&.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                    'tr:hover &.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                    'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                }),
                                            }}
                                            title={col?.footer}
                                        >
                                            {footerContent || col.footer}
                                        </StyledTableCell>
                                    );
                                })}

                                {/* SCROLLABLE COLUMNS FOOTER */}
                                {scrollableColumns?.map((col, index) => {
                                    const footerContent = renderFooterCell(col, index, 'scrollable');

                                    return (
                                        <StyledTableCell
                                            key={`footer-scroll-${col.key}`}
                                            sx={{
                                                position: 'relative',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontWeight: 'bold',
                                            }}
                                            title={col?.footer}
                                        >
                                            {footerContent || col.footer}
                                        </StyledTableCell>
                                    );
                                })}

                                {/* RIGHT FIXED COLUMNS FOOTER */}
                                {rightFixedColumns?.map((col, index) => {
                                    const rightPosition = getRightPosition(index);
                                    const footerContent = renderFooterCell(col, index, 'right');

                                    return (
                                        <StyledTableCell
                                            key={`footer-right-${col.key}`}
                                            sx={{
                                                position: isPinningEnabled ? 'sticky' : 'relative',
                                                right: isPinningEnabled ? rightPosition : 'auto',
                                                background: isPinningEnabled
                                                    ? (footerProps.backgroundColor || theme.palette.background.paper)
                                                    : undefined,
                                                zIndex: isPinningEnabled ? 99 : 'auto',
                                                boxShadow: isPinningEnabled && index === 0
                                                    ? (theme) => theme.palette.mode === 'dark'
                                                        ? '-2px 0 6px rgba(0,0,0,0.5)'
                                                        : '-2px 0 6px rgba(0,0,0,0.12)'
                                                    : 'none',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontWeight: 'bold',
                                                ...(isPinningEnabled && {
                                                    '&.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                    'tr:hover &.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                    'tr:nth-of-type(even) &.MuiTableCell-body': {
                                                        backgroundColor: footerProps.backgroundColor || theme.palette.background.paper,
                                                    },
                                                }),
                                            }}
                                            title={col?.footer}
                                        >
                                            {footerContent || col.footer}
                                        </StyledTableCell>
                                    );
                                })}
                            </TableRow>

                            {/* Custom footer node (rendered directly inside the TableFooter) */}
                            {footer && !hasColumnFooters && footer}
                        </TableFooter>
                    )}
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
                flexWrap: 'wrap',
                gap: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Rows per page:</Typography>
                    <Autocomplete
                        size="small"
                        options={rowsPerPageOptions}
                        getOptionLabel={(option) => option.toString()}
                        value={rowsPerPage}
                        onChange={(event, newValue) => {
                            const numValue = parseInt(newValue || 0, 10);
                            if (!isNaN(numValue)) {
                                setRowsPerPage(Math.max(1, numValue));
                                setPage(1);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                sx={{ width: 80 }}
                                inputProps={{
                                    ...params.inputProps,
                                    type: 'number',
                                    min: 1,
                                    onKeyDown: (e) => {
                                        if (e.key === '-' || e.key === '.' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    },
                                }}
                            />
                        )}
                        disableClearable
                        freeSolo
                        inputValue={rowsPerPage.toString()}
                        onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                                setRowsPerPage(0);
                                setPage(1);
                                return;
                            }

                            const numValue = parseInt(newInputValue, 10);
                            if (!isNaN(numValue)) {
                                setRowsPerPage(Math.max(1, numValue));
                                setPage(1);
                            }
                        }}
                    />

                    {/* Hidden columns indicator */}
                    {hiddenColumns.length > 0 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                        >
                            ({hiddenColumns.length} column{hiddenColumns.length > 1 ? 's' : ''} hidden)
                        </Typography>
                    )}

                    {/* Fixed columns indicators */}
                    {isPinningEnabled && (leftFixedColumns.length > 0 || rightFixedColumns.length > 0) && (
                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {leftFixedColumns.length > 0 && (
                                <Typography
                                    variant="caption"
                                    color="success.main"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                    <ChevronLeft fontSize="small" sx={{ fontSize: '0.75rem' }} />
                                    {leftFixedColumns.length} left
                                </Typography>
                            )}
                            {rightFixedColumns.length > 0 && (
                                <Typography
                                    variant="caption"
                                    color="success.main"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                    <ChevronRight fontSize="small" sx={{ fontSize: '0.75rem' }} />
                                    {rightFixedColumns.length} right
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    Showing {paginatedData?.length} of {processedData?.length} records
                    {selected.length > 0 && ` (${selected.length} selected)`}
                    {hiddenColumns.length > 0 && ` (${hiddenColumns.length} hidden)`}
                </Typography>

                <Pagination
                    count={Math.ceil(processedData?.length / rowsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    shape="rounded"
                    size="small"
                />
            </Box>
        </Box>
    );
};

export default React.memo(DataTable);