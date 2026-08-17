import * as React from 'react';
import { alpha } from '@mui/material';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { CheckBoxOutlineBlankRounded, CheckRounded, RemoveRounded } from '@mui/icons-material';
import { brand, gray } from '../ThemePrimitives';

export const inputsCustomizations = {
    MuiButtonBase: {
        defaultProps: {
            disableTouchRipple: true,
            disableRipple: true,
            disableFocusRipple: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                boxSizing: 'border-box',
                transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                '&:focus-visible': {
                    outline: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                    outlineOffset: '2px',
                },
            }),
        },
    },
    MuiButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                boxShadow: 'none',
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                fontWeight: 600,
                variants: [
                    {
                        props: {
                            size: 'small',
                        },
                        style: {
                            height: '2.25rem',
                            padding: '8px 12px',
                            fontSize: '0.8125rem',
                        },
                    },
                    {
                        props: {
                            size: 'medium',
                        },
                        style: {
                            height: '2.5rem',
                            padding: '10px 16px',
                            fontSize: '0.875rem',
                        },
                    },
                    {
                        props: {
                            size: 'large',
                        },
                        style: {
                            height: '2.75rem',
                            padding: '12px 20px',
                            fontSize: '0.9375rem',
                        },
                    },
                    {
                        props: {
                            color: 'primary',
                            variant: 'contained',
                        },
                        style: {
                            background: brand[500],
                            border: 'none',
                            color: 'white',
                            '&:hover': {
                                background: brand[600],
                                boxShadow: theme.shadows[2],
                            },
                            '&:active': {
                                background: brand[700],
                                boxShadow: 'none',
                            },
                        },
                    },
                    {
                        props: {
                            color: 'secondary',
                            variant: 'contained',
                        },
                        style: {
                            background: gray[700],
                            border: 'none',
                            color: 'white',
                            '&:hover': {
                                background: gray[800],
                                boxShadow: theme.shadows[2],
                            },
                            '&:active': {
                                background: gray[900],
                                boxShadow: 'none',
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            backgroundColor: 'transparent',
                            border: '1px solid',
                            borderColor: gray[200],
                            '&:hover': {
                                backgroundColor: alpha(gray[100], 0.2),
                                borderColor: gray[300],
                            },
                            '&:active': {
                                backgroundColor: alpha(gray[200], 0.2),
                            },
                        },
                    },
                    {
                        props: {
                            color: 'primary',
                            variant: 'outlined',
                        },
                        style: {
                            color: brand[600],
                            border: '1px solid',
                            borderColor: brand[200],
                            backgroundColor: alpha(brand[50], 0.1),
                            '&:hover': {
                                backgroundColor: alpha(brand[100], 0.2),
                                borderColor: brand[300],
                            },
                            '&:active': {
                                backgroundColor: alpha(brand[200], 0.2),
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                        },
                        style: {
                            color: gray[600],
                            '&:hover': {
                                backgroundColor: alpha(gray[100], 0.1),
                            },
                            '&:active': {
                                backgroundColor: alpha(gray[200], 0.1),
                            },
                        },
                    },
                    {
                        props: {
                            color: 'primary',
                            variant: 'text',
                        },
                        style: {
                            color: brand[600],
                            '&:hover': {
                                backgroundColor: alpha(brand[100], 0.1),
                            },
                            '&:active': {
                                backgroundColor: alpha(brand[200], 0.1),
                            },
                        },
                    },
                ],
            }),
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                boxShadow: 'none',
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                fontWeight: theme.typography.fontWeightMedium,
                letterSpacing: 0,
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                variants: [
                    {
                        props: {
                            size: 'small',
                        },
                        style: {
                            width: '2rem',
                            height: '2rem',
                            padding: '0.25rem',
                            [`& .${svgIconClasses.root}`]: { fontSize: '0.875rem' },
                        },
                    },
                ],
            }),
        },
    },
    MuiToggleButtonGroup: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                padding: '2px',
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${theme.palette.divider}`,
                [`& .${toggleButtonGroupClasses.selected}`]: {
                    color: brand[500],
                },
            }),
        },
    },
    MuiToggleButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                padding: '8px 14px',
                textTransform: 'none',
                borderRadius: theme.shape.borderRadius,
                fontWeight: 500,
                fontSize: '0.8125rem',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                [`&.${toggleButtonClasses.selected}`]: {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: brand[500],
                },
            }),
        },
    },
    MuiCheckbox: {
        defaultProps: {
            disableRipple: true,
            icon: (
                <CheckBoxOutlineBlankRounded sx={{ color: 'hsla(210, 0%, 0%, 0.0)' }} />
            ),
            checkedIcon: <CheckRounded sx={{ height: 14, width: 14 }} />,
            indeterminateIcon: <RemoveRounded sx={{ height: 14, width: 14 }} />,
        },
        styleOverrides: {
            root: () => ({
                margin: 8,
                height: 18,
                width: 18,
                borderRadius: 6,
                border: '1px solid',
                borderColor: alpha(gray[300], 0.6),
                boxShadow: 'none',
                backgroundColor: alpha(gray[100], 0.2),
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                    borderColor: brand[300],
                },
                '&.Mui-focusVisible': {
                    outline: `3px solid ${alpha(brand[500], 0.4)}`,
                    outlineOffset: '2px',
                    borderColor: brand[400],
                },
                '&.Mui-checked': {
                    color: 'white',
                    backgroundColor: brand[500],
                    borderColor: brand[500],
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: brand[600],
                    },
                },
            }),
        },
    },
    MuiInputBase: {
        styleOverrides: {
            root: ({ theme }) => ({
                border: 'none',
                borderRadius: theme.shape.borderRadius,
            }),
            input: {
                '&::placeholder': {
                    opacity: 0.6,
                    color: gray[500],
                },
            },
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            input: {
                padding: 0,
            },
            root: ({ theme }) => ({
                padding: '4px 8px',
                color: theme.palette.text.primary,
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: alpha(gray[200], 0.6),
                backgroundColor: theme.palette.background.paper,
                boxShadow: 'none',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                '&:hover': {
                    borderColor: brand[300],
                },
                [`&.${outlinedInputClasses.focused}`]: {
                    outline: `3px solid ${alpha(brand[500], 0.2)}`,
                    borderColor: brand[400],
                    boxShadow: `0 0 0 3px ${alpha(brand[500], 0.1)}`,
                },
                [`& .MuiAutocomplete-endAdornment`]: {
                    right: 0,
                },
                variants: [
                    {
                        props: {
                            size: 'small',
                        },
                        style: {
                            height: 'auto',
                            minHeight: '36px',
                        },
                    },
                ],
            }),
            notchedOutline: {
                border: 'none',
            },
        },
    },
    MuiInputAdornment: {
        styleOverrides: {
            root: ({ theme }) => ({
                color: theme.palette.grey[500],
            }),
        },
    },
    MuiFormLabel: {
        styleOverrides: {
            root: ({ theme }) => ({
                typography: theme.typography.caption,
                marginBottom: 6,
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: theme.palette.text.secondary,
            }),
        },
    },
    MuiAutocomplete: {
        styleOverrides: {
            root: () => ({
                '& .MuiInputBase-root': {
                    padding: '2px 8px',
                    minHeight: '32px',
                },
                '& .MuiAutocomplete-input': {
                    padding: '0 !important',
                    fontSize: '0.8125rem',
                },
            }),
            paper: ({ theme }) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                marginTop: '4px',
                boxShadow: theme.shadows[3],
                backgroundColor: theme.palette.background.paper,
            }),
        },
    },
};
