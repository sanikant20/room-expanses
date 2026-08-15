import * as React from 'react';
import { alpha } from '@mui/material';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { CheckBoxOutlineBlankRounded, CheckRounded, RemoveRounded } from '@mui/icons-material';
import { brand, gray } from '../ThemePrimitives';

const getNeumorphShadow = (mode) =>
    mode === 'dark'
        ? '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(60, 60, 80, 0.15)'
        : '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)';

const getNeumorphShadowLg = (mode) =>
    mode === 'dark'
        ? '8px 8px 16px rgba(0, 0, 0, 0.45), -8px -8px 16px rgba(60, 60, 80, 0.12)'
        : '8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.7)';

const getNeumorphInset = (mode) =>
    mode === 'dark'
        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.35), inset -4px -4px 8px rgba(60, 60, 80, 0.12)'
        : 'inset 4px 4px 8px rgba(163, 177, 198, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.5)';

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
                transition: 'all 150ms ease-in-out',
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
                            background: `linear-gradient(135deg, ${brand[300]}, ${brand[500]})`,
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                            border: 'none',
                            color: 'white',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: getNeumorphShadowLg(theme.palette.mode),
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: getNeumorphInset(theme.palette.mode),
                            },
                        },
                    },
                    {
                        props: {
                            color: 'secondary',
                            variant: 'contained',
                        },
                        style: {
                            background: `linear-gradient(135deg, ${gray[700]}, ${gray[800]})`,
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                            border: 'none',
                            color: 'white',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: getNeumorphShadowLg(theme.palette.mode),
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: getNeumorphInset(theme.palette.mode),
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            backgroundColor: alpha(gray[50], 0.1),
                            border: '1px solid',
                            borderColor: gray[200],
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                            '&:hover': {
                                backgroundColor: alpha(gray[100], 0.2),
                                borderColor: gray[300],
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: getNeumorphInset(theme.palette.mode),
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
                            boxShadow: getNeumorphShadow(theme.palette.mode),
                            '&:hover': {
                                backgroundColor: alpha(brand[100], 0.2),
                                borderColor: brand[300],
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: getNeumorphInset(theme.palette.mode),
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
                boxShadow: getNeumorphShadow(theme.palette.mode),
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                fontWeight: theme.typography.fontWeightMedium,
                letterSpacing: 0,
                color: theme.palette.text.primary,
                border: '1px solid',
                borderColor: alpha(gray[200], 0.5),
                backgroundColor: alpha(theme.palette.primary.light, 0.03),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.light, 0.08),
                    borderColor: gray[300],
                    transform: 'translateY(-1px)',
                    boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.7)',
                },
                '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: getNeumorphInset(theme.palette.mode),
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
                boxShadow: getNeumorphShadow(theme.palette.mode),
                padding: '2px',
                backgroundColor: alpha(theme.palette.primary.light, 0.03),
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
                    boxShadow: getNeumorphInset(theme.palette.mode),
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
            root: ({ theme }) => ({
                margin: 8,
                height: 18,
                width: 18,
                borderRadius: 6,
                border: '1px solid',
                borderColor: alpha(gray[300], 0.6),
                boxShadow: getNeumorphInset(theme.palette.mode),
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
                    boxShadow: getNeumorphShadow(theme.palette.mode),
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
                borderColor: alpha(gray[200], 0.5),
                backgroundColor: alpha(theme.palette.primary.light, 0.02),
                boxShadow: getNeumorphInset(theme.palette.mode),
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                    borderColor: brand[300],
                    backgroundColor: alpha(theme.palette.primary.light, 0.04),
                },
                [`&.${outlinedInputClasses.focused}`]: {
                    outline: `3px solid ${alpha(brand[500], 0.3)}`,
                    borderColor: brand[400],
                    backgroundColor: alpha(theme.palette.primary.light, 0.04),
                    boxShadow: getNeumorphShadow(theme.palette.mode),
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
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: theme.shape.borderRadius,
                marginTop: '4px',
                boxShadow: getNeumorphShadow(theme.palette.mode),
                backgroundColor: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(8px)',
            }),
        },
    },
};