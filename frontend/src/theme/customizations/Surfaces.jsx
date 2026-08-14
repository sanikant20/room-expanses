import { alpha } from '@mui/material/styles';
import { gray } from '../themePrimitives';

const getNeumorphShadow = (mode) =>
    mode === 'dark'
        ? '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(60, 60, 80, 0.15)'
        : '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)';

const getNeumorphShadowLg = (mode) =>
    mode === 'dark'
        ? '8px 8px 16px rgba(0, 0, 0, 0.45), -8px -8px 16px rgba(60, 60, 80, 0.12)'
        : '8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.7)';

export const surfacesCustomizations = {
    MuiAccordion: {
        defaultProps: {
            elevation: 0,
            disableGutters: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                padding: 4,
                overflow: 'clip',
                backgroundColor: alpha(theme.palette.primary.light, 0.03),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.08),
                boxShadow: getNeumorphShadow(theme.palette.mode),
                borderRadius: theme.shape.borderRadius,
                marginBottom: 8,
                transition: 'all 0.3s ease',
                ':before': {
                    backgroundColor: 'transparent',
                },
                '&:not(:last-of-type)': {
                    borderBottom: 'none',
                },
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: getNeumorphShadowLg(theme.palette.mode),
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
                transition: 'all 0.2s ease',
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
                transition: 'all 0.3s ease',
                borderRadius: theme.shape.borderRadius,
                variants: [
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                            background: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(8px)',
                        },
                    },
                    {
                        props: {
                            elevation: 1,
                        },
                        style: {
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                        },
                    },
                    {
                        props: {
                            elevation: 2,
                        },
                        style: {
                            boxShadow: getNeumorphShadowLg(theme.palette.mode),
                        },
                    },
                ],
            }),
        },
    },
    MuiCard: {
        styleOverrides: {
            root: ({ theme }) => ({
                padding: 1,
                marginBottom: 8,
                // gap: 16,
                transition: 'all 100ms ease',
                backgroundColor: gray[50],
                borderRadius: (theme.vars || theme).shape.borderRadius,
                border: `1px solid ${(theme.vars || theme).palette.divider}`,
                boxShadow: 'none',
                ...theme.applyStyles('dark', {
                    backgroundColor: gray[800],
                }),
                variants: [
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            border: `1px solid ${(theme.vars || theme).palette.divider}`,
                            boxShadow: 'none',
                            background: 'hsl(0, 0%, 100%)',
                            ...theme.applyStyles('dark', {
                                background: alpha(gray[900], 0.4),
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