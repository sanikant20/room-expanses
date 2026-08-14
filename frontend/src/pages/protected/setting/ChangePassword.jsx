import React, { useState } from 'react'
import CustomCard from '../../../components/custom/CustomCard'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { Grid, TextField, Button, Box, InputLabel, Stack, IconButton, InputAdornment } from '@mui/material'
import { ArrowBackTwoTone, KeyRounded, KeyTwoTone, Visibility, VisibilityOff, VisibilityOffTwoTone, VisibilityTwoTone } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useChangePassword } from '../../../apis/authAPI/AuthAPI'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const initialValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
}

const validationSchema = yup.object({
    oldPassword: yup.string().required('Old Password is required'),
    newPassword: yup.string()
        .required('New Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        )
        .notOneOf([yup.ref('oldPassword')], 'New password must be different from old password'),
    confirmPassword: yup.string()
        .required('Confirm Password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
})

const ChangePassword = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const { mutate: changePassword } = useChangePassword();

    const handleClickShowPassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleChangePassword = (values, { setSubmitting }) => {
        // console.log('Password change submitted:', values)
        changePassword({ values }, {
            onSuccess: (res) => {
                if (res?.success) {
                    toast.success(res?.message || 'Password changed successfully');
                    navigate('/logout');
                } else {
                    toast.error(res?.message || 'Operation failed');
                }
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Something went wrong');
            },
            onSettled: () => {
                setSubmitting(false);
            }
        });
    }

    return (
        <CustomCard title={t('settings.changePassword', 'Change Password')}
            sx={{ maxWidth: 500, mx: 'auto' }}
            icon={<KeyTwoTone />}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleChangePassword}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting, dirty }) => (
                    <Form>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 12 }}>
                                <Stack spacing={0.5}>
                                    <InputLabel htmlFor="oldPassword" required>{t('changePassword.oldPassword', 'Old Password')}</InputLabel>
                                    <TextField
                                        fullWidth
                                        name="oldPassword"
                                        type={showPassword.oldPassword ? 'text' : 'password'}
                                        size='small'
                                        value={values.oldPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.oldPassword && Boolean(errors.oldPassword)}
                                        helperText={touched.oldPassword && errors.oldPassword}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle old password visibility"
                                                            onClick={() => handleClickShowPassword('oldPassword')}
                                                            onMouseDown={handleMouseDownPassword}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword.oldPassword ? <VisibilityOffTwoTone /> : <VisibilityTwoTone />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Stack spacing={0.5}>
                                    <InputLabel htmlFor="newPassword" required>{t('changePassword.newPassword', 'New Password')}</InputLabel>
                                    <TextField
                                        fullWidth
                                        name="newPassword"
                                        type={showPassword.newPassword ? 'text' : 'password'}
                                        size='small'
                                        value={values.newPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.newPassword && Boolean(errors.newPassword)}
                                        helperText={touched.newPassword && errors.newPassword}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle new password visibility"
                                                            onClick={() => handleClickShowPassword('newPassword')}
                                                            onMouseDown={handleMouseDownPassword}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Stack spacing={0.5}>
                                    <InputLabel htmlFor="confirmPassword" required>{t('changePassword.confirmNewPassword', 'Confirm New Password')}</InputLabel>
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        type={showPassword.confirmPassword ? 'text' : 'password'}
                                        size='small'
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                        helperText={touched.confirmPassword && errors.confirmPassword}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle confirm password visibility"
                                                            onClick={() => handleClickShowPassword('confirmPassword')}
                                                            onMouseDown={handleMouseDownPassword}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        disabled={isSubmitting}
                                        onClick={() => navigate(-1)}
                                        startIcon={<ArrowBackTwoTone />}
                                    >
                                        {t('button.cancel', 'Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={!dirty|| isSubmitting}
                                        startIcon={<KeyTwoTone />}
                                    >
                                        {isSubmitting ? t('changePassword.changing', 'Changing...') : t('settings.changePassword', 'Change Password')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </CustomCard>
    )
}

export default ChangePassword