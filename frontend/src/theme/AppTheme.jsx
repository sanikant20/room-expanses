import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { getDesignTokens } from './themePrimitives';
import { datePickersCustomizations } from './customizations/datePicker';
import { useThemeMode } from '../context/useThemeMode';

export default function AppTheme(props) {
    const { children, disableCustomTheme, themeComponents } = props;
    const [themeVersion, setThemeVersion] = React.useState(0);
    const { mode } = useThemeMode();

    React.useEffect(() => {
        const handleThemeChange = () => {
            setThemeVersion(prev => prev + 1);
        };

        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, []);

    React.useEffect(() => {
        document.documentElement.setAttribute('data-mui-color-scheme', mode);
    }, [mode]);

    const theme = React.useMemo(() => {
        void themeVersion;
        return disableCustomTheme
            ? {}
            : createTheme({
                cssVariables: {
                    colorSchemeSelector: 'data-mui-color-scheme',
                    cssVarPrefix: 'template',
                },
                ...getDesignTokens(mode),
                components: {
                    ...inputsCustomizations,
                    ...dataDisplayCustomizations,
                    ...feedbackCustomizations,
                    ...navigationCustomizations,
                    ...surfacesCustomizations,
                    ...themeComponents,
                    ...datePickersCustomizations,
                },
            });
    }, [disableCustomTheme, themeComponents, themeVersion, mode]);

    if (disableCustomTheme) {
        return <>{children}</>;
    }

    return (
        <ThemeProvider theme={theme} disableTransitionOnChange>
            {children}
        </ThemeProvider>
    );
}
