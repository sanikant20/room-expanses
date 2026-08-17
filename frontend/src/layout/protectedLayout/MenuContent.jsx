import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Collapse, TextField, InputAdornment, IconButton, Tooltip, Box, Fade, Popper, Paper, Grow, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuItemLists, secondaryListItems } from './MenuItemLists';
import { ClearRounded, ExpandLess, ExpandMore, SearchRounded, FiberManualRecord } from '@mui/icons-material';
import { isPartnerAccount } from '../../helper/getAuthData';

const generateKey = (item, parentIndex = '', level = 0) => {
    return `${parentIndex}-${level}-${item.menu}`.replace(/\s+/g, '-');
};

export default function MenuContent({ sidebarCollapsed = false, onMenuSelect }) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const computeOpenStates = useCallback(() => {
        const states = {};
        const findActiveParents = (items, level = 0, parentKey = '') => {
            items.forEach((item) => {
                const itemKey = generateKey(item, parentKey, level);
                if (item.children && item.children.length > 0) {
                    const hasActiveChild = findActiveParents(item.children, level + 1, itemKey);
                    if (hasActiveChild) {
                        states[itemKey] = true;
                    }
                }
            });
            return items.some((item) => {
                const path = location.pathname;
                const itemPath = item.route;
                return path === itemPath || path === `${itemPath}/` || (itemPath !== '/' && path.startsWith(`${itemPath}/`));
            });
        };
        findActiveParents(MenuItemLists);
        return states;
    }, [location.pathname]);

    const [openStates, setOpenStates] = useState(computeOpenStates);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredItem, setHoveredItem] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const hoverTimeoutRef = useRef(null);
    const popoverTimeoutRef = useRef(null);
    const menuItemRefs = useRef({});
    const popoverRef = useRef(null);
    const activeItemRef = useRef(null);
    const menuItemDomRefs = useRef({});

    const getMenuText = (item) => item?.menu || '';

    const isActive = useCallback((item) => {
        const path = location.pathname;
        const itemPath = item.route;
        return path === itemPath || path === `${itemPath}/` || (itemPath !== '/' && path.startsWith(`${itemPath}/`));
    }, [location.pathname]);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        };
    }, []);

    useLayoutEffect(() => {
        setOpenStates(prev => {
            const next = computeOpenStates();
            const hasChanges = Object.keys(next).some(key => !prev[key]) || Object.keys(prev).some(key => !(key in next));
            if (hasChanges) {
                return { ...prev, ...next };
            }
            return prev;
        });
    }, [location.pathname, computeOpenStates]);

    useEffect(() => {
        // Auto scroll to active item after DOM rendering has settled
        const timer = setTimeout(() => {
            if (activeItemRef.current) {
                activeItemRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [location.pathname, sidebarCollapsed]);

    const handleMenuItemMouseEnter = (e, item, hasChildren, level) => {
        if (sidebarCollapsed && hasChildren && level === 0) {
            // Clear all pending timeouts
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);

            // Store reference to the menu item
            menuItemRefs.current[item.menu] = e.currentTarget;

            setHoveredItem(item);
            setAnchorEl(e.currentTarget);
            setIsPopoverOpen(true);
        }
    };

    const handleMenuItemMouseLeave = () => {
        if (!sidebarCollapsed || !hoveredItem) return;

        // Delay closing to allow moving to popover
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            // Check if mouse is not over popover
            if (!isPopoverOpen) {
                closePopover();
            }
        }, 300);
    };

    const handlePopoverMouseEnter = () => {
        // Clear any pending close timeouts
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        setIsPopoverOpen(true);
    };

    const handlePopoverMouseLeave = () => {
        // Delay closing to allow moving back to menu item
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = setTimeout(() => {
            closePopover();
        }, 300);
    };

    const closePopover = () => {
        setIsPopoverOpen(false);
        setHoveredItem(null);
        setAnchorEl(null);
        // Clear refs
        if (menuItemRefs.current[hoveredItem?.menu]) {
            delete menuItemRefs.current[hoveredItem?.menu];
        }
    };

    const handleClick = (key, item) => {
        if (item.children && item.children.length > 0) {
            if (!sidebarCollapsed) {
                const willOpen = !openStates[key];
                setOpenStates(prev => ({ ...prev, [key]: !prev[key] }));

                if (willOpen) {
                    // Auto scroll to the expanded parent item
                    setTimeout(() => {
                        const element = menuItemDomRefs.current[key];
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest'
                            });
                        }
                    }, 250); // Wait for the Collapse animation to start
                }
            }
        } else {
            navigate(item.route);
            if (onMenuSelect) onMenuSelect();
            closePopover();
        }
    };

    const clearSearch = () => setSearchTerm('');

    const itemMatchesSearch = (item) => {
        const menuText = getMenuText(item);
        if (menuText.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        if (item.children) return item.children.some(child => itemMatchesSearch(child));
        return false;
    };

    const filteredMainItems = (searchTerm ? MenuItemLists.filter(item => itemMatchesSearch(item)) : MenuItemLists)
        .filter(item => !(item.adminOnly && isPartnerAccount()));
    const filteredSecondaryItems = searchTerm ? secondaryListItems.filter(item => getMenuText(item).toLowerCase().includes(searchTerm.toLowerCase())) : secondaryListItems;

    const renderMenuItems = (items, level = 0, parentIndex = '') => {
        return items.map((item) => {
            const itemKey = generateKey(item, parentIndex, level);
            const hasChildren = item.children && item.children.length > 0;
            const paddingLeft = level === 0 ? 2 : 2 + (level * 2);
            const active = isActive(item);
            const menuText = getMenuText(item);

            return (
                <React.Fragment key={itemKey}>
                    <ListItem
                        ref={(el) => {
                            if (el) {
                                menuItemDomRefs.current[itemKey] = el;
                            } else {
                                delete menuItemDomRefs.current[itemKey];
                            }
                            if (active) {
                                activeItemRef.current = el;
                            }
                        }}
                        disablePadding
                        sx={{ display: 'block', mb: 0.5, position: 'relative' }}
                    >
                        <Tooltip title={sidebarCollapsed && level === 0 ? menuText : ''} placement="right" enterDelay={500} arrow>
                            <ListItemButton
                                selected={active}
                                onClick={() => handleClick(itemKey, item)}
                                onMouseEnter={(e) => handleMenuItemMouseEnter(e, item, hasChildren, level)}
                                onMouseLeave={handleMenuItemMouseLeave}
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    justifyContent: sidebarCollapsed && level === 0 ? 'center' : 'flex-start',
                                    minHeight: 44,
                                    pl: sidebarCollapsed && level === 0 ? 0 : paddingLeft,
                                    position: 'relative',
                                    transition: 'background-color 0.15s ease, color 0.15s ease',
                                    '&.Mui-selected': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.16),
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.primary.main,
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.primary.main,
                                        },
                                        '& .MuiListItemText-primary': {
                                            color: theme.palette.primary.main,
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: sidebarCollapsed && level === 0 ? 'auto' : 40,
                                    color: active ? theme.palette.primary.main : 'text.secondary',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s ease',
                                }}>
                                    {item.icon || <FiberManualRecord sx={{ fontSize: 12 }} />}
                                </ListItemIcon>

                                {(!sidebarCollapsed || level > 0) && (
                                    <>
                                        <ListItemText
                                            primary={menuText}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontSize: level > 1 ? '0.8125rem' : '0.875rem',
                                                fontWeight: active ? 600 : (level > 1 ? 400 : 500),
                                            }}
                                            sx={{
                                                ml: level > 0 ? 0.5 : 0,
                                                '& .MuiTypography-root': {
                                                    transition: 'color 0.2s ease',
                                                    color: active ? theme.palette.primary.main : 'text.primary',
                                                },
                                            }}
                                        />
                                        {hasChildren && !sidebarCollapsed && (
                                            openStates[itemKey] ?
                                                <ExpandLess sx={{ color: active ? theme.palette.primary.main : 'text.secondary', fontSize: 18 }} /> :
                                                <ExpandMore sx={{ color: active ? theme.palette.primary.main : 'text.secondary', fontSize: 18 }} />
                                        )}
                                    </>
                                )}
                            </ListItemButton>
                        </Tooltip>

                        {!sidebarCollapsed && hasChildren && (
                            <Collapse in={openStates[itemKey]} timeout="auto">
                                <List component="div" disablePadding dense sx={{ pl: 2 }}>
                                    {item.children
                                        .filter(child => searchTerm === '' || itemMatchesSearch(child))
                                        .map((child) => renderMenuItems([child], level + 1, itemKey))}
                                </List>
                            </Collapse>
                        )}
                    </ListItem>
                </React.Fragment>
            );
        });
    };

    return (
        <>
            <Stack sx={{
                flexGrow: 1,
                p: sidebarCollapsed ? 1 : 1.5,
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Collapse in={!sidebarCollapsed} timeout={200} unmountOnExit={false}>
                    <Box sx={{ width: '100%', pb: 2, mb: 1, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={clearSearch}>
                                                <ClearRounded fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.background.default, 0.8),
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'background.paper',
                                        borderColor: theme.palette.primary.main,
                                    },
                                    '&.Mui-focused': {
                                        borderColor: theme.palette.primary.main,
                                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                                    },
                                },
                            }}
                        />
                    </Box>
                </Collapse>

                <List component="nav" sx={{ py: 0, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {filteredMainItems.map((item, index) => {
                        const itemKey = generateKey(item, '', 0);
                        const sectionChanged = index === 0 || item.section !== filteredMainItems[index - 1].section;
                        return (
                            <React.Fragment key={itemKey}>
                                {!sidebarCollapsed && sectionChanged && item.section && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            px: 2.5,
                                            pt: index === 0 ? 1 : 2,
                                            pb: 0.5,
                                            color: alpha(theme.palette.text.secondary, 0.6),
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            fontSize: '0.65rem',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        {item.section}
                                    </Typography>
                                )}
                                {renderMenuItems([item], 0, '')}
                            </React.Fragment>
                        );
                    })}
                    {!sidebarCollapsed && filteredMainItems.length === 0 && searchTerm && (
                        <ListItem>
                            <ListItemText primary="No menu items found" primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }} />
                        </ListItem>
                    )}
                </List>

                {filteredSecondaryItems?.length > 0 && (
                    <Box sx={{
                        pt: 1.5,
                        mt: 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        width: '100%',
                    }}>
                        {!sidebarCollapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    px: 2.5,
                                    pb: 0.5,
                                    color: alpha(theme.palette.text.secondary, 0.6),
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                System
                            </Typography>
                        )}
                        <List dense sx={{ py: 0 }}>
                            {filteredSecondaryItems.map((item) => {
                                const menuText = getMenuText(item);
                                const active = isActive(item);
                                return (
                                    <ListItem
                                        key={item.menu}
                                        ref={(el) => {
                                            if (el) {
                                                menuItemDomRefs.current[item.menu] = el;
                                            } else {
                                                delete menuItemDomRefs.current[item.menu];
                                            }
                                            if (active) {
                                                activeItemRef.current = el;
                                            }
                                        }}
                                        disablePadding
                                        sx={{
                                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                        }}
                                    >
                                        <Tooltip title={sidebarCollapsed ? menuText : ''} placement="right" arrow>
                                            <ListItemButton
                                                selected={active}
                                                onClick={() => { navigate(item.route); if (onMenuSelect) onMenuSelect(); }}
                                                dense
                                                sx={{
                                                    borderRadius: 1,
                                                    mx: 0.5,
                                                    my: 0.25,
                                                    minHeight: 32,
                                                    px: sidebarCollapsed ? 0 : 1,
                                                    width: sidebarCollapsed ? 32 : 'auto',
                                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative',
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                        '& .MuiListItemIcon-root': {
                                                            color: theme.palette.primary.main,
                                                        },
                                                        '& .MuiListItemText-primary': {
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 500,
                                                        },
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                        '& .MuiListItemIcon-root': {
                                                            color: theme.palette.primary.main,
                                                        },
                                                        '& .MuiListItemText-primary': {
                                                            color: theme.palette.primary.main,
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{
                                                    minWidth: sidebarCollapsed ? 'auto' : 32,
                                                    justifyContent: 'center',
                                                    color: active ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.6),
                                                    transition: 'all 0.2s ease',
                                                    '& .MuiSvgIcon-root': {
                                                        fontSize: 18,
                                                    },
                                                }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                {!sidebarCollapsed && (
                                                    <ListItemText
                                                        primary={menuText}
                                                        primaryTypographyProps={{
                                                            variant: 'caption',
                                                            fontSize: '0.75rem',
                                                            fontWeight: active ? 500 : 400,
                                                            sx: {
                                                                letterSpacing: '-0.2px',
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </ListItemButton>
                                        </Tooltip>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                )}
            </Stack>

            <Popper
                open={isPopoverOpen && Boolean(hoveredItem && anchorEl)}
                anchorEl={anchorEl}
                placement="right-start"
                transition
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: 'viewport',
                            padding: 8,
                        },
                    },
                ]}
                sx={{
                    zIndex: 1300,
                }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} timeout={200}>
                        <Paper
                            ref={popoverRef}
                            elevation={3}
                            onMouseEnter={handlePopoverMouseEnter}
                            onMouseLeave={handlePopoverMouseLeave}
                            sx={{
                                minWidth: 200,
                                p: 1,
                                borderRadius: 1,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                backgroundColor: theme.palette.background.paper,
                                overflow: 'hidden',
                            }}
                        >
                            <Box>
                                {hoveredItem?.children?.map((child) => {
                                    const active = isActive(child);
                                    return (
                                        <ListItemButton
                                            key={child.route}
                                            selected={active}
                                            onClick={() => {
                                                navigate(child.route);
                                                closePopover();
                                                onMenuSelect?.();
                                            }}
                                            sx={{
                                                borderRadius: 2,
                                                my: 0.5,
                                                transition: 'all 0.2s ease',
                                                '&.Mui-selected': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                                                },
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                    transform: 'translateX(4px)',
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36, color: active ? theme.palette.primary.main : 'text.secondary' }}>
                                                {child.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={getMenuText(child)}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    fontWeight: active ? 600 : 400
                                                }}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </Box>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}