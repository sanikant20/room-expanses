import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack, useTheme } from '@mui/material';

const FieldSkeleton = ({ labelWidth = 110, inputWidth = 260, labelRight = false }) => (
    <Stack spacing={0.75}>
        <Skeleton width={labelWidth} height={14} sx={{ alignSelf: labelRight ? 'flex-end' : 'flex-start' }} />
        <Skeleton
            variant="rounded"
            width={inputWidth}
            height={40}
            sx={{ borderRadius: 1.5, alignSelf: labelRight ? 'flex-end' : 'flex-start' }}
        />
    </Stack>
);

const FormPageSkeleton = ({
    variant = 'form',
    showTabs = false,
    maxWidth = 500,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {showTabs && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: theme.palette.background.default,
                        borderBottom: 1,
                        borderColor: 'divider',
                        py: 0.75,
                        mb: 1,
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rounded"
                            width={i === 0 ? 140 : 120}
                            height={30}
                            sx={{ borderRadius: 1.5 }}
                        />
                    ))}
                </Stack>
            )}

            {variant === 'profile' ? (
                <Box sx={{ width: '100%', maxWidth: 'lg', mx: 'auto' }}>
                    <Card
                        sx={{
                            mb: 2.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                                <Skeleton variant="circular" width={120} height={120} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                <Stack sx={{ flex: 1, alignItems: { xs: 'center', md: 'flex-start' }, spacing: 1.2 }}>
                                    <Skeleton width={220} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    <Stack direction="row" spacing={1}>
                                        <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.25)' }} />
                                        <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    </Stack>
                                </Stack>
                                <Stack spacing={0.75} sx={{ alignItems: 'flex-end' }}>
                                    <Skeleton width={160} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                    <Skeleton width={160} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.25)' }} />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Grid container spacing={2.5}>
                        {[0, 1].map((col) => (
                            <Grid size={{ xs: 12, md: 6 }} key={col}>
                                <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            <Skeleton variant="circular" width={22} height={22} />
                                            <Skeleton width={180} height={22} />
                                        </Stack>
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <Stack key={i} direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'flex-start' }}>
                                                <Skeleton variant="circular" width={18} height={18} sx={{ mt: 0.3 }} />
                                                <Skeleton width={120} height={16} />
                                                <Skeleton width="40%" height={16} />
                                            </Stack>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : (
                <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, maxWidth, mx: 'auto' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1.5 }} />
                            <Skeleton width={200} height={24} />
                        </Stack>
                        <Stack spacing={2.5}>
                            {[0, 1, 2].map((i) => (
                                <FieldSkeleton key={i} labelWidth={130} inputWidth="100%" />
                            ))}
                        </Stack>
                        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 1.5 }} />
                            <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 1.5 }} />
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default FormPageSkeleton;
