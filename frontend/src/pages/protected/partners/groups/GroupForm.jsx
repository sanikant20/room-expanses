import { Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { showFormikErrorsAsToast } from '../../../../utils/formikHelpers';
import {
    Box,
    Button,
    Chip,
    Grid,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { useCreateGroup, useUpdateGroup } from '../../../../apis/groupAPI/GroupAPI';
import { useGetPartners } from '../../../../apis/partnerAPI/PartnerAPI';
import { isPartnerAccount } from '../../../../helper/getAuthData';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const GroupForm = ({ selectedData, mode, onClose }) => {
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();

    const { data: partners } = useGetPartners({ status: 'all' });
    const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
    const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();

    const validationSchema = yup.object({
        name: yup.string().required('Group name is required'),
        description: yup.string(),
        partners: yup.array().min(1, 'At least one partner is required'),
    });

    const initialValues = {
        name: selectedData?.name || '',
        description: selectedData?.description || '',
        partners: (selectedData?.partners || []).map((p) => (typeof p === 'object' ? p?._id : p)),
    };

    const handleSubmit = (values, { setSubmitting }) => {
        if (isPartner) {
            setSubmitting(false);
            toast.error('You do not have permission to manage groups');
            onClose();
            return;
        }
        const onSuccess = (response) => {
            setSubmitting(false);
            if (response?.success) {
                toast.success(response?.message);
                queryClient.invalidateQueries({ queryKey: ['getGroups'] });
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
            name: values.name,
            description: values.description,
            partners: values.partners,
        };

        if (mode === 'edit') {
            updateGroup({ id: selectedData?._id, values: payload }, { onSuccess, onError });
        } else {
            createGroup({ values: payload }, { onSuccess, onError });
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, touched, errors, setTouched, validateForm, handleSubmit: formikSubmit, handleChange, handleBlur, isSubmitting, dirty }) => (
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
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="name" required>Group Name</InputLabel>
                                <TextField
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Kitchen Group"
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
                                <InputLabel htmlFor="description">Description</InputLabel>
                                <TextField
                                    id="description"
                                    name="description"
                                    placeholder="Short description"
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="partners" required>Partners</InputLabel>
                                <TextField
                                    id="partners"
                                    name="partners"
                                    select
                                    slotProps={{
                                        select: {
                                            multiple: true,
                                            renderValue: (selected) => (
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                    {selected.map((id) => {
                                                        const partner = (partners || []).find((p) => p._id === id);
                                                        return (
                                                            <Chip key={id} size="small" label={partner?.name || id} />
                                                        );
                                                    })}
                                                </Stack>
                                            ),
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                                        width: 250,
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    value={values.partners}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.partners && Boolean(errors.partners)}
                                    helperText={touched.partners && errors.partners}
                                >
                                    {(partners || []).map((partner) => (
                                        <MenuItem key={partner._id} value={partner._id}>
                                            {partner.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
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

export default GroupForm;
