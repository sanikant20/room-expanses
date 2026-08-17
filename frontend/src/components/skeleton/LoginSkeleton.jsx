import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack, alpha, useTheme } from '@mui/material';

const LoginSkeleton = () => {
    const theme = useTheme();

    return (
        <Grid container sx={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
            {/* Left Side - Branding & Features */}
            <Grid
                size={{ xs: 'none', md: 6 }}
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    p: 4,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ zIndex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ justifyContent: 'center', mb: 4 }}>
                        <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.25)' }} />
                        <Skeleton width={180} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                    </Stack>

                    <Stack spacing={2.5} sx={{ maxWidth: 520, mx: 'auto' }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.25)' }} />
                            <Stack spacing={0.75} sx={{ flex: 1 }}>
                                <Skeleton width="40%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                <Skeleton width="80%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                            </Stack>
                        </Stack>
                        {[1, 2, 3].map((i) => (
                            <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.25)' }} />
                                <Stack spacing={0.75} sx={{ flex: 1 }}>
                                    <Skeleton width="35%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    <Skeleton width="70%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 3, md: 6 },
                        bgcolor: 'background.paper',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        position: 'relative',
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 450 }}>
                        <Stack sx={{ textAlign: 'center', alignItems: 'center', mb: 3, spacing: 1 }}>
                            <Skeleton width={260} height={32} />
                            <Skeleton width={220} height={18} />
                        </Stack>

                        <Card
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                            }}
                        >
                            <Stack spacing={1} direction="row" sx={{ mb: 3 }}>
                                <Skeleton variant="rounded" width="50%" height={38} sx={{ borderRadius: 1.5 }} />
                                <Skeleton variant="rounded" width="50%" height={38} sx={{ borderRadius: 1.5 }} />
                            </Stack>
                            <Stack spacing={2.5}>
                                <Stack spacing={0.75}>
                                    <Skeleton width={60} height={14} />
                                    <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 1.5 }} />
                                </Stack>
                                <Stack spacing={0.75}>
                                    <Skeleton width={80} height={14} />
                                    <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 1.5 }} />
                                </Stack>
                            </Stack>
                            <Skeleton variant="rounded" width="100%" height={46} sx={{ borderRadius: 1.5, mt: 3 }} />
                            <Skeleton width="45%" height={14} sx={{ mx: 'auto', mt: 3 }} />
                        </Card>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default LoginSkeleton;
