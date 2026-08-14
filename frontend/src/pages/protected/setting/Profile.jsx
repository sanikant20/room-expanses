import React from 'react';
import {
    Box,
    Container,
    Paper,
    Grid,
    Typography,
    Avatar,
    Chip,
    Stack,
    alpha,
    useTheme,
} from '@mui/material';
import {
    EmailTwoTone,
    PhoneTwoTone,
    BadgeTwoTone,
    FingerprintTwoTone,
    InfoTwoTone,
    BusinessTwoTone,
    AdminPanelSettingsTwoTone,
    CalendarTodayTwoTone,
    AccessTimeTwoTone,
    PersonPinTwoTone,
    AdminPanelSettingsRounded,
    BusinessRounded,
} from '@mui/icons-material';
import { getAuthData, isPartnerAccount } from '../../../helper/getAuthData';
import CustomCard from '../../../components/custom/CustomCard';
import { dateFormatToToggledDate } from '../../../utils/dateFormatToToggleDate';
import { useDateContext } from '../../../context/DateContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const theme = useTheme();
    const authData = getAuthData();
    const isPartner = isPartnerAccount();
    const { useNepaliDate } = useDateContext();
    const { t } = useTranslation();
    const roleLabel = isPartner ? t('user.partner', 'Partner') : t('user.admin', 'Admin');
    const RoleChipIcon = isPartner ? PersonPinTwoTone : AdminPanelSettingsRounded;
    const roleRowIcon = isPartner ? PersonPinTwoTone : AdminPanelSettingsTwoTone;

    const InfoRow = ({ label, value, icon: Icon }) => (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
            {Icon && <Icon sx={{ fontSize: 18, color: theme.palette.primary.main, mt: 0.3 }} />}
            <Typography variant="body2" sx={{ minWidth: 130, fontWeight: 600, color: 'text.secondary' }}>
                {label}:
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, color: 'text.primary', fontWeight: 500 }}>
                {value || '-'}
            </Typography>
        </Stack>
    );

    return (
        <Container maxWidth="lg">
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    borderRadius: 2,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: alpha(theme.palette.common.white, 0.1),
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        background: alpha(theme.palette.common.white, 0.05),
                    }
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                        alt={authData?.FullName}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '4px solid white',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
                            bgcolor: theme.palette.primary.light,
                            fontSize: 48,
                            fontWeight: 700,
                        }}
                    >
                        {authData?.FullName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {authData?.FullName || t('user.user', 'User')}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                            <Chip
                                icon={<RoleChipIcon sx={{ fontSize: 16 }} />}
                                label={roleLabel}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip
                                icon={<BusinessRounded sx={{ fontSize: 16 }} />}
                                label={`${authData?.ComID || ''}`}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                            {t('profile.userId', 'User ID')}: {authData?.UserID || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                            {t('profile.username', 'Username')}: {authData?.Email || '-'}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard icon={<InfoTwoTone fontSize="small" />} title={t('profile.basicInformation', 'Basic Information')}>
                        <InfoRow label={t('profile.fullName', 'Full Name')} value={authData?.FullName} icon={BadgeTwoTone} />
                        <InfoRow label={t('profile.username', 'Username')} value={authData?.Email} icon={PersonPinTwoTone} />
                        <InfoRow label={t('profile.email', 'Email')} value={authData?.Email} icon={EmailTwoTone} />
                        <InfoRow label={t('profile.phone', 'Phone')} value={authData?.Phone} icon={PhoneTwoTone} />
                        <InfoRow label={t('profile.companyId', 'Company ID')} value={authData?.ComID} icon={BusinessTwoTone} />
                    </CustomCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard icon={<FingerprintTwoTone fontSize="small" />} title={t('profile.accountDetails', 'Account Details')}>
                        {/* <InfoRow label="User ID" value={authData?.UserID} icon={FingerprintTwoTone} /> */}
                        {/* <InfoRow label="Auth Code" value={authData?.AuthCode} icon={BadgeTwoTone} /> */}
                        <InfoRow label={t('profile.role', 'Role')} value={roleLabel} icon={roleRowIcon} />
                        <InfoRow label={t('profile.todaysDate', "Today's Date")} value={dateFormatToToggledDate(new Date(), useNepaliDate)} icon={CalendarTodayTwoTone} />
                        <InfoRow label={t('profile.currentTime', 'Current Time')} value={new Date().toLocaleTimeString()} icon={AccessTimeTwoTone} />
                    </CustomCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
