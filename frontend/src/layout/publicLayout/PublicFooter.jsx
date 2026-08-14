import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, Stack, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const PublicFooter = () => {
    const theme = useTheme();
    const { t } = useTranslation();
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
                            {t('footer.companyName')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                            {t('footer.companyAddress')}
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
                            {t('footer.quickLinks')}
                        </Typography>
                        <Stack spacing={1}>
                            <Link
                                component={RouterLink}
                                to="/"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.home')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/about"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.aboutUs')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/services"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.services')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/contact"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.contact')}
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Resources */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            {t('footer.resources')}
                        </Typography>
                        <Stack spacing={1}>
                            <Link
                                component={RouterLink}
                                to="/blog"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.blog')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/faq"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.faq')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/support"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.support')}
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/privacy"
                                color="inherit"
                                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                {t('footer.privacyPolicy')}
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            {t('footer.contactUs')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            📍 {t('footer.companyAddress')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            📞 {t('footer.companyPhone')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                            ✉️ {t('footer.companyEmail')}
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
                            {t('footer.companyName')}
                        </span> {t('footer.allRightsReserved')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicFooter;
