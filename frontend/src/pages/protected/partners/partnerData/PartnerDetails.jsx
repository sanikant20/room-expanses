import React from 'react';
import {
    Avatar,
    Box,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    CalendarMonthRounded,
    EmailRounded,
    NotesRounded,
    PhoneRounded,
} from '@mui/icons-material';

const InfoCard = ({ icon, label, value, color, noWrap = true }) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                height: '100%',
                borderRadius: `${theme.shape.borderRadius}px`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                boxShadow: theme.shadows[1],
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: `${theme.shape.borderRadius}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(color, 0.12),
                    color,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={noWrap ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { wordBreak: 'break-word' }}
                >
                    {value || '—'}
                </Typography>
            </Box>
        </Box>
    );
};

const PartnerDetails = ({ partner = {} }) => {
    const theme = useTheme();
    const status = partner.status === 'active' ? 'Active' : 'Inactive';

    return (
        <Box>
            <Box
                sx={{
                    position: 'relative',
                    height: 120,
                    borderRadius: `${theme.shape.borderRadius}px`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.95)}, ${theme.palette.primary.main})`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -40,
                        right: -30,
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.contrastText, 0.12),
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -60,
                        left: 90,
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: alpha(theme.palette.primary.contrastText, 0.9),
                    }}
                >
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Partner Profile
                    </Typography>
                </Box>
            </Box>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ px: 2, mt: -3.5, position: 'relative' }}
            >
                <Avatar
                    src={partner.image || '/noAvatar.svg'}
                    imgProps={{ onError: (e) => { e.target.src = '/noAvatar.svg'; } }}
                    sx={{
                        width: 88,
                        height: 88,
                        fontSize: '2rem',
                        bgcolor: theme.palette.primary.main,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[2],
                    }}
                >
                    {partner.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ pb: 0.5, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {partner.name || '—'}
                    </Typography>
                    <Chip
                        size="small"
                        label={status}
                        color={partner.status === 'active' ? 'success' : 'error'}
                        sx={{ mt: 0.5, fontWeight: 600 }}
                    />
                </Box>
            </Stack>

            <Divider sx={{ mt: 2, mb: 1.5 }} />

            <Grid container spacing={1.5} sx={{ px: 2, pb: 1 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoCard
                        icon={<PhoneRounded fontSize="small" />}
                        label="Phone"
                        value={partner.phone}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoCard
                        icon={<EmailRounded fontSize="small" />}
                        label="Email"
                        value={partner.email}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoCard
                        icon={<CalendarMonthRounded fontSize="small" />}
                        label="Joining Date (BS)"
                        value={partner.bsJoiningDate}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <InfoCard
                        icon={<NotesRounded fontSize="small" />}
                        label="Notes"
                        value={partner.notes}
                        color={theme.palette.warning.main}
                        noWrap={false}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PartnerDetails;
