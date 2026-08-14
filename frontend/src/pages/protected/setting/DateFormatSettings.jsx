import React from 'react';
import {
    Box,
    Stack,
    Typography,
    Switch,
    FormControlLabel,
    useTheme
} from '@mui/material';
import { CalendarMonthRounded } from '@mui/icons-material';
import { useDateContext } from '../../../context/DateContext';
import CustomCard from '../../../components/custom/CustomCard';
import { getTodayEnglishDate, getTodayNepaliDate } from '../../../utils/dateConverter';
import { useTranslation } from 'react-i18next';

const DateFormatSettings = () => {
    const theme = useTheme();
    const { useNepaliDate, toggleDateMode } = useDateContext();
    const { t } = useTranslation();

    return (
        <CustomCard icon={<CalendarMonthRounded fontSize="small" />} title={t('settings.dateFormat', 'Date Format')}>
            <Stack spacing={3}>
                <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper'
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={useNepaliDate}
                                onChange={toggleDateMode}
                                color="primary"
                            />
                        }
                        label={
                            <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {t('date.useNepaliDate', 'Use Nepali Date')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {useNepaliDate
                                        ? t('date.currentlyUsingNepali', 'Currently using Nepali (Bikram Sambat) date format')
                                        : t('date.currentlyUsingEnglish', 'Currently using English (Gregorian) date format')
                                    }
                                </Typography>
                            </Stack>
                        }
                        sx={{ m: 0, alignItems: 'flex-start' }}
                    />
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
                                {t('date.dateFormat', 'Date Format')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {useNepaliDate ? t('date.nepaliBs', 'Nepali (BS)') : t('date.englishAd', 'English (AD)')}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                {t('date.example', 'Example')}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {useNepaliDate ? getTodayNepaliDate() : getTodayEnglishDate()}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </CustomCard>
    );
};

export default DateFormatSettings;
