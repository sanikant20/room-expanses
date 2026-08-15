import React, { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { EventAvailableRounded } from '@mui/icons-material';
import { addBsMonths, getDaysRemainingUntilAutoSettle, getNextAutoSettleTimestamp } from '../../utils/nepaliDate';
import { getNepaliMonthLabel } from '../../constant/constant';

const AutoSettleCountdown = ({ targetTime }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const diff = Math.max(0, targetTime - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return (
        <Box
            component="span"
            sx={{
                fontVariantNumeric: 'tabular-nums',
                color: (theme) => theme.palette.info.main,
                fontWeight: 600,
            }}
        >
            {days}d {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
        </Box>
    );
};

/**
 * Warns when the auto-settle run (BS day 1, 00:30) is within 3 days, showing a
 * live countdown and the name of the month that will be settled automatically.
 * Renders nothing when there is more than 3 days left.
 */
const AutoSettleBanner = ({ color = 'warning', sx = {} }) => {
    const theme = useTheme();
    const countdown = getDaysRemainingUntilAutoSettle();
    const targetTime = getNextAutoSettleTimestamp();

    if (!countdown || !targetTime || countdown.daysRemaining > 3) return null;

    const settledMonth = getNepaliMonthLabel(countdown.bsMonth);
    const next = addBsMonths(countdown.bsYear, countdown.bsMonth, 1);

    return (
        <Box
            sx={{
                mb: 2,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: alpha(theme.palette[color].main, 0.08),
                border: `1px solid ${alpha(theme.palette[color].main, 0.25)}`,
                ...sx,
            }}
        >
            <EventAvailableRounded fontSize="small" color={color} />
            <Typography variant="body2" color="text.secondary">
                Auto settle in <AutoSettleCountdown targetTime={targetTime} /> —
                {` ${settledMonth} ${countdown.bsYear} will be settled automatically on ${getNepaliMonthLabel(next.bsMonth)} 1, ${next.bsYear}.`}
                {' '}
                <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                    Add your remaining expenses fast.
                </Box>
            </Typography>
        </Box>
    );
};

export default AutoSettleBanner;
