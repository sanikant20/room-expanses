import { alpha } from '@mui/material';

export const feedbackCustomizations = {
    MuiAlert: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                padding: '8px 16px',
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '& .MuiAlert-icon': {
                    color: theme.palette.primary.main,
                },
                variants: [
                    {
                        props: { severity: 'success' },
                        style: {
                            backgroundColor: alpha(theme.palette.success.main, 0.08),
                            borderColor: alpha(theme.palette.success.main, 0.2),
                            '& .MuiAlert-icon': {
                                color: theme.palette.success.main,
                            },
                        },
                    },
                    {
                        props: { severity: 'info' },
                        style: {
                            backgroundColor: alpha(theme.palette.info.main, 0.08),
                            borderColor: alpha(theme.palette.info.main, 0.2),
                            '& .MuiAlert-icon': {
                                color: theme.palette.info.main,
                            },
                        },
                    },
                    {
                        props: { severity: 'warning' },
                        style: {
                            backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            borderColor: alpha(theme.palette.warning.main, 0.2),
                            '& .MuiAlert-icon': {
                                color: theme.palette.warning.main,
                            },
                        },
                    },
                    {
                        props: { severity: 'error' },
                        style: {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                            '& .MuiAlert-icon': {
                                color: theme.palette.error.main,
                            },
                        },
                    },
                ],
                ...theme.applyStyles('dark', {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }),
            }),
        },
    },
    MuiDialog: {
        styleOverrides: {
            root: ({ theme }) => ({
                '& .MuiDialog-paper': {
                    borderRadius: theme.shape.borderRadius,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[5],
                    backgroundColor: theme.palette.background.paper,
                },
            }),
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: ({ theme }) => ({
                height: 6,
                borderRadius: 99,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                overflow: 'hidden',
                ...theme.applyStyles('dark', {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                }),
            }),
            bar: ({ theme }) => ({
                borderRadius: 99,
                background: theme.palette.primary.main,
            }),
        },
    },
    MuiSnackbar: {
        styleOverrides: {
            root: ({ theme }) => ({
                '& .MuiSnackbarContent-root': {
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[4],
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                },
            }),
        },
    },
    MuiSkeleton: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '&::after': {
                    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.04)}, transparent)`,
                },
            }),
        },
    },
};
