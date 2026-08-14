import { Route } from 'react-router-dom';

export const RenderRoutes = (routes) => {
    return routes.map((route, index) => {
        // Handle index routes
        if (route.index) {
            return (
                <Route
                    key={route.path || `index-${index}`}
                    index
                    element={route.element}
                />
            );
        }

        // Handle regular routes
        return (
            <Route
                key={route.path || index}
                path={route.path}
                element={route.element}
            >
                {route.children && RenderRoutes(route.children)}
            </Route>
        );
    });
};