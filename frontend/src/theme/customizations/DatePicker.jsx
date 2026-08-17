import { alpha } from '@mui/material/styles';
import { menuItemClasses } from '@mui/material/MenuItem';

export const datePickersCustomizations = {
    MuiPickersPopper: {
        styleOverrides: {
            paper: ({ theme }) => ({
                marginTop: 4,
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${theme.palette.divider}`,
                backgroundImage: 'none',
                background: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                padding: '4px',
                [`& .${menuItemClasses.root}`]: {
                    borderRadius: theme.shape.borderRadius,
                    margin: '2px 4px',
                    padding: '6px 12px',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                },
            }),
        },
    },
    MuiPickersArrowSwitcher: {
        styleOverrides: {
            spacer: { width: 16 },
            button: ({ theme }) => ({
                backgroundColor: 'transparent',
                color: theme.palette.text.secondary,
                borderRadius: theme.shape.borderRadius,
                padding: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&:active': {
                    transform: 'scale(0.95)',
                },
                '&:focus-visible': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                },
                ...theme.applyStyles('dark', {
                    color: theme.palette.text.secondary,
                }),
            }),
        },
    },
    MuiPickersCalendarHeader: {
        styleOverrides: {
            switchViewButton: ({ theme }) => ({
                padding: '4px 8px',
                border: 'none',
                borderRadius: theme.shape.borderRadius,
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&:focus-visible': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                },
            }),
            iconButton: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                padding: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&:focus-visible': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                },
            }),
        },
    },
    MuiPickersMonth: {
        styleOverrides: {
            monthButton: ({ theme }) => ({
                fontSize: theme.typography.body1.fontSize,
                color: theme.palette.text.secondary,
                padding: theme.spacing(0.75),
                borderRadius: theme.shape.borderRadius,
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: theme.typography.fontWeightMedium,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                '&:focus': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                    },
                },
                ...theme.applyStyles('dark', {
                    color: theme.palette.text.secondary,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    },
                }),
            }),
        },
    },
    MuiPickersYear: {
        styleOverrides: {
            yearButton: ({ theme }) => ({
                fontSize: theme.typography.body1.fontSize,
                color: theme.palette.text.secondary,
                padding: theme.spacing(0.75),
                borderRadius: theme.shape.borderRadius,
                height: 'fit-content',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: theme.typography.fontWeightMedium,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                '&:focus': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                    },
                },
                ...theme.applyStyles('dark', {
                    color: theme.palette.text.secondary,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    },
                }),
            }),
        },
    },
    MuiPickersDay: {
        styleOverrides: {
            root: ({ theme }) => ({
                fontSize: theme.typography.body1.fontSize,
                color: theme.palette.text.secondary,
                padding: theme.spacing(0.5),
                borderRadius: theme.shape.borderRadius,
                width: 36,
                height: 36,
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: theme.typography.fontWeightMedium,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                '&.Mui-disabled': {
                    opacity: 0.4,
                    backgroundColor: 'transparent',
                },
                '&:focus': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    outlineOffset: '2px',
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                    },
                },
                ...theme.applyStyles('dark', {
                    color: theme.palette.text.secondary,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    },
                }),
            }),
        },
    },
};