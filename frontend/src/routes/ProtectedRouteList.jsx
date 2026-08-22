import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/protected/dashboard/Dashboard'));
const Notifications = lazy(() => import('../pages/protected/notifications/NotificationsPage'));
const Expenses = lazy(() => import('../pages/protected/expenses/ExpansesTab'));
const Partners = lazy(() => import('../pages/protected/partners/PartnerTab'));
const Reports = lazy(() => import('../pages/protected/reports/ReportTabs'));
const Settlement = lazy(() => import('../pages/protected/settlement/SettlementTabs'));
const Turn = lazy(() => import('../pages/protected/turn/TurnTabs'));
const ChangePassword = lazy(() => import('../pages/protected/setting/ChangePassword'));
const SettingTab = lazy(() => import('../pages/protected/setting/SettingTab'));
const Profile = lazy(() => import('../pages/protected/setting/Profile'));
const ThemeColorSelection = lazy(() => import('../theme/ThemeColorSelection'));

export const ProtectedRouteList = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'notifications', element: <Notifications /> },
  { path: 'expenses', element: <Expenses /> },
  { path: 'partners', element: <Partners /> },
  { path: 'reports', element: <Reports /> },
  { path: 'settlement', element: <Settlement /> },
  { path: 'turn', element: <Turn /> },
  { path: 'turn/water', element: <Turn /> },
  { path: 'profile', element: <Profile /> },
  { path: 'theme', element: <ThemeColorSelection /> },
  { path: 'settings', element: <SettingTab /> },
  { path: 'change-password', element: <ChangePassword /> },
];
