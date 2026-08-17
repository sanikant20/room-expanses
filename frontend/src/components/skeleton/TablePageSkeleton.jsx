import React from 'react';
import { Box, Card, CardContent, Divider, Skeleton, Stack, alpha, useTheme } from '@mui/material';

const TablePageSkeleton = ({
    showHeader = true,
    showTabBar = false,
    headerWidth = 200,
    toolbar = true,
    rows = 6,
    columns = 5,
    showFooter = true,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {showTabBar && (
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
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rounded"
                            width={i === 0 ? 150 : 110}
                            height={30}
                            sx={{
                                borderRadius: 1.5,
                                backgroundColor: i === 0
                                    ? alpha(theme.palette.primary.main, 0.25)
                                    : alpha(theme.palette.action.hover, 0.6),
                            }}
                        />
                    ))}
                </Stack>
            )}

            {showHeader && (
                <Card
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        mb: 1,
                        overflow: 'hidden',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1 }}
                    >
                        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
                        <Stack sx={{ flex: 1, minWidth: 180 }}>
                            <Skeleton width={headerWidth} height={20} />
                            <Skeleton width="45%" height={14} />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                            <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: 1.5 }} />
                            <Skeleton variant="rounded" width={90} height={32} sx={{ borderRadius: 1.5 }} />
                        </Stack>
                    </Stack>
                </Card>
            )}

            <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 2 }}>
                    {toolbar && (
                        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Skeleton variant="rounded" width={240} height={36} sx={{ borderRadius: 1.5 }} />
                            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1.5 }} />
                            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 1.5 }} />
                            <Box sx={{ flex: 1 }} />
                            <Skeleton variant="rounded" width={150} height={36} sx={{ borderRadius: 1.5 }} />
                        </Stack>
                    )}

                    <Box sx={{ overflow: 'hidden' }}>
                        <Stack direction="row" spacing={0.5} sx={{ px: 1, py: 0.75, borderBottom: `1px solid ${theme.palette.divider}`, mb: 0.5 }}>
                            {Array.from({ length: columns }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="text"
                                    width={i === 0 ? 40 : 70}
                                    height={18}
                                    sx={{ flex: 1 }}
                                />
                            ))}
                        </Stack>
                        {Array.from({ length: rows }).map((_, r) => (
                            <Stack key={r} direction="row" spacing={0.5} sx={{ px: 1, py: 0.65 }}>
                                {Array.from({ length: columns }).map((_, c) => (
                                    <Skeleton
                                        key={c}
                                        variant="text"
                                        height={16}
                                        width={c === 0 ? 40 : 80}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: r % 2 === 0
                                                ? alpha(theme.palette.action.hover, 0.5)
                                                : undefined,
                                        }}
                                    />
                                ))}
                            </Stack>
                        ))}
                    </Box>

                    {showFooter && (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
                                <Skeleton width={180} height={18} />
                                <Box sx={{ flex: 1 }} />
                                <Skeleton variant="rounded" width={90} height={30} sx={{ borderRadius: 1.5 }} />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default TablePageSkeleton;
