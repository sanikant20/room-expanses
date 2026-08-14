import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Button,
    Paper,
    Divider,
    Chip,
    Stack,
    Alert,
    Fade,
    Switch,
    FormControlLabel,
    useTheme,
} from "@mui/material";
import { brandColors } from "./ThemeColors";
import CustomCard from "../components/custom/CustomCard";
import { CheckCircleRounded, DarkModeRounded, LightModeRounded, RestartAltRounded } from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeModeContext";

// Create a utility function for text formatting
const formatNameCase = (text) => {
    if (!text) return '';

    // Handle multiple cases:
    // 1. PascalCase -> "Pascal Case"
    // 2. camelCase -> "Camel Case"
    // 3. snake_case -> "Snake Case"
    // 4. kebab-case -> "Kebab Case"
    // 5. Already spaced text -> keep as is
    return text
        // Insert space before capital letters
        .replace(/([A-Z])/g, ' $1')
        // Handle snake_case and kebab-case
        .replace(/[_-]/g, ' ')
        // Capitalize first letter of each word
        .replace(/^\w|\s\w/g, (char) => char.toUpperCase())
        // Trim any extra spaces
        .trim();
};


// Helper function to get current theme from localStorage
export const getCurrentTheme = () => {
    if (typeof window !== "undefined") {
        const theme = localStorage.getItem("selectedTheme");
        if (!theme) {
            localStorage.setItem("selectedTheme", "default");
            return "default";
        }
        return theme;
    }
    return "default";
};

// Helper function to set theme in localStorage
export const setTheme = (themeName) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("selectedTheme", themeName);
    }
};

// Get current theme colors
export const getCurrentThemeColors = () => {
    const themeName = getCurrentTheme();
    return brandColors[themeName] || brandColors.default;
};

const ThemeColorSelection = () => {
    const [selectedTheme, setSelectedTheme] = useState("default");
    const [, setShowSuccess] = useState(false);
    const { mode, toggleThemeMode } = useThemeMode();
    const theme = useTheme();

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = getCurrentTheme();
        setSelectedTheme(savedTheme);
    }, []);

    const handleThemeChange = (themeName) => {
        setSelectedTheme(themeName);
        setTheme(themeName);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        window.dispatchEvent(new Event("themeChanged"));
        window.location.reload();
    };

    const handleReset = () => {
        handleThemeChange("default");
    };

    const currentColors = brandColors[selectedTheme] || brandColors.default;

    return (
        <>
            <CustomCard
                icon={mode === 'dark' ? <DarkModeRounded fontSize="small" /> : <LightModeRounded fontSize="small" />}
                title="Appearance Mode"
            >
                <Stack spacing={3}>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper'
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mode === 'dark'}
                                    onChange={toggleThemeMode}
                                    color="primary"
                                />
                            }
                            label={
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Dark Mode
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {mode === 'dark'
                                            ? 'Dark mode is active — reduces eye strain in low light'
                                            : 'Switch to dark mode for a darker interface'
                                        }
                                    </Typography>
                                </Stack>
                            }
                            sx={{ m: 0, alignItems: 'flex-start' }}
                        />
                    </Box>

                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Preview
                        </Typography>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    Mode:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {mode === 'dark' ? 'Dark' : 'Light'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    Background:
                                </Typography>
                                <Box sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {mode === 'dark' ? 'hsl(220,30%,10%)' : 'hsl(0,0%,99%)'}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </CustomCard>

            <CustomCard
                title="Current Theme Preview"
                subtitle={
                    <>
                        Active:{" "} {formatNameCase(selectedTheme)}
                    </>
                }
                extra={
                    <Chip
                        label="Active"
                        color="success"
                        size="small"
                        icon={<CheckCircleRounded fontSize="small" />}
                        sx={{ height: 24 }}
                    />
                }
            >

                <Typography variant="caption" gutterBottom sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                    Palette Preview
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    {Object.entries(currentColors).map(([key, color]) => (
                        <Box
                            key={key}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 0.25,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: color,
                                    border: key === "500" ? `2px solid ${currentColors[700]}` : "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 0.5,
                                }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                                {key}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.6rem",
                                    fontFamily: "monospace",
                                }}
                            >
                                {color.length > 7 ? `${color.slice(0, 7)}...` : color}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CustomCard>

            <CustomCard title="Available Themes"
                extra={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<RestartAltRounded fontSize="small" />}
                        onClick={handleReset}
                    >
                        Reset to Default
                    </Button>
                }
            >
                <Grid container spacing={2}>
                    {Object.entries(brandColors).map(([name, colors]) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={name}>
                            <Card
                                sx={{
                                    border: selectedTheme === name ? 2 : 0,
                                    borderColor: "primary.main",
                                    transition: "transform 0.15s",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: 2,
                                    },
                                    height: "100%",
                                }}
                            >
                                <CardActionArea onClick={() => handleThemeChange(name)} sx={{ p: 0 }}>
                                    <Box
                                        sx={{
                                            height: 80,
                                            backgroundColor: colors[500],
                                            position: "relative",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: "40%",
                                                background: `linear-gradient(to top, ${colors[700]}, transparent)`,
                                            }}
                                        />
                                        {selectedTheme === name && (
                                            <CheckCircleRounded
                                                sx={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                    color: "white",
                                                    backgroundColor: "rgba(0,0,0,0.3)",
                                                    borderRadius: "50%",
                                                    p: 0.25,
                                                    fontSize: "1rem",
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={1}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ textTransform: "capitalize", fontWeight: 500 }}
                                            >
                                                {formatNameCase(name)}
                                            </Typography>
                                            {selectedTheme === name && (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                        </Stack>

                                        {/* Color preview bars */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                height: 16,
                                                borderRadius: 0.5,
                                                overflow: "hidden",
                                                mb: 1,
                                            }}
                                        >
                                            <Box sx={{ flex: 1, backgroundColor: colors[50] }} />
                                            <Box sx={{ flex: 1, backgroundColor: colors[200] }} />
                                            <Box sx={{ flex: 1, backgroundColor: colors[500] }} />
                                            <Box sx={{ flex: 1, backgroundColor: colors[700] }} />
                                            <Box sx={{ flex: 1, backgroundColor: colors[900] }} />
                                        </Box>

                                        {/* Color details */}
                                        <Grid container spacing={0.5}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "text.secondary", fontSize: '0.65rem' }}
                                                >
                                                    Light
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        fontFamily: "monospace",
                                                        color: colors[700],
                                                        fontSize: '0.6rem',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {colors[50].slice(1, 7)}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "text.secondary", fontSize: '0.65rem' }}
                                                >
                                                    Primary
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        fontFamily: "monospace",
                                                        color: colors[700],
                                                        fontSize: '0.6rem',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {colors[500].slice(1, 7)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CustomCard>
        </ >
    );
};

export default ThemeColorSelection;