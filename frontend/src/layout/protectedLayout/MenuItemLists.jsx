import {
    DashboardRounded,
    SettingsRounded,
    ReceiptLongRounded,
    GroupsRounded,
    AssessmentRounded,
    BalanceRounded,
} from "@mui/icons-material";

export const MenuItemLists = [
    {
        section: 'Overview',
        menu: 'Dashboard',
        translationKey: 'menu.dashboard',
        icon: <DashboardRounded />,
        route: '/dashboard',
    },
    {
        section: 'Management',
        menu: 'Expenses',
        translationKey: 'menu.expenses',
        icon: <ReceiptLongRounded />,
        route: '/expenses',
    },
    {
        section: 'Management',
        menu: 'Partners',
        translationKey: 'menu.partners',
        icon: <GroupsRounded />,
        route: '/partners',
        adminOnly: true,
    },
    {
        section: 'Insights',
        menu: 'Reports',
        translationKey: 'menu.reports',
        icon: <AssessmentRounded />,
        route: '/reports',
    },
    {
        section: 'Insights',
        menu: 'Settlement',
        translationKey: 'menu.settlement',
        icon: <BalanceRounded />,
        route: '/settlement',
    },
];

export const secondaryListItems = [
    {
        section: 'System',
        menu: 'Settings',
        translationKey: 'menu.settings',
        icon: <SettingsRounded />,
        route: '/settings'
    },
];
