import { alpha, svgIconClasses, typographyClasses, buttonBaseClasses, chipClasses, iconButtonClasses } from '@mui/material';
import { gray, brand } from '../ThemePrimitives';
import { defaultSuccessColor, defaultErrorColor, defaultWarningColor } from '../ThemeColors';

export const dataDisplayCustomizations = {
    MuiList: {
        styleOverrides: {
            root: {
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
            },
        },
    },
    MuiListItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                [`& .${svgIconClasses.root}`]: {
                    width: '1rem',
                    height: '1rem',
                    color: theme.palette.text.secondary,
                },
                [`& .${typographyClasses.root}`]: {
                    fontWeight: 500,
                },
                [`& .${buttonBaseClasses.root}`]: {
                    display: 'flex',
                    gap: 8,
                    padding: '2px 8px',
                    borderRadius: theme.shape.borderRadius,
                    opacity: 0.7,
                    '&.Mui-selected': {
                        opacity: 1,
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                        [`& .${svgIconClasses.root}`]: {
                            color: theme.palette.text.primary,
                        },
                        '&:focus-visible': {
                            backgroundColor: alpha(theme.palette.action.selected, 0.3),
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.action.selected, 0.5),
                        },
                    },
                    '&:focus-visible': {
                        backgroundColor: 'transparent',
                    },
                },
            }),
        },
    },
    MuiListItemText: {
        styleOverrides: {
            primary: ({ theme }) => ({
                fontSize: theme.typography.body2.fontSize,
                fontWeight: 500,
                lineHeight: theme.typography.body2.lineHeight,
            }),
            secondary: ({ theme }) => ({
                fontSize: theme.typography.caption.fontSize,
                lineHeight: theme.typography.caption.lineHeight,
            }),
        },
    },
    MuiListSubheader: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: 'transparent',
                padding: '4px 8px',
                fontSize: theme.typography.caption.fontSize,
                fontWeight: 500,
                lineHeight: theme.typography.caption.lineHeight,
            }),
        },
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                minWidth: 0,
            },
        },
    },
    MuiChip: {
        defaultProps: {
            size: 'small',
        },
        styleOverrides: {
            root: ({ theme }) => ({
                border: '1px solid',
                borderRadius: '999px',
                boxShadow: 'none',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                [`& .${chipClasses.label}`]: {
                    fontWeight: 500,
                },
                '&:hover': {
                    boxShadow: theme.shadows[1],
                },
                variants: [
                    {
                        props: { color: 'default' },
                        style: {
                            borderColor: alpha(gray[300], 0.5),
                            backgroundColor: alpha(gray[100], 0.3),
                            [`& .${chipClasses.label}`]: {
                                color: gray[600],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: gray[500],
                            },
                            ...theme.applyStyles('dark', {
                                color: gray[300],
                                borderColor: alpha(gray[700], 0.5),
                                backgroundColor: alpha(gray[800], 0.3),
                                [`& .${chipClasses.label}`]: {
                                    color: gray[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: gray[300],
                                },
                            }),
                        },
                    },
                    {
                        props: { color: 'success' },
                        style: {
                            borderColor: alpha(defaultSuccessColor[300], 0.5),
                            backgroundColor: alpha(defaultSuccessColor[50], 0.3),
                            [`& .${chipClasses.label}`]: {
                                color: defaultSuccessColor[600],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: defaultSuccessColor[500],
                            },
                            ...theme.applyStyles('dark', {
                                color: defaultSuccessColor[300],
                                borderColor: alpha(defaultSuccessColor[700], 0.5),
                                backgroundColor: alpha(defaultSuccessColor[900], 0.3),
                                [`& .${chipClasses.label}`]: {
                                    color: defaultSuccessColor[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: defaultSuccessColor[300],
                                },
                            }),
                        },
                    },
                    {
                        props: { color: 'error' },
                        style: {
                            borderColor: alpha(defaultErrorColor[300], 0.5),
                            backgroundColor: alpha(defaultErrorColor[50], 0.3),
                            [`& .${chipClasses.label}`]: {
                                color: defaultErrorColor[600],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: defaultErrorColor[500],
                            },
                            ...theme.applyStyles('dark', {
                                color: defaultErrorColor[300],
                                borderColor: alpha(defaultErrorColor[700], 0.5),
                                backgroundColor: alpha(defaultErrorColor[900], 0.3),
                                [`& .${chipClasses.label}`]: {
                                    color: defaultErrorColor[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: defaultErrorColor[300],
                                },
                            }),
                        },
                    },
                    {
                        props: { color: 'warning' },
                        style: {
                            borderColor: alpha(defaultWarningColor[300], 0.5),
                            backgroundColor: alpha(defaultWarningColor[50], 0.3),
                            [`& .${chipClasses.label}`]: {
                                color: defaultWarningColor[600],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: defaultWarningColor[500],
                            },
                            ...theme.applyStyles('dark', {
                                color: defaultWarningColor[300],
                                borderColor: alpha(defaultWarningColor[700], 0.5),
                                backgroundColor: alpha(defaultWarningColor[900], 0.3),
                                [`& .${chipClasses.label}`]: {
                                    color: defaultWarningColor[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: defaultWarningColor[300],
                                },
                            }),
                        },
                    },
                    {
                        props: { color: 'primary' },
                        style: {
                            borderColor: alpha(brand[300], 0.5),
                            backgroundColor: alpha(brand[50], 0.3),
                            [`& .${chipClasses.label}`]: {
                                color: brand[600],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: brand[500],
                            },
                            ...theme.applyStyles('dark', {
                                color: brand[300],
                                borderColor: alpha(brand[700], 0.5),
                                backgroundColor: alpha(brand[900], 0.3),
                                [`& .${chipClasses.label}`]: {
                                    color: brand[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: brand[300],
                                },
                            }),
                        },
                    },
                    {
                        props: { size: 'small' },
                        style: {
                            maxHeight: 24,
                            [`& .${chipClasses.label}`]: {
                                fontSize: theme.typography.caption.fontSize,
                            },
                            [`& .${svgIconClasses.root}`]: {
                                fontSize: theme.typography.caption.fontSize,
                            },
                        },
                    },
                    {
                        props: { size: 'medium' },
                        style: {
                            maxHeight: 32,
                            [`& .${chipClasses.label}`]: {
                                fontSize: theme.typography.body2.fontSize,
                            },
                        },
                    },
                ],
            }),
        },
    },
    MuiTablePagination: {
        styleOverrides: {
            actions: ({ theme }) => ({
                display: 'flex',
                gap: 4,
                marginRight: 8,
                [`& .${iconButtonClasses.root}`]: {
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: alpha(gray[200], 0.5),
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(gray[300], 0.5),
                    },
                },
            }),
        },
    },
    MuiIcon: {
        defaultProps: {
            fontSize: 'small',
        },
        styleOverrides: {
            root: {
                variants: [
                    {
                        props: { fontSize: 'small' },
                        style: {
                            fontSize: '1rem',
                        },
                    },
                    {
                        props: { fontSize: 'medium' },
                        style: {
                            fontSize: '1.25rem',
                        },
                    },
                    {
                        props: { fontSize: 'large' },
                        style: {
                            fontSize: '1.5rem',
                        },
                    },
                ],
            },
        },
    },
};
