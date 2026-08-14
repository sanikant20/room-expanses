import { createTheme, alpha } from '@mui/material/styles';
import { brandColors, defaultSecondaryColor, defaultSuccessColor, defaultErrorColor, defaultWarningColor, defaultPendingColor, defaultInfoColor } from './ThemeColors';

const defaultTheme = createTheme();
const customShadows = [...defaultTheme.shadows];

// Function to get current brand color based on selected theme in localStorage
export const getCurrentBrand = () => {
    if (typeof window !== 'undefined') {
        const selectedTheme = localStorage.getItem('selectedTheme');
        // If no theme is found, set and return default
        if (!selectedTheme) {
            localStorage.setItem('selectedTheme', 'default');
            return brandColors.default;
        }
        return brandColors[selectedTheme] || brandColors.default;
    }
    return brandColors.default;
};

// Export current brand for reference
export const brand = getCurrentBrand();

export const gray = {
    50: 'hsl(220, 35%, 97%)',
    100: 'hsl(220, 30%, 94%)',
    200: 'hsl(220, 20%, 88%)',
    300: 'hsl(220, 20%, 80%)',
    400: 'hsl(220, 20%, 65%)',
    500: 'hsl(220, 20%, 42%)',
    600: 'hsl(220, 20%, 35%)',
    700: 'hsl(220, 20%, 25%)',
    800: 'hsl(220, 30%, 6%)',
    900: 'hsl(220, 35%, 3%)',
};

export const getDesignTokens = (mode = 'light') => {
    const currentBrand = getCurrentBrand();
    const isDark = mode === 'dark';

    customShadows[1] = isDark
        ? 'hsla(220, 50%, 3%, 0.3) 0px 4px 16px 0px, hsla(220, 40%, 5%, 0.2) 0px 8px 16px -5px'
        : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

    return {
        palette: {
            mode,
            primary: {
                light: currentBrand[200],
                main: currentBrand[500],
                dark: currentBrand[700],
                contrastText: '#FFFFFF',
            },
            secondary: {
                light: defaultSecondaryColor[200],
                main: defaultSecondaryColor[500],
                dark: defaultSecondaryColor[700],
                contrastText: '#FFFFFF',
            },
            warning: {
                light: defaultWarningColor[200],
                main: defaultWarningColor[500],
                dark: defaultWarningColor[700],
                contrastText: '#000000',
            },
            error: {
                light: defaultErrorColor[200],
                main: defaultErrorColor[500],
                dark: defaultErrorColor[700],
                contrastText: '#FFFFFF',
            },
            success: {
                light: defaultSuccessColor[200],
                main: defaultSuccessColor[500],
                dark: defaultSuccessColor[700],
                contrastText: '#FFFFFF',
            },
            info: {
                light: defaultInfoColor[200],
                main: defaultInfoColor[500],
                dark: defaultInfoColor[700],
                contrastText: '#FFFFFF',
            },
            pending: {
                light: defaultPendingColor[200],
                main: defaultPendingColor[500],
                dark: defaultPendingColor[700],
                contrastText: '#000000',
            },
            grey: { ...gray },
            divider: isDark ? alpha(gray[400], 0.2) : alpha(gray[300], 0.4),
            background: {
                default: isDark ? 'hsl(220, 30%, 10%)' : 'hsl(0, 0%, 99%)',
                paper: isDark ? 'hsl(220, 25%, 14%)' : 'hsl(220, 35%, 97%)',
            },
            text: {
                primary: isDark ? gray[100] : gray[800],
                secondary: isDark ? gray[400] : gray[600],
                warning: defaultWarningColor[500],
            },
            action: {
                hover: isDark ? alpha(gray[600], 0.15) : alpha(gray[200], 0.2),
                selected: isDark ? alpha(gray[600], 0.25) : alpha(gray[200], 0.3),
            },
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            h1: {
                fontSize: defaultTheme.typography.pxToRem(48),
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: -0.5,
            },
            h2: {
                fontSize: defaultTheme.typography.pxToRem(36),
                fontWeight: 600,
                lineHeight: 1.2,
            },
            h3: {
                fontSize: defaultTheme.typography.pxToRem(30),
                lineHeight: 1.2,
            },
            h4: {
                fontSize: defaultTheme.typography.pxToRem(24),
                fontWeight: 600,
                lineHeight: 1.5,
            },
            h5: {
                fontSize: defaultTheme.typography.pxToRem(20),
                fontWeight: 600,
            },
            h6: {
                fontSize: defaultTheme.typography.pxToRem(18),
                fontWeight: 600,
            },
            subtitle1: {
                fontSize: defaultTheme.typography.pxToRem(18),
            },
            subtitle2: {
                fontSize: defaultTheme.typography.pxToRem(14),
                fontWeight: 500,
            },
            body1: {
                fontSize: defaultTheme.typography.pxToRem(14),
            },
            body2: {
                fontSize: defaultTheme.typography.pxToRem(14),
                fontWeight: 400,
            },
            caption: {
                fontSize: defaultTheme.typography.pxToRem(12),
                fontWeight: 400,
            },
        },
        shape: {
            borderRadius: 4,
        },
        shadows: customShadows,
    };
};

export const typography = {
    fontFamily: 'Inter, sans-serif',
    h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
    },
    h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        lineHeight: 1.2,
    },
    h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.5,
    },
    h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
    },
    h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
    },
    subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(18),
    },
    subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
    },
    body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
    },
    body2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 400,
    },
    caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 400,
    },
};

export const shape = {
    borderRadius: 4,
};

export const formRadius = shape.borderRadius;

export const shadows = [
    'none',
    'var(--template-palette-baseShadow)',
    ...defaultTheme.shadows.slice(2),
];