import { alpha } from '@mui/material/styles';

export const surfacesCustomizations = {
    MuiAccordion: {
        defaultProps: {
            elevation: 0,
            disableGutters: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                padding: 0,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: theme.shape.borderRadius,
                marginBottom: 8,
                transition: 'border-color 0.2s ease',
                ':before': {
                    backgroundColor: 'transparent',
                },
                '&:not(:last-of-type)': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                },
                '&.Mui-expanded': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    boxShadow: theme.shadows[2],
                },
            }),
        },
    },
    MuiAccordionSummary: {
        styleOverrides: {
            root: ({ theme }) => ({
                border: 'none',
                borderRadius: theme.shape.borderRadius,
                padding: '8px 12px',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&:focus-visible': {
                    backgroundColor: 'transparent',
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                },
            }),
        },
    },
    MuiAccordionDetails: {
        styleOverrides: {
            root: {
                mb: 16,
                border: 'none',
                padding: '8px 12px',
            },
        },
    },
    MuiPaper: {
        defaultProps: {
            elevation: 0,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                borderRadius: theme.shape.borderRadius,
                variants: [
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            border: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.background.paper,
                        },
                    },
                    {
                        props: {
                            elevation: 1,
                        },
                        style: {
                            boxShadow: theme.shadows[1],
                        },
                    },
                    {
                        props: {
                            elevation: 2,
                        },
                        style: {
                            boxShadow: theme.shadows[2],
                        },
                    },
                    {
                        props: {
                            elevation: 3,
                        },
                        style: {
                            boxShadow: theme.shadows[3],
                        },
                    },
                ],
            }),
        },
    },
    MuiCard: {
        styleOverrides: {
            root: ({ theme }) => ({
                marginBottom: 8,
                transition: 'box-shadow 200ms ease, border-color 200ms ease',
                backgroundColor: (theme.vars || theme).palette.background.paper,
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${(theme.vars || theme).palette.divider}`,
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: theme.shadows[2],
                },
                variants: [
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            border: `1px solid ${(theme.vars || theme).palette.divider}`,
                            boxShadow: 'none',
                            background: (theme.vars || theme).palette.background.paper,
                            ...theme.applyStyles('dark', {
                                background: (theme.vars || theme).palette.background.paper,
                            }),
                        },
                    },
                ],
            }),
        },
    },
    MuiCardContent: {
        styleOverrides: {
            root: {
                padding: '16px',
                '&:last-child': {
                    paddingBottom: '16px',
                },
            },
        },
    },
    MuiCardHeader: {
        styleOverrides: {
            root: {
                padding: '16px 16px 0',
            },
        },
    },
    MuiCardActions: {
        styleOverrides: {
            root: {
                padding: '8px 16px 16px',
            },
        },
    },
};
