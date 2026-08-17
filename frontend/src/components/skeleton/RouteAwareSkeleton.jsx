import React from 'react';
import { useLocation } from 'react-router-dom';
import PageSkeleton from './PageSkeleton';
import TablePageSkeleton from './TablePageSkeleton';
import FormPageSkeleton from './FormPageSkeleton';
import LoginSkeleton from './LoginSkeleton';

const tabPages = [
    { path: '/expenses', tabBar: true, icon: true, toolbar: true },
    { path: '/partners', tabBar: true, icon: true, toolbar: true },
    { path: '/reports', tabBar: true, icon: true, toolbar: true },
    { path: '/settlement', tabBar: true, icon: true, toolbar: true },
];

const RouteAwareSkeleton = () => {
    const { pathname } = useLocation();

    const path = `/${pathname.split('/')[1] || ''}`;

    if (path === '/login') {
        return <LoginSkeleton />;
    }

    if (path === '/dashboard') {
        return <PageSkeleton showHeader showStatCards showCharts showTable />;
    }

    if (path === '/expenses' || path === '/partners' || path === '/reports' || path === '/settlement') {
        const cfg = tabPages.find((p) => p.path === path) || tabPages[0];
        return <TablePageSkeleton showHeader={cfg.icon} showTabBar={cfg.tabBar} toolbar={cfg.toolbar} rows={7} columns={5} />;
    }

    if (path === '/profile') {
        return <FormPageSkeleton variant="profile" />;
    }

    if (path === '/settings' || path === '/change-password') {
        return <FormPageSkeleton variant="form" showTabs={path === '/settings'} maxWidth={560} />;
    }

    if (path === '/theme') {
        return <FormPageSkeleton variant="form" maxWidth={620} />;
    }

    if (path === '/logout') {
        return <FormPageSkeleton variant="form" maxWidth={380} />;
    }

    return <PageSkeleton showHeader showStatCards showCharts showTable />;
};

export default RouteAwareSkeleton;
