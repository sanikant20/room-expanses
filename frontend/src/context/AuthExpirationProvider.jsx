import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import CustomDialog from '../components/custom/CustomDialog';
import { AuthExpirationContext } from './authExpirationContext';
import { useAuth } from './useAuth';

const INACTIVITY_TIMEOUT = 50 * 60 * 1000;

export const AuthExpirationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [isInactivityLogout, setIsInactivityLogout] = useState(false);
    const timerRef = useRef(null);

    const showExpirationDialog = useCallback(() => {
        setOpen(true);
    }, []);

    const hideExpirationDialog = useCallback(() => {
        setOpen(false);
        setIsInactivityLogout(false);
    }, []);

    const handleLogout = useCallback(() => {
        setOpen(false);
        setIsInactivityLogout(false);
        window.location.href = '/logout';
    }, []);

    const clearInactivityTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startInactivityTimer = useCallback(() => {
        clearInactivityTimer();
        timerRef.current = setTimeout(() => {
            setIsInactivityLogout(true);
            showExpirationDialog();
        }, INACTIVITY_TIMEOUT);
    }, [clearInactivityTimer, showExpirationDialog]);

    useEffect(() => {
        if (open && !isInactivityLogout) {
            const timer = setTimeout(handleLogout, 10000);
            return () => clearTimeout(timer);
        }
    }, [open, isInactivityLogout, handleLogout]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                startInactivityTimer();
            } else {
                clearInactivityTimer();
            }
        };

        const handleWindowBlur = () => startInactivityTimer();
        const handleWindowFocus = () => clearInactivityTimer();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            clearInactivityTimer();
        };
    }, [isAuthenticated, startInactivityTimer, clearInactivityTimer]);

    return (
        <AuthExpirationContext.Provider value={{ showExpirationDialog, hideExpirationDialog }}>
            {children}

            <CustomDialog
                open={open}
                title={isInactivityLogout ? "Session Expired" : "Session Ended"}
                content={
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography sx={{ fontSize: '1rem', color: 'text.primary', mb: 2 }}>
                            {isInactivityLogout
                                ? "Your session has expired due to inactivity."
                                : "Your session has been terminated."}
                        </Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {isInactivityLogout
                                ? "You were logged out because the tab was not in focus for more than 5 minutes."
                                : "You will be redirected to the login page in 10 seconds."}
                            {' '}Click <strong>Log In Again</strong> to continue.
                        </Typography>
                    </Box>
                }
                confirmText="Log In Again"
                hideCancelButton={isInactivityLogout}
                showCloseIcon={!isInactivityLogout}
                onConfirm={handleLogout}
                onCancel={hideExpirationDialog}
                type="warning"
                disableBackdropClick={isInactivityLogout}
                disableEscapeKeyDown={isInactivityLogout}
            />

        </AuthExpirationContext.Provider>
    );
};
