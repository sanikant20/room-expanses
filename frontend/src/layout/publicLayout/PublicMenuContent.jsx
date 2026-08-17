import React from 'react';
import {
    Button,
    Stack,
    ListItem,
    ListItemButton,
    ListItemText,
    alpha,
    useTheme,
    Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { PublicMenuItems } from './PublicMenuItems';

const PublicMenuContent = ({ isMobile = false, onMenuClose }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        const anchorIndex = path.indexOf('#');
        const route = anchorIndex >= 0 ? path.slice(0, anchorIndex) : path;
        const anchor = anchorIndex >= 0 ? path.slice(anchorIndex + 1) : null;

        if (anchor) {
            const scrollToSection = () => {
                document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            if (location.pathname === route || route === '') {
                scrollToSection();
            } else {
                navigate(route);
                setTimeout(scrollToSection, 100);
            }
        } else {
            navigate(path);
        }

        if (isMobile && onMenuClose) {
            onMenuClose();
        }
    };

    const isActive = (path) => {
        const anchorIndex = path.indexOf('#');
        const route = anchorIndex >= 0 ? path.slice(0, anchorIndex) : path;
        if (route === '/' && location.pathname === '/') return true;
        if (route !== '/' && route && location.pathname.startsWith(route)) return true;
        return false;
    };

    if (isMobile) {
        return (
            <>
                {PublicMenuItems?.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                                borderRadius: 1.5,
                                mb: 0.5,
                                py: 1.5,
                                minHeight: 44,
                                bgcolor: isActive(item.path)
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : 'transparent',
                                color: isActive(item.path)
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: isActive(item.path)
                                        ? alpha(theme.palette.primary.main, 0.12)
                                        : alpha(theme.palette.action.hover, 0.4),
                                },
                                '&:active': {
                                    transform: 'scale(0.98)',
                                },
                                '@media (prefers-reduced-motion: reduce)': {
                                    transition: 'none',
                                    '&:active': { transform: 'none' },
                                },
                            }}
                            aria-current={isActive(item.path) ? 'page' : undefined}
                        >
                            {item.icon && (
                                <Box
                                    component="span"
                                    sx={{
                                        mr: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                                        '& .MuiSvgIcon-root': { fontSize: 22 },
                                    }}
                                >
                                    {item.icon}
                                </Box>
                            )}
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 600 : 500,
                                    fontSize: '0.9375rem',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </>
        );
    }

    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                mx: 2,
            }}
        >
            {PublicMenuItems?.map((item) => (
                <Button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    disableRipple
                    sx={{
                        color: isActive(item.path)
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        fontWeight: isActive(item.path) ? 600 : 500,
                        textTransform: 'none',
                        fontSize: '0.9375rem',
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        position: 'relative',
                        backgroundColor: isActive(item.path)
                            ? alpha(theme.palette.primary.main, 0.06)
                            : 'transparent',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: isActive(item.path) ? '20px' : '0px',
                            height: '3px',
                            bgcolor: theme.palette.primary.main,
                            borderRadius: '2px',
                            transition: 'width 0.25s ease, opacity 0.25s ease',
                            opacity: isActive(item.path) ? 1 : 0,
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.4),
                            color: theme.palette.text.primary,
                            '&::after': {
                                width: '20px',
                                opacity: 0.5,
                            },
                        },
                        '&:focus-visible': {
                            outline: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                            outlineOffset: '2px',
                        },
                        '@media (prefers-reduced-motion: reduce)': {
                            '&::after': { transition: 'none' },
                            '&:hover::after': { width: isActive(item.path) ? '20px' : '0px' },
                        },
                    }}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                >
                    {item.label}
                </Button>
            ))}
        </Stack>
    );
};

export default PublicMenuContent;
