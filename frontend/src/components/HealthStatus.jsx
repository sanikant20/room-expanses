import React from 'react';
import { Box, Chip, CircularProgress, Tooltip, alpha, keyframes, useTheme } from '@mui/material';
import { useGetHealthStatus } from '../apis/healthApi/HealthAPI';

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
    70% { box-shadow: 0 0 0 6px transparent; opacity: 0.85; }
    100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
`;

const Dot = ({ color }) => (
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, color }} />
);

/**
 * Server health indicator for the public layout.
 * `compact` renders a dot-only chip (for tight mobile headers).
 */
const HealthStatus = ({ compact = false }) => {
    const theme = useTheme();
    const { data, isPending, isError } = useGetHealthStatus();

    if (isPending) {
        return (
            <Tooltip title="Checking server…" arrow>
                <Chip
                    icon={<CircularProgress size={12} sx={{ color: 'text.secondary' }} />}
                    label={compact ? undefined : 'Checking…'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, '& .MuiChip-icon': { ml: '4px' } }}
                />
            </Tooltip>
        );
    }

    if (isError || data?.status !== 'ok') {
        return (
            <Tooltip title="Server unreachable — retrying automatically…" arrow>
                <Chip
                    icon={<Dot color={theme.palette.error.main} />}
                    label={compact ? undefined : 'Offline'}
                    size="small"
                    variant="outlined"
                    aria-label="Server unreachable"
                    sx={{
                        minWidth: compact ? 28 : undefined,
                        fontWeight: 600,
                        color: 'error.main',
                        borderColor: alpha(theme.palette.error.main, 0.5),
                        '& .MuiChip-icon': { ml: '4px' },
                    }}
                />
            </Tooltip>
        );
    }

    return (
        <Tooltip title={`Server & database connected — uptime ${Math.floor((data?.uptime || 0) / 60)} min`} arrow>
            <Chip
                icon={
                    <Box sx={{ display: 'flex', animation: `${pulse} 2s ease-out infinite` }}>
                        <Dot color={theme.palette.success.main} />
                    </Box>
                }
                label={compact ? undefined : 'Connected'}
                size="small"
                variant="outlined"
                aria-label="Server connected"
                sx={{
                    minWidth: compact ? 28 : undefined,
                    fontWeight: 600,
                    color: 'success.main',
                    borderColor: alpha(theme.palette.success.main, 0.5),
                    '& .MuiChip-icon': { ml: '4px' },
                }}
            />
        </Tooltip>
    );
};

export default HealthStatus;
