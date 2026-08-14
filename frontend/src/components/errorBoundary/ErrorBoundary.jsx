import React from 'react';

import {
    Box,
    Button,
    Typography,
    Paper
} from '@mui/material';

import {
    ErrorOutlineTwoTone,
    RefreshTwoTone
} from '@mui/icons-material';

import {
    useNavigate,
    useLocation
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error(
            'ErrorBoundary caught an error:',
            error,
            errorInfo
        );

        this.setState({
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback({
                error: this.state.error,
                resetError: this.handleReset,
                reload: this.handleReload
            });
        }

        return this.props.children;
    }
}

const ErrorFallback = ({
    error,
    resetError,
    reload
}) => {

    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();

    const handleGoHome = () => {

        resetError();

        setTimeout(() => {
            navigate(
                isAuthenticated
                    ? '/dashboard'
                    : '/login',
                { replace: true }
            );
        }, 0);
    };

    const handleGoBack = () => {

        resetError();

        setTimeout(() => {
            navigate(-1);
        }, 0);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 600,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: 3
                }}
            >

                <ErrorOutlineTwoTone
                    color="error"
                    sx={{
                        fontSize: 72,
                        mb: 2
                    }}
                />

                <Typography
                    variant="h4"
                    color="error"
                    gutterBottom
                >
                    Something went wrong
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    The application encountered an unexpected error.
                </Typography>

                    {error && (
                        <Box
                            component="pre"
                            sx={(theme) => ({
                                mt: 2,
                                mb: 3,
                                p: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                                borderRadius: 2,
                                textAlign: 'left',
                                overflow: 'auto',
                                fontSize: '0.85rem'
                            })}
                        >
                            {error.toString()}
                        </Box>
                    )}

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >

                    <Button
                        variant="contained"
                        startIcon={<RefreshTwoTone />}
                        onClick={handleGoBack}
                    >
                        Go Back
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={reload}
                    >
                        Reload Page
                    </Button>

                    <Button
                        variant="text"
                        onClick={handleGoHome}
                    >
                        {isAuthenticated
                            ? 'Dashboard'
                            : 'Home'}
                    </Button>

                </Box>
            </Paper>
        </Box>
    );
};

const ErrorBoundary = ({ children }) => {

    const location = useLocation();

    return (
        <ErrorBoundaryClass
            key={location.pathname}
            fallback={(props) => (
                <ErrorFallback {...props} />
            )}
        >
            {children}
        </ErrorBoundaryClass>
    );
};

export default ErrorBoundary;