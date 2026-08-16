import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, keyframes, useTheme, alpha } from '@mui/material';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const rotateReverse = keyframes`
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
`;

// Loading Messages
const loadingMessages = [
    'Opening the Roomies workspace...',
    'Preparing your expense insights...',
    'Syncing settlements and reports...',
    'Almost ready for your room team...',
    'The Roomies - Room Expenses Management...'
];

const Loader = ({
    message = null,
    logo = '/logo.png',
    logoSize = 80,
    circularColor = 'primary',
    fontSize = '1rem',
    rotateMessages = true,
    rotationInterval = 2500,
    showProgressPercentage = true,
    progress = null,
}) => {
    const theme = useTheme();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(() => {
        return Math.floor(Math.random() * loadingMessages.length);
    });
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Rotate messages randomly if enabled
    useEffect(() => {
        if (!rotateMessages || !loadingMessages.length) return;

        const interval = setInterval(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * loadingMessages.length);
            } while (loadingMessages.length > 1 && newIndex === currentMessageIndex);

            setCurrentMessageIndex(newIndex);
        }, rotationInterval);

        return () => clearInterval(interval);
    }, [rotateMessages, rotationInterval, currentMessageIndex]);

    // Simulate progress if showProgressPercentage is true
    useEffect(() => {
        if (!showProgressPercentage || progress !== null) return;

        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 95) return 95; // Stop at 95% until actual completion
                return prev + Math.random() * 10;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [showProgressPercentage, progress]);

    const currentMessage = message || loadingMessages[currentMessageIndex];
    const currentProgress = progress !== null ? progress : loadingProgress;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                padding: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
                animation: `${fadeIn} 0.6s ease-out`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
                    animation: `${pulse} 4s infinite ease-in-out`,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
                    animation: `${pulse} 3s infinite ease-in-out 1s`,
                }}
            />

            {/* Logo with Multiple Circular Progress Rings */}
            <Box sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                width: logoSize + 80,
                height: logoSize + 80,
            }}>
                {/* Outer Circle - Slow rotation */}
                <CircularProgress
                    size={logoSize + 60}
                    color={circularColor}
                    thickness={1}
                    variant="indeterminate"
                    sx={{
                        position: 'absolute',
                        animation: `${rotate} 4s linear infinite`,
                    }}
                />

                {/* Middle Circle - Medium rotation */}
                <CircularProgress
                    size={logoSize + 30}
                    color={circularColor}
                    thickness={2}
                    variant="indeterminate"
                    sx={{
                        position: 'absolute',
                        animation: `${rotateReverse} 2.5s linear infinite`,
                    }}
                />

                {/* Inner Circle - Fast rotation */}
                <CircularProgress
                    size={logoSize}
                    color={circularColor}
                    thickness={3}
                    variant="indeterminate"
                    sx={{
                        position: 'absolute',
                        animation: `${rotate} 2s linear infinite`,
                    }}
                />

                {/* Logo in center */}
                <Box
                    component="img"
                    src={logo}
                    alt="The Roomies"
                    sx={{
                        width: logoSize - 10,
                        height: logoSize - 10,
                        borderRadius: 3,
                        animation: `${pulse} 3s infinite ease-in-out`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                        border: '2px solid',
                        borderColor: 'divider',
                        zIndex: 1,
                        backgroundColor: theme.palette.common.white,
                        p: 0.5,
                    }}
                />
            </Box>

            {/* Message */}
            <Typography
                variant="h6"
                sx={{
                    marginTop: 2,
                    fontSize: fontSize,
                    color: 'text.primary',
                    fontWeight: 600,
                    maxWidth: 500,
                    mx: 'auto',
                    lineHeight: 1.6,
                    mb: 2,
                }}
            >
                {currentMessage}
            </Typography>

            {/* Progress percentage */}
            {showProgressPercentage && (
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        mb: 2,
                    }}
                >
                    {Math.round(currentProgress)}% Complete
                </Typography>
            )}

            {/* Progress bar */}
            {showProgressPercentage && (
                <Box
                    sx={{
                        width: 300,
                        height: 6,
                        backgroundColor: 'grey.200',
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 4,
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            width: `${currentProgress}%`,
                            height: '100%',
                            background: (theme) => `linear-gradient(90deg, ${theme.palette[circularColor].light}, ${theme.palette[circularColor].main})`,
                            borderRadius: 3,
                            transition: 'width 0.3s ease-in-out',
                        }}
                    />
                </Box>
            )}

            {/* Animated dots */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                {[0, 1, 2].map((dot) => (
                    <Box
                        key={dot}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: (theme) => theme.palette[circularColor].main,
                            animation: `${pulse} 1.4s ease-in-out ${dot * 0.2}s infinite both`,
                        }}
                    />
                ))}
            </Box>

            {/* Tip */}
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    color: 'text.disabled',
                    fontStyle: 'italic',
                    maxWidth: '80%',
                    mx: 'auto',
                }}
            >
                "The Roomies - Powering fair room expense sharing"
            </Typography>
        </Box>
    );
};

export default Loader;