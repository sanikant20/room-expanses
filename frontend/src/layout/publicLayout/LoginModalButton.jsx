import React from 'react';
import {
    Button,
    IconButton,
    alpha,
    useTheme,
} from '@mui/material';
import { LoginRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LoginModalButton = ({ isMobile = false }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleLogin = () => navigate(`/login`);

    return (
        <>
            {isMobile ? (
                <IconButton
                    onClick={handleLogin}
                    size="small"
                    aria-label="Login"
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        color: theme.palette.text.secondary,
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.5),
                            borderColor: alpha(theme.palette.divider, 0.3),
                        },
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    }}
                >
                    <LoginRounded sx={{ fontSize: 20 }} />
                </IconButton>
            ) : (
                <Button
                    onClick={handleLogin}
                    variant="contained"
                    size="small"
                    startIcon={<LoginRounded />}
                >
                    Login
                </Button>
            )}
        </>
    );
};

export default LoginModalButton;
