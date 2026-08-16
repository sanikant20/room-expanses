import React, { useState, useRef, useCallback } from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
    Tooltip,
    Backdrop
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CloseRounded } from '@mui/icons-material';

const CustomModal = ({
    open,
    onClose,
    title,
    children,
    width = 1000,
    height = 'auto',
    headerColor = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isScrolled, setIsScrolled] = useState(false);
    const contentRef = useRef(null);

    // Scroll handler
    const handleScroll = useCallback(() => {
        if (contentRef.current) {
            const scrollTop = contentRef.current.scrollTop;
            setIsScrolled(scrollTop > 10);
        }
    }, []);

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : width,
        height: height,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: theme.shape.borderRadius,
        p: 0,
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'auto'
    };

    // Calculate header styles based on scroll state and headerColor prop
    const getHeaderStyles = () => {
        if (isScrolled) {
            // When scrolled - use primary dark color
            return {
                bgcolor: theme.palette.primary.dark,
                color: theme.palette.primary.contrastText,
                borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.3)}`,
                hoverBg: alpha(theme.palette.primary.dark, 0.9),
            };
        } else {
            // Default state - use headerColor or primary color
            return {
                bgcolor: headerColor ?
                    alpha(headerColor, 0.1) :
                    alpha(theme.palette.primary.main, 0.1),
                color: headerColor || theme.palette.primary.main,
                borderBottom: `1px solid ${alpha(headerColor || theme.palette.primary.main, 0.2)}`,
                hoverBg: headerColor ?
                    alpha(headerColor, 0.15) :
                    alpha(theme.palette.primary.main, 0.15),
            };
        }
    };

    const headerStyles = getHeaderStyles();

    return (
        <Modal
            open={open}
            onClose={onClose}
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    style: {
                        backdropFilter: 'blur(3px)',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)'
                    }
                }
            }}
        >
            <Box sx={modalStyle} ref={contentRef} onScroll={handleScroll}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: headerStyles.bgcolor,
                        color: headerStyles.color,
                        p: 1,
                        borderTopLeftRadius: theme.shape.borderRadius,
                        borderTopRightRadius: theme.shape.borderRadius,
                        borderBottom: headerStyles.borderBottom,
                        flexWrap: 'wrap',
                        textAlign: 'left',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: headerStyles.hoverBg,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            flex: 1,
                            color: headerStyles.color,
                            fontWeight: 600,
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {title}
                    </Typography>
                    <Tooltip title="Close" arrow>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: headerStyles.color,
                                backgroundColor: alpha(headerStyles.color, 0.1),
                                padding: theme.spacing(0.5),
                                '&:hover': {
                                    backgroundColor: alpha(headerStyles.color, 0.2),
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <CloseRounded />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider />

                <Box sx={{ p: isMobile ? 1 : 2 }}>
                    {children}
                </Box>
            </Box>
        </Modal>
    );
};

export default CustomModal;