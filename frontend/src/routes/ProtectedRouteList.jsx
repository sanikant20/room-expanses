import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/protected/dashboard/Dashboard'));
const Expenses = lazy(() => import('../pages/protected/expenses/ExpansesTab'));
const Partners = lazy(() => import('../pages/protected/partners/PartnerTab'));
const Reports = lazy(() => import('../pages/protected/reports/ReportTabs'));
const Settlement = lazy(() => import('../pages/protected/settlement/Settlement'));
const ChangePassword = lazy(() => import('../pages/protected/setting/ChangePassword'));
const SettingTab = lazy(() => import('../pages/protected/setting/SettingTab'));
const Profile = lazy(() => import('../pages/protected/setting/Profile'));
const ThemeColorSelection = lazy(() => import('../theme/ThemeColorSelection'));

export const ProtectedRouteList = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'expenses', element: <Expenses /> },
  { path: 'partners', element: <Partners /> },
  { path: 'reports', element: <Reports /> },
  { path: 'settlement', element: <Settlement /> },
  { path: 'profile', element: <Profile /> },
  { path: 'theme', element: <ThemeColorSelection /> },
  { path: 'settings', element: <SettingTab /> },
  { path: 'change-password', element: <ChangePassword /> },
];
