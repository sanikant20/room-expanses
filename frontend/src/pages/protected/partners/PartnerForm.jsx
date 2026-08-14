import { Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { showFormikErrorsAsToast } from '../../../utils/formikHelpers';
import {
    Button,
    Grid,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import CustomFileUpload from '../../../components/custom/CustomFileUpload';
import { useCreatePartner, useUpdatePartner } from '../../../apis/partnerAPI/PartnerAPI';
import { NepaliDatePickerComponent } from '../../../components/date/NepaliDatePicker';
import { convertToBSFormat } from '../../../utils/dateConverter';

const PartnerForm = ({ selectedData, mode, onClose }) => {
    const queryClient = useQueryClient();

    const { mutate: createPartner, isPending: isCreating } = useCreatePartner();
    const { mutate: updatePartner, isPending: isUpdating } = useUpdatePartner();

    const validationSchema = yup.object({
        name: yup.string().required('Full name is required'),
        phone: yup.string(),
        email: yup.string().email('Invalid email address'),
        bsJoiningDate: yup.string(),
        status: yup.string().required('Status is required'),
        notes: yup.string(),
    });

    const initialValues = {
        name: selectedData?.name || '',
        phone: selectedData?.phone || '',
        email: selectedData?.email || '',
        image: selectedData?.image || '',
        bsJoiningDate: selectedData?.bsJoiningDate || '',
        status: selectedData?.status || 'active',
        notes: selectedData?.notes || '',
    };

    const handleSubmit = (values, { setSubmitting }) => {
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
                                <InputLabel htmlFor="status" required>Status</InputLabel>
                                <TextField
                                    id="status"
                                    name="status"
                                    select
                                    value={values.status}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.status && Boolean(errors.status)}
                                    helperText={touched.status && errors.status}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </TextField>
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
                                {values.bsJoiningDate && (
                                    <Typography variant="caption" color="primary.main">
                                        BS Date: {values.bsJoiningDate}
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>

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

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default PartnerForm;
