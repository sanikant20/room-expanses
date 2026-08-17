import React from 'react';
import { alpha } from '@mui/material/styles';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import { selectClasses } from '@mui/material/Select';
import { tabClasses } from '@mui/material/Tab';
import { gray, brand } from '../ThemePrimitives';
import { UnfoldMoreRounded } from '@mui/icons-material';

export const navigationCustomizations = {
    MuiMenuItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                padding: '8px 12px',
                margin: '2px 4px',
                transition: 'background-color 0.15s ease',
                [`&.${menuItemClasses.focusVisible}`]: {
                    backgroundColor: 'transparent',
                },
                [`&.${menuItemClasses.selected}`]: {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    [`&.${menuItemClasses.focusVisible}`]: {
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                    },
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    },
                },
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
                border: `1px solid ${theme.palette.divider}`,
                backgroundImage: 'none',
                background: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                padding: '4px',
                [`& .${buttonBaseClasses.root}`]: {
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                    },
                },
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
                borderColor: alpha(gray[200], 0.6),
                backgroundColor: theme.palette.background.paper,
                boxShadow: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    borderColor: brand[300],
                },
                [`&.${selectClasses.focused}`]: {
                    outlineOffset: 0,
                    borderColor: brand[400],
                    boxShadow: `0 0 0 3px ${alpha(brand[500], 0.1)}`,
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
                transition: 'color 0.2s ease',
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
                backgroundColor: theme.palette.background.paper,
            }),
        },
    },
    MuiPaginationItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                margin: '0 2px',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&.Mui-selected': {
                    color: 'white',
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[1],
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                ...theme.applyStyles('dark', {
                    '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[1],
                    },
                }),
            }),
        },
    },
    MuiTabs: {
        styleOverrides: {
            root: { minHeight: 'fit-content' },
            indicator: ({ theme }) => ({
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0',
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
                transition: 'color 0.15s ease, background-color 0.15s ease',
                fontWeight: 500,
                fontSize: '0.875rem',
                ':hover': {
                    color: theme.palette.text.primary,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                [`&.${tabClasses.selected}`]: {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                },
                ...theme.applyStyles('dark', {
                    ':hover': {
                        color: theme.palette.text.primary,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
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
                    boxShadow: theme.shadows[1],
                },
                '&.Mui-completed': {
                    border: 'none',
                    color: theme.palette.success.main,
                    boxShadow: theme.shadows[1],
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
