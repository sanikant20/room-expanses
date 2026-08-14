import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link } from 'react-router-dom';
import { MenuItemLists } from './MenuItemLists';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
    margin: theme.spacing(1, 0),
    [`& .${breadcrumbsClasses.separator}`]: {
        color: (theme.vars || theme).palette.action.disabled,
        margin: 1,
    },
    [`& .${breadcrumbsClasses.ol}`]: {
        alignItems: 'center',
    },
}));

// Function to get menu text (no translation)
const getMenuText = (menuKey) => {
    return menuKey;
};

// Recursive function to find the menu item hierarchy by route
const findMenuItemHierarchy = (route, menuItems, hierarchy = []) => {
    for (const item of menuItems) {
        // Check if current item matches the route
        if (item.route === route) {
            return [...hierarchy, item];
        }

        // Check if any child matches the route
        if (item.children) {
            const result = findMenuItemHierarchy(route, item.children, [...hierarchy, item]);
            if (result.length > 0) {
                return result;
            }
        }
    }
    return [];
};

// Alternative: Function to find breadcrumb path by matching route segments
const findBreadcrumbPath = (currentRoute, menuItems) => {
    const path = [];

    const searchInItems = (items, currentPath = []) => {
        for (const item of items) {
            const newPath = [...currentPath, item];

            // Exact match
            if (item.route === currentRoute) {
                path.push(...newPath);
                return true;
            }

            // Partial match for nested routes
            if (currentRoute.startsWith(item.route + '/') ||
                (item.route !== '/' && currentRoute.includes(item.route))) {
                if (item.children) {
                    if (searchInItems(item.children, newPath)) {
                        return true;
                    }
                } else {
                    // If no children but route matches partially, include it
                    path.push(...newPath);
                    return true;
                }
            }

            // Check children
            if (item.children) {
                if (searchInItems(item.children, newPath)) {
                    return true;
                }
            }
        }
        return false;
    };

    searchInItems(menuItems);
    return path;
};

// Fallback: Generate breadcrumbs from route path
const generateBreadcrumbsFromPath = (currentRoute) => {
    const paths = currentRoute.split('/').filter(Boolean);
    const breadcrumbs = [{ menu: 'Dashboard', route: '/dashboard' }];

    let accumulatedPath = '';
    paths.forEach(path => {
        accumulatedPath += `/${path}`;
        const menuName = path.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        breadcrumbs.push({ menu: menuName, route: accumulatedPath });
    });

    return breadcrumbs;
};

export default function BreadcrumbsPath() {
    const location = useLocation();
    const currentRoute = location.pathname;

    // Try to find menu items hierarchy first
    let breadcrumbItems = findMenuItemHierarchy(currentRoute, MenuItemLists);

    // If no menu items found, try alternative method
    if (breadcrumbItems.length === 0) {
        breadcrumbItems = findBreadcrumbPath(currentRoute, MenuItemLists);
    }

    // If still no items, generate from route path
    if (breadcrumbItems.length === 0) {
        breadcrumbItems = generateBreadcrumbsFromPath(currentRoute);
    }

    // Get the menu text for each breadcrumb item
    const breadcrumbItemsWithText = breadcrumbItems.map(item => ({
        ...item,
        menu: getMenuText(item.menu)
    }));

    if (breadcrumbItemsWithText.length === 0) {
        return (
            <StyledBreadcrumbs
                aria-label="breadcrumb"
                separator={<NavigateNextRoundedIcon fontSize="small" />}
            >
                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Dashboard
                </Typography>
            </StyledBreadcrumbs>
        );
    }

    return (
        <StyledBreadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextRoundedIcon fontSize="small" />}
        >
            {/* Always show Home as first breadcrumb */}
            {/* {breadcrumbItemsWithText[0]?.route !== '/' && (
                <Link
                    to="/dashboard"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Home
                    </Typography>
                </Link>
            )} */}

            {breadcrumbItemsWithText.map((item, index) => (
                <div key={item.route || index}>
                    {index === breadcrumbItemsWithText.length - 1 ? (
                        // Last item - current page (not clickable)
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.primary',
                                fontWeight: 600
                            }}
                        >
                            {item.menu}
                        </Typography>
                    ) : (
                        // Clickable breadcrumb item
                        <Link
                            to={item.route}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 'normal',
                                    '&:hover': {
                                        color: 'primary.main',
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                {item.menu}
                            </Typography>
                        </Link>
                    )}
                </div>
            ))}
        </StyledBreadcrumbs>
    );
}