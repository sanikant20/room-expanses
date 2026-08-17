import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, Stack, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const SocialLinks = [
    { icon: <FacebookIcon />, label: 'Facebook', hoverColor: '#1877f2' },
    { icon: <TwitterIcon />, label: 'Twitter', hoverColor: '#1da1f2' },
    { icon: <LinkedInIcon />, label: 'LinkedIn', hoverColor: '#0077b5' },
    { icon: <InstagramIcon />, label: 'Instagram', hoverColor: '#e4405f' },
];

const QuickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Login', to: '/login' },
    { label: 'Dashboard', to: '/dashboard' },
];

const ProductLinks = [
    { label: 'Expenses', to: '/expenses' },
    { label: 'Partners', to: '/partners' },
    { label: 'Reports', to: '/reports' },
    { label: 'Settlement', to: '/settlement' },
];

const ContactInfo = [
    { icon: <LocationOnOutlinedIcon fontSize="small" />, label: 'Kathmandu, Nepal' },
    { icon: <PhoneOutlinedIcon fontSize="small" />, label: '+977 1 4000000 (placeholder)' },
    { icon: <EmailOutlinedIcon fontSize="small" />, label: 'support@theroomies.app (placeholder)' },
];

const PublicFooter = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderTop: `1px solid ${theme.palette.divider}`,
                py: 6,
                mt: 'auto'
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                            The Roomies
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            Track shared expenses, settle balances, and stay organized in Nepali months.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {SocialLinks.map(({ icon, label, hoverColor }) => (
                                <IconButton
                                    key={label}
                                    component="a"
                                    href="https://facebook.com"
                                    target="_blank"
                                    aria-label={label}
                                    sx={{
                                        color: 'text.secondary',
                                        '&:hover': { color: hoverColor }
                                    }}
                                >
                                    {icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            {QuickLinks.map(({ label, to }) => (
                                <Link
                                    key={label}
                                    component={RouterLink}
                                    to={to}
                                    color="text.secondary"
                                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                                >
                                    {label}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Product */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                            Product
                        </Typography>
                        <Stack spacing={1}>
                            {ProductLinks.map(({ label, to }) => (
                                <Link
                                    key={label}
                                    component={RouterLink}
                                    to={to}
                                    color="text.secondary"
                                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                                >
                                    {label}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.primary">
                            Contact Us
                        </Typography>
                        <Stack spacing={1.25}>
                            {ContactInfo.map(({ icon, label }) => (
                                <Stack key={label} direction="row" spacing={0.75} alignItems="flex-start">
                                    <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {label}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Copyright */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} <span
                            onClick={() => window.open('https://easysoftware.com.np/', '_blank')}
                            style={{ color: theme.palette.primary.main, fontWeight: 600, cursor: 'pointer' }}>
                            The Roomies
                        </span> All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicFooter;
