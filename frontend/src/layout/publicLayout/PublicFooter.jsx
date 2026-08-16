import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, Stack, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const PublicFooter = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: isDark ? 'grey.900' : 'primary.main',
                color: isDark ? 'text.primary' : 'primary.contrastText',
                py: 6,
                mt: 'auto'
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            The Roomies
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                            Track shared expenses, settle balances, and stay organized in Nepali months.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                component="a"
                                href="https://facebook.com"
                                target="_blank"
                                sx={{
                                    color: 'inherit',
                                    opacity: 0.7,
                                    '&:hover': { color: '#1877f2', opacity: 1 }
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://twitter.com"
                                target="_blank"
                                sx={{
                                    color: 'inherit',
                                    opacity: 0.7,
                                    '&:hover': { color: '#1da1f2', opacity: 1 }
                                }}
                            >
                                <TwitterIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://linkedin.com"
                                target="_blank"
                                sx={{
                                    color: 'inherit',
                                    opacity: 0.7,
                                    '&:hover': { color: '#0077b5', opacity: 1 }
                                }}
                            >
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://instagram.com"
                                target="_blank"
                                sx={{
                                    color: 'inherit',
                                    opacity: 0.7,
                                    '&:hover': { color: '#e4405f', opacity: 1 }
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            <Link
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Home
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/about"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                About Us
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/services"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Services
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/contact"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Contact
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Resources */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Resources
                        </Typography>
                        <Stack spacing={1}>
                            <Link
                                component={RouterLink}
                                to="/blog"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Blog
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/faq"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                FAQ
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/support"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Support
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/privacy"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Privacy Policy
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Contact Us
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            📍 Kathmandu, Nepal
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            📞 +977 1 4000000
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            ✉️ support@theroomies.app
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: isDark ? 'divider' : 'rgba(255,255,255,0.15)' }} />

                {/* Copyright */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color={isDark ? 'text.secondary' : 'primary.contrastText'}>
                        © {new Date().getFullYear()} <span
                            onClick={() => window.open('https://easysoftware.com.np/', '_blank')}
                            style={{ color: isDark ? theme.palette.primary.main : 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                            The Roomies
                        </span> All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicFooter;
