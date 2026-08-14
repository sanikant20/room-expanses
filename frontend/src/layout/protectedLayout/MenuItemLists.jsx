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
        menu: 'Dashboard',
        translationKey: 'menu.dashboard',
        icon: <DashboardRounded />,
        route: '/dashboard',
    },
    {
        menu: 'Expenses',
        translationKey: 'menu.expenses',
        icon: <ReceiptLongRounded />,
        route: '/expenses',
    },
    {
        menu: 'Partners',
        translationKey: 'menu.partners',
        icon: <GroupsRounded />,
        route: '/partners',
    },
    {
        menu: 'Reports',
        translationKey: 'menu.reports',
        icon: <AssessmentRounded />,
        route: '/reports',
    },
    {
        menu: 'Settlement',
        translationKey: 'menu.settlement',
        icon: <BalanceRounded />,
        route: '/settlement',
    },
];

export const secondaryListItems = [
    {
        menu: 'Settings',
        translationKey: 'menu.settings',
        icon: <SettingsRounded />,
        route: '/settings'
    },
];
