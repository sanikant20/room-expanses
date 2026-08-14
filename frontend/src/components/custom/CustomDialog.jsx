import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Slide,
    CircularProgress,
    IconButton,
    Box,
    useTheme,
    useMediaQuery,
    Typography,
    Grow,
    styled
} from '@mui/material';
import { CheckCircleRounded, CloseRounded, ErrorRounded, InfoRounded, WarningAmberRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Slide animation
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Grow in ref={ref} {...props} />;
});

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadius,
        minWidth: 320,
    },
}));

const DialogHeader = styled(DialogTitle, {
    shouldForwardProp: (prop) => prop !== 'type',
})(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: theme.spacing(1.5, 2),
    paddingRight: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const IconContainer = styled(Box)(({ theme, type }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    color: 'white',
    background: type === 'warning' ? theme.palette.warning.main :
        type === 'error' ? theme.palette.error.main :
            type === 'success' ? theme.palette.success.main :
                type === 'info' ? theme.palette.info.main :
                    theme.palette.primary.main,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
}));

// Fixed: Remove isMobile from styled component and handle it differently
const StyledDialogActions = styled(DialogActions, {
    shouldForwardProp: (prop) => prop !== 'isMobile'
})(({ theme, isMobile }) => ({
    padding: theme.spacing(1, 2, 2, 2),
    gap: theme.spacing(1),
    flexDirection: isMobile ? 'column' : 'row',
    '& > *': {
        margin: '0 !important',
        flex: isMobile ? 1 : 'none',
        minWidth: 80,
    },
}));

// Fixed: Use shouldForwardProp to prevent ismobile from being passed to DOM
const ActionButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'ismobile'
})(({ theme, ismobile }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 2),
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '0.875rem',
    minHeight: 32,
    width: ismobile === 'true' ? '100%' : 'auto',
}));

const CustomDialog = ({
    open,
    title = 'Confirm Action',
    content = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    type = 'confirm', // 'confirm', 'info', 'warning', 'error', 'success'
    transition = true,
    hideCancelButton = false,
    confirmButtonColor = 'primary',
    maxWidth = 'xs',
    fullWidth = true,
    showCloseIcon = true,
    disableBackdropClick = false,
    disableEscapeKeyDown = false,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getIcon = () => {
        const iconProps = { sx: { fontSize: 16 } };
        switch (type) {
            case 'warning':
                return <WarningAmberRounded {...iconProps} />;
            case 'error':
                return <ErrorRounded {...iconProps} />;
            case 'success':
                return <CheckCircleRounded {...iconProps} />;
            case 'info':
                return <InfoRounded {...iconProps} />;
            default:
                return <WarningAmberRounded {...iconProps} />;
        }
    };

    const getConfirmButtonColor = () => {
        switch (type) {
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            case 'success':
                return 'success';
            case 'info':
                return 'info';
            default:
                return confirmButtonColor;
        }
    };

    const handleClose = (event, reason) => {
        if (disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
            return;
        }
        onCancel?.();
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            TransitionComponent={transition ? Transition : undefined}
            keepMounted
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {/* Header with Icon and Close Button */}
            <DialogHeader type={type}>
                <IconContainer type={type}>
                    {getIcon()}
                </IconContainer>
                <Typography
                    id="alert-dialog-title"
                    variant="subtitle1"
                    component="div"
                    sx={{
                        fontWeight: 600,
                        flex: 1,
                        fontSize: '1rem',
                    }}
                >
                    {title}
                </Typography>
                {showCloseIcon && (
                    <IconButton
                        aria-label={t('common.close', 'Close')}
                        onClick={onCancel}
                        disabled={loading}
                        size="small"
                        sx={{
                            width: 28,
                            height: 28,
                            color: theme.palette.text.secondary,
                        }}
                    >
                        <CloseRounded sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
            </DialogHeader>

            {/* Content */}
            <StyledDialogContent>
                <DialogContentText
                    id="alert-dialog-description"
                    component="div"
                    sx={{
                        p: 1,
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                    }}
                >
                    {content}
                </DialogContentText>
            </StyledDialogContent>

            {/* Actions */}
            <StyledDialogActions isMobile={isMobile}>
                {!hideCancelButton && (
                    <ActionButton
                        onClick={onCancel}
                        disabled={loading}
                        variant="outlined"
                        size="small"
                        ismobile={isMobile.toString()}
                        sx={{
                            order: isMobile ? 2 : 1,
                        }}
                    >
                        {cancelText || t('button.cancel', 'Cancel')}
                    </ActionButton>
                )}
                <ActionButton
                    onClick={onConfirm}
                    color={getConfirmButtonColor()}
                    variant="contained"
                    size="small"
                    disabled={loading}
                    ismobile={isMobile.toString()}
                    startIcon={
                        loading ? (
                            <CircularProgress size={14} sx={{ color: 'inherit' }} />
                        ) : null
                    }
                    sx={{
                        order: isMobile ? 1 : 2,
                        color: theme.palette.primary.contrastText,
                    }}
                >
                    {loading ? t('button.processing', 'Processing...') : (confirmText || t('button.confirm', 'Confirm'))}
                </ActionButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default CustomDialog;