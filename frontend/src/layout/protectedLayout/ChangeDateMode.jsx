import React from 'react';
import {
    ListItemIcon,
    ListItemText,
    MenuItem,
    Tooltip,
    useMediaQuery,
    useTheme,
    Switch,
    Typography,
    Box
} from '@mui/material';
import {
    CalendarMonthRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDateContext } from '../../context/DateContext';

const ChangeDateMode = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t } = useTranslation();
    const { useNepaliDate, toggleDateMode } = useDateContext();

    return (
        <Tooltip title={t('date.toggle', 'Toggle Date Format')}>
            <MenuItem
                onClick={toggleDateMode}
                sx={{
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    }
                }}
            >
                <ListItemIcon sx={{
                    minWidth: isMobile ? 32 : 36,
                    marginRight: isMobile ? 0.5 : 1,
                    color: theme.palette.primary.main
                }}>
                    <CalendarMonthRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('date.dateFormat', 'Date Format')}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                            >
                                {useNepaliDate ? 'Nepali' : 'English'}
                            </Typography>
                        </Box>
                    }
                />
                <Switch
                    size="small"
                    checked={useNepaliDate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={toggleDateMode}
                    color="primary"
                />
            </MenuItem>
        </Tooltip>
    );
};

export default ChangeDateMode;
