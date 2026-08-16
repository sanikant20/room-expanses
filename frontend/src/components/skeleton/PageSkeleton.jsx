import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack, alpha, useTheme } from '@mui/material';

const PageSkeleton = ({
    showHeader = true,
    showStatCards = true,
    showCharts = true,
    showTable = true,
    message = null,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {message && (
                <Skeleton width={240} height={20} sx={{ mb: 2 }} />
            )}

            {showHeader && (
                <Card
                    sx={{
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        mb: 2.5,
                        boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                >
                    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                        <Grid
                            container
                            rowSpacing={2}
                            sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between' }}
                        >
                            <Grid size={{ xs: 12, sm: 'auto' }}>
                                <Stack spacing={1.2}>
                                    <Skeleton width={140} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    <Skeleton width={340} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    <Skeleton width={480} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 'auto' }}>
                                <Skeleton variant="rounded" width={170} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {showStatCards && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                                <CardContent sx={{ p: 2.25 }}>
                                    <Skeleton width="55%" height={16} sx={{ mb: 1 }} />
                                    <Skeleton width="75%" height={32} sx={{ mb: 1 }} />
                                    <Skeleton width="40%" height={12} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {showCharts && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[0, 1].map((i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <Skeleton variant="circular" width={22} height={22} />
                                        <Skeleton width={200} height={22} />
                                    </Stack>
                                    <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {showTable && (
                <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <Skeleton variant="circular" width={22} height={22} />
                            <Skeleton width={240} height={22} />
                        </Stack>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} height={38} sx={{ mb: 0.75, borderRadius: 1 }} />
                        ))}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PageSkeleton;
