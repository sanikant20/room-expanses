import { TableCell, TableRow, styled, alpha } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(0.5, 0.8),
    fontSize: '0.75rem',
    lineHeight: 1.2,
    height: '32px',

    border: `1px solid ${theme.palette.divider}`,
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",

    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        fontWeight: 700,
        color: theme.palette.common.white,
        padding: theme.spacing(0.6, 0.8),
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        height: '36px',
        textShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
        ...theme.applyStyles('dark', {
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }),
    },

    '&.MuiTableCell-body': {
        color: theme.palette.grey[800],
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[100],
        }),
        fontWeight: 500,
        backgroundColor: theme.palette.background.paper,

        '& .MuiIconButton-root': {
            padding: '6px',
            width: '24px',
            height: '26px',
            '& svg': {
                fontSize: '16px',
                width: '0.9em',
                height: '0.9em',
            },
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'scale(0.95)',
            },
        },

        '& .MuiButton-root': {
            minWidth: 'auto',
            padding: '4px 8px',
            fontSize: '0.75rem',
            height: '24px',
            '& .MuiButton-startIcon': {
                marginRight: '4px',
                '& svg': { fontSize: '14px' },
            },
            '& .MuiButton-endIcon': {
                marginLeft: '4px',
                '& svg': { fontSize: '14px' },
            },
        },
    },

    '&:first-of-type': {
        paddingLeft: theme.spacing(1),
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px 0 0 4px',
    },
    '&:last-of-type': {
        paddingRight: theme.spacing(1),
        borderRight: `1px solid ${theme.palette.divider}`,
        borderRadius: '0 4px 4px 0',
    },

    'tr:hover &:not(.MuiTableCell-head)': {
        backgroundColor: theme.palette.background.default + '20',
        color: theme.palette.primary.dark,
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[100],
        }),
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 4px ${theme.palette.primary.light}20`,

        '& .MuiIconButton-root': {
            backgroundColor: theme.palette.primary.light + '20',
        },
    },

    'tr:nth-of-type(even) &:not(.MuiTableCell-head)': {
        backgroundColor: theme.palette.grey[100],
        ...theme.applyStyles('dark', {
            backgroundColor: alpha(theme.palette.grey[800], 0.3),
        }),
    },

    'tr.Mui-selected &:not(.MuiTableCell-head)': {
        backgroundColor: theme.palette.primary.light + '15',
        borderLeft: `2px solid ${theme.palette.primary.main}`,

        '& .MuiIconButton-root': {
            backgroundColor: theme.palette.primary.main + '20',
        },
        ...theme.applyStyles('dark', {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
        }),
    },

    '&:focus-within': {
        outline: `2px solid ${theme.palette.primary.main}40`,
        outlineOffset: '-2px',
    },

    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0.4, 0.6),
        fontSize: '0.7rem',
        height: '28px',

        '&.MuiTableCell-head': {
            fontSize: '0.65rem',
            padding: theme.spacing(0.5, 0.6),
            height: '32px',
        },

        '& .MuiIconButton-root': {
            padding: '3px',
            width: '22px',
            height: '22px',
            '& svg': { fontSize: '14px' },
        },

        '& .MuiButton-root': {
            padding: '3px 6px',
            fontSize: '0.7rem',
            height: '22px',
        },
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
        '& td': { fontWeight: '500' },
    },
    '&:last-child td, &:last-child th': { border: 0 },
}));
