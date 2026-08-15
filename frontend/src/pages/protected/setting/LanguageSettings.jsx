import React from 'react';
import {
    Box,
    Stack,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    useTheme
} from '@mui/material';
import { TranslateTwoTone } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/I18n';
import CustomCard from '../../../components/custom/CustomCard';

const LanguageSettings = () => {
    const theme = useTheme();
    const { t } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'ne', name: 'Nepali', native: 'नेपाली' }
    ];

    const handleLanguageChange = (_, newLanguage) => {
        if (newLanguage) {
            i18n.changeLanguage(newLanguage);
            localStorage.setItem('language', newLanguage);
        }
    };

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <CustomCard icon={<TranslateTwoTone fontSize="small" />} title={t('settings.language', 'Language')}>
            <Stack spacing={3}>
                <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                        {t('language.select', 'Select Language')}
                    </Typography>
                    <ToggleButtonGroup
                        value={i18n.language}
                        exclusive
                        onChange={handleLanguageChange}
                        fullWidth
                        color="primary"
                        sx={{
                            '& .MuiToggleButton-root': {
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }
                            }
                        }}
                    >
                        {languages.map((lang) => (
                            <ToggleButton key={lang.code} value={lang.code}>
                                <Stack spacing={0.5} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {lang.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {lang.native}
                                    </Typography>
                                </Stack>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        {t('common.preview', 'Preview')}
                    </Typography>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                {t('settings.language', 'Language')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {currentLang.name} ({currentLang.native})
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                {t('settings.settingsLabel', 'Settings')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {i18n.language === 'ne' ? 'सेटिङ्गहरू' : 'Settings'}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </CustomCard>
    );
};

export default LanguageSettings;
