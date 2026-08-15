import React, { useState } from 'react';
import {
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    useMediaQuery,
    useTheme,
    Box,
    Typography
} from '@mui/material';
import {
    Language,
    CheckRounded,
    LanguageTwoTone,
    Translate,
    GTranslate
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/I18n';

const ChangeLanguage = ({ variant = 'menuItem', compact = false, sx }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t } = useTranslation();
    const [langAnchor, setLangAnchor] = useState(null);
    const isCompact = variant === 'iconButton' || compact;

    const handleLanguageMenu = (event) => {
        setLangAnchor(event.currentTarget);
    };

    const handleLanguageClose = () => {
        setLangAnchor(null);
    };

    const handleLanguageChange = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
        handleLanguageClose();
    };

    const languages = [
        { code: 'en', name: t('language.english', 'English'), native: 'English', flag: '🇺🇸' },
        { code: 'ne', name: t('language.nepali', 'Nepali'), native: 'नेपाली', flag: '🇳🇵' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <>
            {isCompact ? (
                <Tooltip title={t('language.change', 'Change Language')}>
                    <IconButton
                        onClick={handleLanguageMenu}
                        size="small"
                        aria-label={t('language.change', 'Change Language')}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                                borderColor: theme.palette.primary.main,
                            },
                            ...sx,
                        }}
                    >
                        <Translate fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title={t('language.change', 'Change Language')}>
                    <MenuItem
                        onClick={handleLanguageMenu}
                        className="menu-item"
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
                            {isMobile ? (
                                <GTranslate fontSize="small" />
                            ) : (
                                <Translate fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {t('language.language', 'Language')}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            {/* {currentLanguage.flag} */}
                                            {currentLanguage.native}
                                        </Typography>
                                    </>
                                </Box>
                            }
                        />
                    </MenuItem>
                </Tooltip>
            )}

            {/* Language Options Menu */}
            <Menu
                anchorEl={langAnchor}
                open={Boolean(langAnchor)}
                onClose={handleLanguageClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: 2,
                        mt: 1,
                        minWidth: 160,
                        boxShadow: theme.shadows[3],
                        border: `1px solid ${theme.palette.divider}`,
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('language.select', 'Select Language')}
                    </Typography>
                </Box>

                {languages.map((language) => (
                    <MenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        selected={i18n.language === language.code}
                        sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.action.selected,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.selected,
                                }
                            },
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {/* <Typography variant="h6" sx={{ mr: 1.5 }}>
                                {language.flag}
                            </Typography> */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {language.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {language.native}
                                </Typography>
                            </Box>
                            {i18n.language === language.code && (
                                <CheckRounded
                                    sx={{
                                        fontSize: 20,
                                        color: theme.palette.primary.main,
                                        ml: 1
                                    }}
                                />
                            )}
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default ChangeLanguage;