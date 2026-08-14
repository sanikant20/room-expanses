import * as React from 'react';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    SettingsRounded,
    AdminPanelSettingsRounded,
    LogoutTwoTone,
    KeyRounded,
    PaletteRounded,
    PersonRounded
} from '@mui/icons-material';
import { Avatar, Badge, Tooltip, useMediaQuery } from '@mui/material';
import ChangeLanguage from './ChangeLanguage';
import ChangeDateMode from './ChangeDateMode';
import { getAuthData } from '../../helper/getAuthData';

// Styled Components with responsive adjustments
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
    margin: '2px 0',
    borderRadius: 6,
    padding: '6px 8px',
    gap: 10,
    minHeight: 'auto',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateX(2px)',
    },
    '&.logout': {
        color: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
        },
    },
    [theme.breakpoints.down('md')]: {
        margin: '1px 0',
        padding: '4px 6px',
        gap: 8,
        borderRadius: 4,
        minHeight: 36,
    },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: 40,
    height: 40,
    border: `2px solid ${theme.palette.primary.main}40`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
    [theme.breakpoints.down('md')]: {
        width: 36,
        height: 36,
        fontSize: '0.75rem',
    },
}));

const UserInfo = styled(Box)(({ theme }) => ({
    padding: '16px 20px 12px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: 4,
    [theme.breakpoints.down('md')]: {
        padding: '12px 16px 8px',
        marginBottom: 2,
    },
}));

const UserName = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.2,
    [theme.breakpoints.down('md')]: {
        fontSize: '0.9rem',
    },
}));

const UserEmail = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    lineHeight: 1.3,
    [theme.breakpoints.down('md')]: {
        fontSize: '0.8rem',
    },
}));

const RoleContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    [theme.breakpoints.down('md')]: {
        marginTop: 2,
        gap: 6,
    },
}));

const RoleText = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 500,
    [theme.breakpoints.down('md')]: {
        fontSize: '0.75rem',
    },
}));

export default function OptionsMenu() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { t } = useTranslation();
    const authData = getAuthData();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        navigate('/logout');
        handleClose();
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleClose();
    };

    const userData = {
        name: `${authData?.FullName}`,
        email: authData?.Email || authData?.Phone || '',
        role: authData?.accountType === 'partner' ? 'Partner' : t('user.admin'),
        avatar: '',
        username: `${authData?.ComID}`
    };

    // Menu items configuration
    const menuItems = [
        {
            id: 'profile',
            label: t('menu.myProfile'),
            icon: <PersonRounded fontSize={isMobile ? "small" : "small"} />,
            action: () => handleNavigation('/profile')
        },
        {
            id: 'change-password',
            label: t('menu.changePassword'),
            icon: <KeyRounded fontSize={isMobile ? "small" : "small"} />,
            action: () => handleNavigation('/change-password')
        },
        {
            id: 'theme',
            label: t('menu.theme'),
            icon: <PaletteRounded fontSize={isMobile ? "small" : "small"} />,
            action: () => handleNavigation('/theme')
        },
        {
            id: 'setting',
            label: t('menu.settings'),
            icon: <SettingsRounded fontSize={isMobile ? "small" : "small"} />,
            action: () => handleNavigation('/settings')
        }
    ];

    return (
        <React.Fragment>
            <Tooltip title={t('header.userProfile')} arrow>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                    sx={{
                        '& .MuiBadge-dot': {
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            border: '2px solid white',
                            [theme.breakpoints.down('md')]: {
                                width: 10,
                                height: 10,
                            },
                        },
                    }}
                >
                    <UserAvatar
                        onClick={handleClick}
                        alt={userData.name}
                        src={userData.avatar}
                    >
                        {userData.name.split(' ').map(n => n[0]).join('')}
                    </UserAvatar>
                </Badge>
            </Tooltip>

            {/* MAIN MENU */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    '& .MuiPaper-root': {
                        width: isMobile ? 200 : 240,
                        maxHeight: 'calc(100vh - 100px)',
                        borderRadius: 2,
                        boxShadow: theme.shadows[8],
                        border: `1px solid ${theme.palette.primary.main}`,
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: -8,
                            right: isMobile ? 16 : 20,
                            width: 16,
                            height: 16,
                            backgroundColor: alpha(theme.palette.primary.light, 1),
                            transform: 'rotate(45deg)',
                            border: `1px solid ${theme.palette.primary.main}`,
                        },
                    },
                    '& .MuiList-root': {
                        padding: isMobile ? '4px' : '6px',
                        overflowY: 'auto',
                        flex: 1,
                    },
                }}
            >
                {/* User Info */}
                <UserInfo>
                    <UserName variant="subtitle1">{userData?.name}</UserName>
                    <UserEmail variant="body2">{userData?.email ? userData?.email : userData?.username}</UserEmail>
                    <RoleContainer>
                        <AdminPanelSettingsRounded sx={{
                            fontSize: isMobile ? 14 : 16,
                            color: 'primary.main'
                        }} />
                        <RoleText variant="caption">
                            {userData?.role}
                        </RoleText>
                    </RoleContainer>
                </UserInfo>

                {/* Mapped Menu Items */}
                {menuItems.map((item) => (
                    <MenuItem key={item.id} onClick={item.action}>
                        <ListItemIcon sx={{
                            minWidth: isMobile ? 32 : 36,
                            '& svg': {
                                fontSize: isMobile ? 18 : 20
                            }
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                                }
                            }}
                        />
                    </MenuItem>
                ))}

                <ChangeLanguage isMobile={isMobile} />

                <ChangeDateMode />

                {/* Logout Section */}
                <Divider sx={{ my: isMobile ? 0.5 : 1 }} />

                <MenuItem onClick={handleLogout} className="logout" sx={{
                    mt: 0.5,
                    '&:hover': {
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.contrastText,
                    }
                }}>
                    <ListItemIcon sx={{
                        minWidth: isMobile ? 32 : 36,
                        '& svg': {
                            fontSize: isMobile ? 18 : 20
                        }
                    }}>
                        <LogoutTwoTone sx={{
                            color: 'error.main',
                            '&:hover': {
                                color: 'error.contrastText'
                            }
                        }} />
                    </ListItemIcon>
                    <ListItemText primary={t('menu.logout')} />
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}
