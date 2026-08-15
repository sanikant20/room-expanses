import { alpha } from '@mui/material/styles';
import { menuItemClasses } from '@mui/material/MenuItem';
import { gray } from '../ThemePrimitives';

const getNeumorphShadow = (mode) =>
    mode === 'dark'
        ? '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(60, 60, 80, 0.15)'
        : '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)';

const getNeumorphInset = (mode) =>
    mode === 'dark'
        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.35), inset -4px -4px 8px rgba(60, 60, 80, 0.12)'
        : 'inset 4px 4px 8px rgba(163, 177, 198, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.5)';

export const datePickersCustomizations = {
    MuiPickersPopper: {
        styleOverrides: {
            paper: ({ theme }) => ({
                marginTop: 4,
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                backgroundImage: 'none',
                background: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(8px)',
                boxShadow: getNeumorphShadow(theme.palette.mode),
                padding: '4px',
                [`& .${menuItemClasses.root}`]: {
                    borderRadius: theme.shape.borderRadius,
                    margin: '2px 4px',
                    padding: '6px 12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'translateX(2px)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        boxShadow: getNeumorphInset(theme.palette.mode),
                    },
                },
                ...theme.applyStyles('dark', {
                    background: alpha(gray[900], 0.98),
                    boxShadow: getNeumorphShadow(theme.palette.mode),
                }),
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
                    boxShadow: getNeumorphShadow(theme.palette.mode),
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
                        boxShadow: getNeumorphShadow(theme.palette.mode),
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
                    boxShadow: getNeumorphShadow(theme.palette.mode),
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
                        boxShadow: getNeumorphShadow(theme.palette.mode),
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
                    boxShadow: getNeumorphShadow(theme.palette.mode),
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
                        boxShadow: getNeumorphShadow(theme.palette.mode),
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    },
                }),
            }),
        },
    },
};