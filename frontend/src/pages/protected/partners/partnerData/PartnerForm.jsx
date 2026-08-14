import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { showFormikErrorsAsToast } from '../../../../utils/formikHelpers';
import {
    Box,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material';
import CustomFileUpload from '../../../../components/custom/CustomFileUpload';
import { useCreatePartner, useUpdatePartner } from '../../../../apis/partnerAPI/PartnerAPI';
import { NepaliDatePickerComponent } from '../../../../components/date/NepaliDatePicker';
import { convertToBSFormat } from '../../../../utils/dateConverter';
import { getCurrentBsDate } from '../../../../utils/nepaliDate';
import { isPartnerAccount } from '../../../../helper/getAuthData';

const PartnerForm = ({ selectedData, mode, onClose }) => {
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: createPartner, isPending: isCreating } = useCreatePartner();
    const { mutate: updatePartner, isPending: isUpdating } = useUpdatePartner();

    const validationSchema = yup.object({
        name: yup.string().required('Full name is required'),
        phone: yup.string(),
        email: yup.string().email('Invalid email address'),
        bsJoiningDate: yup.string(),
        notes: yup.string(),
        password: yup.string().min(6, 'Password must be at least 6 characters'),
    });

    const initialValues = {
        name: selectedData?.name || '',
        phone: selectedData?.phone || '',
        email: selectedData?.email || '',
        image: selectedData?.image || '',
        bsJoiningDate: selectedData?.bsJoiningDate || (mode !== 'edit' ? getCurrentBsDate() : ''),
        notes: selectedData?.notes || '',
        password: '',
    };

    const handleSubmit = (values, { setSubmitting }) => {
        if (isPartner) {
            setSubmitting(false);
            toast.error('You do not have permission to manage partners');
            onClose();
            return;
        }
        const onSuccess = (response) => {
            setSubmitting(false);
            if (response?.success) {
                toast.success(response?.message);
                queryClient.invalidateQueries({ queryKey: ['getPartners'] });
                onClose();
            } else {
                toast.error(response?.message || 'Operation failed');
            }
        };

        const onError = (error) => {
            setSubmitting(false);
            toast.error(error?.response?.data?.message || 'Something went wrong');
        };

        const payload = {
            ...values,
        };

        if (mode === 'edit') {
            updatePartner({ id: selectedData?._id, values: payload }, { onSuccess, onError });
        } else {
            createPartner({ values: payload }, { onSuccess, onError });
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, touched, errors, setTouched, setFieldValue, validateForm, handleSubmit: formikSubmit, handleChange, handleBlur, isSubmitting, dirty }) => (
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        validateForm().then((formErrors) => {
                            if (Object.keys(formErrors).length > 0) {
                                showFormikErrorsAsToast(formErrors);
                                setTouched(
                                    Object.keys(formErrors).reduce((acc, key) => {
                                        acc[key] = true;
                                        return acc;
                                    }, {})
                                );
                                return;
                            }
                            formikSubmit();
                        });
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <CustomFileUpload
                                name="image"
                                label="Profile Image"
                                value={values.image}
                                onChange={(val) => setFieldValue('image', val)}
                                onBlur={handleBlur}
                                compact
                                maxSize={500 * 1024}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="name" required>Full Name</InputLabel>
                                <TextField
                                    id="name"
                                    name="name"
                                    placeholder="Full Name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="phone">Phone Number</InputLabel>
                                <TextField
                                    id="phone"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={values.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.phone && Boolean(errors.phone)}
                                    helperText={touched.phone && errors.phone}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <TextField
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <InputLabel required={false}>Joining Date</InputLabel>
                                <NepaliDatePickerComponent
                                    value={values.bsJoiningDate || ''}
                                    onChange={(result) => {
                                        let bs = '';
                                        if (result && typeof result === 'object') {
                                            bs = result.bsDate || (result.adDate ? convertToBSFormat(result.adDate) : '');
                                        } else {
                                            bs = convertToBSFormat(result) || '';
                                        }
                                        setFieldValue('bsJoiningDate', bs || '');
                                    }}
                                    label=""
                                    error={touched.bsJoiningDate && Boolean(errors.bsJoiningDate)}
                                    helperText={touched.bsJoiningDate && errors.bsJoiningDate}
                                />
                            </Stack>
                        </Grid>

                        {mode !== 'edit' && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <TextField
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Leave blank to auto-set to phone number"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={
                                            (touched.password && errors.password) ||
                                            "Defaults to the partner's phone number."
                                        }
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            edge="end"
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Stack>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="notes">Notes</InputLabel>
                                <TextField
                                    id="notes"
                                    name="notes"
                                    placeholder="Notes"
                                    value={values.notes}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    multiline
                                    rows={2}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            mx: { xs: -1, md: -2 },
                            px: { xs: 1, md: 2 },
                            py: 1,
                            mt: 1,
                            backgroundColor: 'background.paper',
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button variant="outlined" onClick={onClose}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isCreating || isUpdating || isSubmitting || !dirty}
                            >
                                {mode === 'edit' ? (
                                    isCreating || isUpdating ? 'Updating...' : 'Update'
                                ) : (
                                    isCreating || isUpdating ? 'Creating...' : 'Create'
                                )}
                            </Button>
                        </Stack>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default PartnerForm;
