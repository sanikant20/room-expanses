import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    Paper,
    useTheme,
    TextField,
    InputAdornment,
    alpha,
    Fade,
} from '@mui/material';
import {
    VisibilityOffRounded,
    ViewColumnRounded,
    DoneAllRounded,
    ClearAllRounded,
    VisibilityRounded,
    SearchRounded,
    DragHandleRounded,
} from '@mui/icons-material';

const ColumnVisibilityPopover = ({
    columns,
    hiddenColumns,
    getAllSelectableColumnKeys,
    onToggleColumn,
    onShowAll,
    onHideAll,
}) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');

    const totalSelectableColumns = getAllSelectableColumnKeys.length;
    const visibleCount = getAllSelectableColumnKeys.filter(key => !hiddenColumns.includes(key)).length;

    const isHidden = (key) => hiddenColumns.includes(key);

    const visibleColumns = useMemo(
        () => columns?.filter(col => col.hideable !== false).filter(col => {
            if (!search) return true;
            const label = (col.label || col.key || '').toLowerCase();
            return label.includes(search.toLowerCase());
        }),
        [columns, search]
    );

    return (
        <Fade in timeout={200}>
            <Paper
                elevation={0}
                sx={{
                    width: { xs: 'min(270px, calc(100vw - 48px))', sm: 270 },
                    maxHeight: 520,
                    overflow: 'hidden',
                    borderRadius: 2.5,
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.5 : 0.1)}`,
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Box sx={{
                    px: 2, py: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: 1.5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }}>
                                <ViewColumnRounded sx={{ fontSize: 16 }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} fontSize="0.85rem" lineHeight={1.2}>
                                    Columns
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                    {visibleCount}/{totalSelectableColumns} visible
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.25}>
                            <Tooltip title="Show all" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onShowAll}
                                    sx={{
                                        width: 28, height: 28, borderRadius: 1,
                                        color: theme.palette.success.main,
                                        transition: 'all 0.15s',
                                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) },
                                    }}
                                >
                                    <DoneAllRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Hide all" arrow>
                                <IconButton
                                    size="small"
                                    onClick={onHideAll}
                                    sx={{
                                        width: 28, height: 28, borderRadius: 1,
                                        color: theme.palette.error.main,
                                        transition: 'all 0.15s',
                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                                    }}
                                >
                                    <ClearAllRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search columns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        variant="outlined"
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRounded sx={{ fontSize: 15, color: alpha(theme.palette.text.secondary, 0.6) }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 1.5,
                                    fontSize: '0.78rem',
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    height: 34,
                                    '& input': { py: 0.5, fontSize: '0.78rem' },
                                    '& fieldset': { borderColor: alpha(theme.palette.divider, 0.6) },
                                    '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                },
                            }
                        }}
                    />
                </Box>

                <Box sx={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: alpha(theme.palette.divider, 0.6),
                        borderRadius: 4,
                        '&:hover': { bgcolor: alpha(theme.palette.divider, 0.8) },
                    },
                }}>
                    {visibleColumns.length > 0 ? (
                        <List
                            dense
                            disablePadding
                            sx={{
                                py: 0.5,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 0.5, sm: 0 },
                            }}
                        >
                            {visibleColumns.map((column) => {
                                const hidden = isHidden(column.key);

                                return (
                                    <ListItem
                                        key={column.key}
                                        disablePadding
                                        sx={{
                                            transition: 'background-color 0.15s',
                                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.6) },
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => onToggleColumn(column.key)}
                                            dense
                                            sx={{
                                                py: { xs: 1, sm: 0.875 },
                                                px: 2,
                                                minHeight: { xs: 44, sm: 38 },
                                                borderRadius: 0,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36, mr: 0.5 }}>
                                                <Box sx={{
                                                    width: 22, height: 22, borderRadius: '6px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: `2px solid ${hidden ? alpha(theme.palette.divider, 0.6) : theme.palette.primary.main}`,
                                                    bgcolor: hidden ? 'transparent' : theme.palette.primary.main,
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: hidden ? 'scale(1)' : 'scale(1)',
                                                }}>
                                                    {!hidden && (
                                                        <Box sx={{
                                                            width: 8, height: 8, borderRadius: '2px',
                                                            bgcolor: '#fff',
                                                            transform: 'rotate(45deg)',
                                                        }} />
                                                    )}
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={!hidden ? 600 : 400}
                                                        color={!hidden ? 'text.primary' : 'text.secondary'}
                                                        sx={{
                                                            fontSize: '0.8125rem',
                                                            textDecoration: hidden ? 'line-through' : 'none',
                                                            textDecorationColor: alpha(theme.palette.text.disabled, 0.4),
                                                            textDecorationThickness: 1,
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        {column.label || column.key}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                No columns match "{search}"
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{
                    px: 2, py: 1.25,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    bgcolor: alpha(theme.palette.background.default, 0.3),
                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{
                                height: 3, borderRadius: 2, overflow: 'hidden',
                                bgcolor: alpha(theme.palette.divider, 0.5),
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${totalSelectableColumns > 0 ? (visibleCount / totalSelectableColumns) * 100 : 0}%`,
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: 2,
                                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} fontSize="0.7rem" sx={{ whiteSpace: 'nowrap' }}>
                            {visibleCount}/{totalSelectableColumns}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Fade>
    );
};

export default ColumnVisibilityPopover;
