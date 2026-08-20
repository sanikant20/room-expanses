import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, TextField, Button, Typography, InputAdornment, IconButton, Divider, Alert, InputLabel, Stack, CircularProgress, useTheme, useMediaQuery, keyframes, alpha } from '@mui/material';
import { FormatQuote, LoginRounded, ArrowBackRounded, PeopleAltTwoTone, ReceiptLongTwoTone, AccountBalanceWalletTwoTone, BarChartTwoTone, PersonTwoTone, VisibilityOffTwoTone, VisibilityTwoTone, LockTwoTone, AdminPanelSettingsRounded, GroupsTwoTone, ShieldRounded } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { useLogin, usePartnerLogin } from '../../apis/authApi/AuthAPI';
import { toast } from 'react-toastify';
import { encryptData } from '../../utils/encryption';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

// Animation keyframes
const slideInRight = keyframes`
    0% { transform: translateX(50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
`;

const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
`;

const slideInLeft = keyframes`
    0% { transform: translateX(-50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
`;

const slideUp = keyframes`
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
`;

const initialValues = {
    email: '',
    password: '',
};

const Login = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loginMode, setLoginMode] = useState('partner');
    const isPartnerMode = loginMode === 'partner';

    const { isAuthenticated, setIsAuthenticated } = useAuth();

    const validationSchema = yup.object({
        email: yup.string().email('Invalid email address').required('Email is required'),
        password: yup.string().required('Password is required'),
    });

    const { mutate: login, isPending } = useLogin();
    const { mutate: partnerLogin, isPending: isPartnerPending } = usePartnerLogin();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (values, { setSubmitting }) => {
        const mutate = isPartnerMode ? partnerLogin : login;
        mutate({ values }, {
            onSuccess: (response) => {
                if (response?.success) {
                    const { token, user } = response;
                    sessionStorage.setItem('auth', token);
                    sessionStorage.setItem('user', encryptData(JSON.stringify(user)));
                    setIsAuthenticated(true);
                    setSubmitting(false);
                } else {
                    toast.error(response?.message || 'Login failed');
                    setErrorMessage(response?.message);
                }
            },
            onError: (error) => {
                setSubmitting(false);
                const errorMsg = error?.response?.data?.message || 'An error occurred during login';
                toast.error(errorMsg);
                setErrorMessage(errorMsg);
            }
        });
    };

    const features = [
        {
            icon: ReceiptLongTwoTone,
            text: 'Expense tracking',
            description: 'Record primary and secondary room expenses in seconds.',
        },
        {
            icon: PeopleAltTwoTone,
            text: 'Fair split calculations',
            description: 'Automatic per-partner shares that respect excluded members.',
        },
        {
            icon: AccountBalanceWalletTwoTone,
            text: 'Monthly settlement',
            description: 'See who owes and who receives with clear balances.',
        },
        {
            icon: BarChartTwoTone,
            text: 'Insightful reports',
            description: 'Visual dashboards and Nepali-month reports for every partner.',
        },
    ];

    return (
        <Grid container sx={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', boxShadow: theme.shadows[10], backdropFilter: 'blur(10px)' }}>
            {/* Left Side - Branding & Features with Animations */}
            {!isMobile && (
                <Grid size={{ xs: 'none', md: 6 }}
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'url("/logo.png") center/contain no-repeat',
                            opacity: 0.1
                        }
                    }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden',
                        zIndex: 0,
                    }}>
                        {[...Array(6)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    width: Math.random() * 100 + 50,
                                    height: Math.random() * 100 + 50,
                                    borderRadius: '50%',
                                    background: `rgba(255,255,255,${Math.random() * 0.03 + 0.01})`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `${float} ${Math.random() * 10 + 8}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`,
                                }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="The Roomies Logo"
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 1,
                                    mr: { sm: 3 },
                                    mb: { xs: 2, sm: 0 },
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
                                    animation: `${pulse} 3s ease-in-out infinite`,
                                    bgcolor: theme.palette.common.white,
                                }}
                            />
                            <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                                The Roomies
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            Room Expenses Management
                        </Typography>
                    </Box>

                    {/* Animated Quote Box */}
                    <Box sx={{
                        mt: 6,
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: '1px solid',
                        borderColor: 'primary.light',
                        borderRadius: 3,
                        position: 'relative',
                        zIndex: 1,
                        textAlign: 'center',
                        animation: `${slideInLeft} 0.8s ease-out`,
                        animationDelay: '0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'scale(1.02)',
                            transition: 'transform 0.3s ease',
                        },
                    }}>
                        <FormatQuote
                            sx={{
                                fontSize: 40,
                                color: 'primary.light',
                                opacity: 0.5,
                            }}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                fontStyle: 'italic',
                                fontSize: '1.1rem',
                                color: 'primary.contrastText',
                                lineHeight: 1.6,
                                fontWeight: 500,
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            Add expenses, assign contributors, exclude partners when required, and settle balances — all in Nepali months.
                        </Typography>
                        <FormatQuote
                            sx={{
                                fontSize: 40,
                                color: 'primary.light',
                                opacity: 0.5,
                            }}
                        />
                    </Box>

                    {/* Animated Features */}
                    <Box sx={{ mt: 6, position: 'relative', zIndex: 1 }}>
                        {features.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    mb: 2,
                                    p: 1,
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    animation: `${slideUp} ${0.6 + index * 0.15}s ease-out`,
                                    opacity: 0,
                                    animationFillMode: 'forwards',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        transform: 'translateX(8px) scale(1.02)',
                                        boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.15)}`,
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        p: 1.5,
                                        borderRadius: 2,
                                        mr: 3,
                                        flexShrink: 0,
                                        animation: `${float} 4s ease-in-out infinite`,
                                        animationDelay: `${index * 0.5}s`,
                                    }}
                                >
                                    <item.icon sx={{ fontSize: 28, opacity: 0.9 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5 }}>{item.text}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.9rem' }}>{item.description}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            )}

            {/* Right Side - Login Form with Animations */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, md: 6 },
                    bgcolor: 'background.paper',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '5%',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${theme.palette.primary.main}08, transparent)`,
                        animation: `${float} 6s ease-in-out infinite`,
                        zIndex: 0,
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '10%',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${theme.palette.primary.main}05, transparent)`,
                        animation: `${float} 8s ease-in-out infinite`,
                        animationDelay: '2s',
                        zIndex: 0,
                    }} />

                    <Box sx={{ width: '100%', maxWidth: 450, position: 'relative', zIndex: 1 }}>

                        <Button
                            startIcon={<ArrowBackRounded />}
                            onClick={() => navigate('/')}
                            sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
                        >
                            Back to home
                        </Button>

                        {/* Animated login header */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    mx: 'auto',
                                    mb: 2,
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                                }}
                            >
                                {isPartnerMode ? <GroupsTwoTone sx={{ fontSize: 40, color: '#fff' }} /> : <ShieldRounded sx={{ fontSize: 40, color: '#fff' }} />}
                            </Box>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                gutterBottom
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    color: 'transparent',
                                    animation: `${slideInRight} 0.8s ease-out`,
                                }}
                            >
                                {isPartnerMode ? 'Partner Sign In' : 'Admin Sign In'}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    fontSize: '1rem',
                                    animation: `${slideInRight} 1s ease-out`,
                                }}
                            >
                                {isPartnerMode
                                    ? 'Sign in with the email your admin set for you'
                                    : 'Sign in to manage the room and its members'}
                            </Typography>
                        </Box>

                        {/* Animated Card */}
                        <Card sx={{
                            p: { xs: 3, md: 4 },
                            boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            animation: `${fadeIn} 0.8s ease-out`,
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <Formik
                                key={loginMode}
                                initialValues={isPartnerMode ? { email: '', password: '' } : initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ errors, touched, handleChange, handleBlur, values, isSubmitting, dirty }) => (
                                    <Form>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <Stack spacing={1}>
                                                    <InputLabel htmlFor="email" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                        Email
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.email && Boolean(errors.email)}
                                                        helperText={touched.email && errors.email}
                                                        slotProps={{
                                                            input: {
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <PersonTwoTone color={touched.email && errors.email ? "error" : "primary"} />
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }}
                                                        placeholder="Enter your email"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                transition: 'all 0.3s ease',
                                                                borderRadius: 2,
                                                                '&:hover': {
                                                                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                                                                },
                                                                '&.Mui-focused': {
                                                                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}30`,
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Stack>
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Stack spacing={1}>
                                                    <InputLabel htmlFor="password" sx={{ fontWeight: 600, color: 'text.primary' }}>Password</InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        id="password"
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touched.password && Boolean(errors.password)}
                                                        helperText={touched.password && errors.password}
                                                        slotProps={{
                                                            input: {
                                                                startAdornment: (<InputAdornment position="start"><LockTwoTone color={touched.password && errors.password ? "error" : "primary"} /></InputAdornment>),
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={() => setShowPassword((show) => !show)}
                                                                            onMouseDown={(e) => e.preventDefault()}
                                                                            edge="end"
                                                                            size='small'
                                                                        >
                                                                            {showPassword ? <VisibilityOffTwoTone /> : <VisibilityTwoTone />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }}
                                                        placeholder="Enter your password"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                transition: 'all 0.3s ease',
                                                                borderRadius: 2,
                                                                '&:hover': {
                                                                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                                                                },
                                                                '&.Mui-focused': {
                                                                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}30`,
                                                                },
                                                            },
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                document.getElementById('login-submit')?.click();
                                                            }
                                                        }}
                                                    />
                                                </Stack>
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                {errorMessage && (
                                                    <Alert
                                                        severity="error"
                                                        onClose={() => setErrorMessage('')}
                                                        sx={{
                                                            mb: 2,
                                                            animation: `${fadeIn} 0.5s ease-out`,
                                                        }}
                                                    >
                                                        {errorMessage}
                                                    </Alert>
                                                )}

                                                <Button
                                                    id="login-submit"
                                                    type="submit"
                                                    fullWidth
                                                    variant="contained"
                                                    size="large"
                                                    disabled={isSubmitting || isPending || isPartnerPending || !dirty}
                                                    sx={{
                                                        py: 1.5,
                                                        mb: 2,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontSize: '1.05rem',
                                                        fontWeight: 600,
                                                        background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                        boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                        },
                                                        '&:disabled': {
                                                            background: theme.palette.action.disabledBackground,
                                                            transform: 'none',
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                    startIcon={!isSubmitting && !isPending && !isPartnerPending && <LoginRounded />}
                                                >
                                                    {(isSubmitting || isPending || isPartnerPending)
                                                        ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><CircularProgress size={20} color="inherit" /> Signing in...</Box>
                                                        : 'Sign in'}
                                                </Button>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2.5 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                                                Secure Access
                                            </Typography>
                                        </Divider>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="medium"
                                            onClick={() => {
                                                setErrorMessage('');
                                                setLoginMode(isPartnerMode ? 'user' : 'partner');
                                            }}
                                            startIcon={isPartnerMode ? <AdminPanelSettingsRounded /> : <GroupsTwoTone />}
                                            sx={{
                                                mb: 2,
                                                py: 1,
                                                textTransform: 'none',
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                color: 'text.secondary',
                                                borderColor: alpha(theme.palette.divider, 0.6),
                                            }}
                                        >
                                            {isPartnerMode ? 'Admin Login' : 'Partner Login'}
                                        </Button>

                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                © {new Date().getFullYear()} <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                                                    The Roomies</span>. All rights reserved.
                                            </Typography>
                                        </Box>
                                    </Form>
                                )}
                            </Formik>
                        </Card>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
