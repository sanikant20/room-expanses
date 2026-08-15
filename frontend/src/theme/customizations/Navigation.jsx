import React from 'react';
import { alpha } from '@mui/material/styles';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import { selectClasses } from '@mui/material/Select';
import { tabClasses } from '@mui/material/Tab';
import { gray, brand } from '../ThemePrimitives';
import { UnfoldMoreRounded } from '@mui/icons-material';

const getNeumorphShadow = (mode) =>
    mode === 'dark'
        ? '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(60, 60, 80, 0.15)'
        : '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)';

const getNeumorphInset = (mode) =>
    mode === 'dark'
        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.35), inset -4px -4px 8px rgba(60, 60, 80, 0.12)'
        : 'inset 4px 4px 8px rgba(163, 177, 198, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.5)';

export const navigationCustomizations = {
    MuiMenuItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                padding: '8px 12px',
                margin: '2px 4px',
                transition: 'all 0.2s ease',
                [`&.${menuItemClasses.focusVisible}`]: {
                    backgroundColor: 'transparent',
                },
                [`&.${menuItemClasses.selected}`]: {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    boxShadow: getNeumorphInset(theme.palette.mode),
                    [`&.${menuItemClasses.focusVisible}`]: {
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                    },
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    },
                },
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateX(2px)',
                },
            }),
        },
    },
    MuiMenu: {
        styleOverrides: {
            list: {
                gap: '2px',
                padding: '4px',
                [`&.${dividerClasses.root}`]: {
                    margin: '0 -4px',
                },
            },
            paper: ({ theme }) => ({
                marginTop: '4px',
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                backgroundImage: 'none',
                background: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(8px)',
                boxShadow: getNeumorphShadow(theme.palette.mode),
                padding: '4px',
                [`& .${buttonBaseClasses.root}`]: {
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                    },
                },
                ...theme.applyStyles('dark', {
                    background: alpha(gray[900], 0.98),
                }),
            }),
        },
    },
    MuiSelect: {
        defaultProps: {
            IconComponent: React.forwardRef((props, ref) => (
                <UnfoldMoreRounded fontSize="small" {...props} ref={ref} />
            )),
        },
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: alpha(gray[200], 0.5),
                backgroundColor: alpha(theme.palette.primary.light, 0.02),
                boxShadow: getNeumorphInset(theme.palette.mode),
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: brand[300],
                    backgroundColor: alpha(theme.palette.primary.light, 0.04),
                    boxShadow: theme.palette.mode === 'dark'
                        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -4px -4px 8px rgba(60, 60, 80, 0.1)'
                        : 'inset 4px 4px 8px rgba(163, 177, 198, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.4)',
                },
                [`&.${selectClasses.focused}`]: {
                    outlineOffset: 0,
                    borderColor: brand[400],
                    boxShadow: getNeumorphShadow(theme.palette.mode),
                },
                '&:before, &:after': {
                    display: 'none',
                },
            }),
            select: ({ theme }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '1px 2px',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:focus-visible': {
                    backgroundColor: alpha(theme.palette.primary.light, 0.04),
                },
                ...theme.applyStyles('dark', {
                    '&:focus-visible': {
                        backgroundColor: alpha(gray[800], 0.3),
                    },
                }),
            }),
        },
    },
    MuiLink: {
        defaultProps: {
            underline: 'none',
        },
        styleOverrides: {
            root: ({ theme }) => ({
                color: theme.palette.text.primary,
                fontWeight: 500,
                position: 'relative',
                textDecoration: 'none',
                width: 'fit-content',
                transition: 'all 0.3s ease',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '2px',
                    bottom: -2,
                    left: 0,
                    backgroundColor: theme.palette.primary.main,
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    borderRadius: '2px',
                },
                '&:hover::before': {
                    opacity: 0.6,
                    width: '100%',
                },
                '&:hover': {
                    color: theme.palette.primary.main,
                },
                '&:focus-visible': {
                    outline: `3px solid ${alpha(brand[500], 0.4)}`,
                    outlineOffset: '4px',
                    borderRadius: '2px',
                },
            }),
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: ({ theme }) => ({
                backgroundColor: theme.palette.background.default,
            }),
        },
    },
    MuiPaginationItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                margin: '0 2px',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.05)',
                },
                '&.Mui-selected': {
                    color: 'white',
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: getNeumorphShadow(theme.palette.mode),
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'scale(1.05)',
                    },
                },
                ...theme.applyStyles('dark', {
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                boxShadow: getNeumorphShadow(theme.palette.mode),
                    },
                }),
            }),
        },
    },
    MuiTabs: {
        styleOverrides: {
            root: { minHeight: 'fit-content' },
            indicator: ({ theme }) => ({
                backgroundColor: theme.palette.grey[800],
                ...theme.applyStyles('dark', {
                    backgroundColor: theme.palette.grey[200],
                }),
            }),
        },
    },
    MuiTab: {
        styleOverrides: {
            root: ({ theme }) => ({
                padding: '8px 16px',
                margin: '2px',
                textTransform: 'none',
                minWidth: 'fit-content',
                minHeight: 'fit-content',
                color: theme.palette.text.secondary,
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                fontSize: '0.875rem',
                ':hover': {
                    color: theme.palette.text.primary,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                },
                [`&.${tabClasses.selected}`]: {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    boxShadow: getNeumorphInset(theme.palette.mode),
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                },
                ...theme.applyStyles('dark', {
                    ':hover': {
                        color: theme.palette.text.primary,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.15),
                    },
                    [`&.${tabClasses.selected}`]: {
                        color: theme.palette.primary.light,
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                }),
            }),
        },
    },
    MuiStepConnector: {
        styleOverrides: {
            line: ({ theme }) => ({
                borderTop: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                flex: 1,
                borderRadius: '99px',
            }),
        },
    },
    MuiStepIcon: {
        styleOverrides: {
            root: ({ theme }) => ({
                color: 'transparent',
                border: `2px solid ${alpha(gray[400], 0.3)}`,
                width: 14,
                height: 14,
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                '& text': {
                    display: 'none',
                },
                '&.Mui-active': {
                    border: 'none',
                    color: theme.palette.primary.main,
                    boxShadow: getNeumorphShadow(theme.palette.mode),
                },
                '&.Mui-completed': {
                    border: 'none',
                    color: theme.palette.success.main,
                    boxShadow: getNeumorphShadow(theme.palette.mode),
                },
            }),
        },
    },
    MuiStepLabel: {
        styleOverrides: {
            label: ({ theme }) => ({
                fontWeight: 500,
                fontSize: '0.875rem',
                '&.Mui-completed': {
                    opacity: 0.6,
                },
                '&.Mui-active': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                },
            }),
        },
    },
};