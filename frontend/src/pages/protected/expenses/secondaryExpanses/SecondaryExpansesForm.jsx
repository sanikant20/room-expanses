import { Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { showFormikErrorsAsToast } from '../../../../utils/formikHelpers';
import { getCurrentBsDate } from '../../../../utils/nepaliDate';
import {
    Box,
    Button,
    Chip,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { NepaliDatePickerComponent } from '../../../../components/date/NepaliDatePicker';
import { useCreateExpense, useUpdateExpense } from '../../../../apis/expenseAPI/ExpenseAPI';
import { getAuthData, isPartnerAccount } from '../../../../helper/getAuthData';

const SecondaryExpansesForm = ({
    mode,
    selectedData,
    onClose,
    activePartners = [],
    groups = [],
    defaultGroup = '',
}) => {
    const queryClient = useQueryClient();
    const isPartner = isPartnerAccount();
    const selfId = getAuthData()?._id;

    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();

    const defaultGroupId = selectedData?.group?._id || selectedData?.group || defaultGroup || '';
    const defaultGroupDoc = groups.find((g) => g._id === defaultGroupId);
    const defaultGroupPartnerIds = (defaultGroupDoc?.partners || []).map((p) => p?._id || p);
    const existingPartners = (selectedData?.applicablePartners || []).map((p) => p?._id || p);

    const validationSchema = yup.object({
        title: yup.string().required('Item name is required'),
        amount: yup.number().positive('Cost must be greater than zero').required('Cost is required'),
        bsDate: yup.string().required('Date is required'),
        group: yup.string().required('Select a group for this expense'),
        applicablePartners: yup.array().min(1, 'Select at least one partner to apply this expense to'),
        paidBy: isPartner
            ? yup.string()
            : yup.string().required('Select who paid for this expense'),
    });

    const initialValues = {
        title: selectedData?.title || '',
        amount: selectedData?.amount ?? '',
        bsDate: selectedData?.bsDate || getCurrentBsDate(),
        group: defaultGroupId,
        applicablePartners: existingPartners.length ? existingPartners : defaultGroupPartnerIds,
        paidBy: isPartner ? selfId || '' : (selectedData?.paidBy?._id || selectedData?.paidBy || ''),
    };

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['getExpenses'] });
        queryClient.invalidateQueries({ queryKey: ['getDashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['getSettlement'] });
        queryClient.invalidateQueries({ queryKey: ['getMonthlyReport'] });
    };

    const handleSubmit = (values, { setSubmitting }) => {
        const onSuccess = (response) => {
            setSubmitting(false);
            if (response?.success) {
                toast.success(response?.message);
                invalidateAll();
                onClose();
            } else {
                toast.error(response?.message || 'Operation failed');
            }
        };

        const onError = (error) => {
            setSubmitting(false);
            toast.error(error?.response?.data?.message || 'Something went wrong');
        };

        const applicablePartners = isPartner && !values.applicablePartners.includes(selfId)
            ? [...values.applicablePartners, selfId]
            : values.applicablePartners;

        const payload = {
            title: String(values.title).trim(),
            amount: Number(values.amount),
            category: 'secondary',
            group: values.group,
            paidBy: isPartner ? selfId : values.paidBy,
            applicablePartners: applicablePartners.filter(Boolean),
            bsDate: values.bsDate,
        };

        if (mode === 'edit') {
            updateExpense({ id: selectedData?._id, values: payload }, { onSuccess, onError });
        } else {
            createExpense({ values: payload }, { onSuccess, onError });
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, touched, errors, setTouched, setFieldValue, validateForm, handleSubmit: formikSubmit, handleChange, handleBlur, isSubmitting, dirty }) => {
                const groupPartners = values.group
                    ? (groups.find((g) => g._id === values.group)?.partners || [])
                    : [];
                const availablePartners = groupPartners.length ? groupPartners : activePartners;
                const applicablePartnerDocs = (values.applicablePartners || [])
                    .map((id) => availablePartners.find((p) => p._id === id))
                    .filter(Boolean);
                const paidByOptions = [...applicablePartnerDocs];
                if (values.paidBy && !paidByOptions.some((p) => p._id === values.paidBy)) {
                    const fallback = activePartners.find((p) => p._id === values.paidBy);
                    if (fallback) paidByOptions.push(fallback);
                }

                return (
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
                                    <InputLabel htmlFor="title" required>Item Name</InputLabel>
                                    <TextField
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Grocery, Electricity bill"
                                        value={values.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="amount" required>Cost</InputLabel>
                                    <TextField
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        placeholder="0"
                                        value={values.amount}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.amount && Boolean(errors.amount)}
                                        helperText={touched.amount && errors.amount}
                                    />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <NepaliDatePickerComponent
                                    value={values.bsDate}
                                    onChange={(result) => setFieldValue('bsDate', result?.bsDate || '')}
                                    label="Date"
                                    required
                                    error={touched.bsDate && Boolean(errors.bsDate)}
                                    helperText={touched.bsDate && errors.bsDate}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="group" required>Group</InputLabel>
                                    <TextField
                                        id="group"
                                        name="group"
                                        select
                                        value={values.group}
                                        onChange={(e) => {
                                            handleChange(e);
                                            const group = groups.find((g) => g._id === e.target.value);
                                            if (group) {
                                                setFieldValue(
                                                    'applicablePartners',
                                                    (group.partners || []).map((p) => p?._id || p)
                                                );
                                            }
                                        }}
                                        onBlur={handleBlur}
                                        error={touched.group && Boolean(errors.group)}
                                        helperText={touched.group && errors.group}
                                    >
                                        {groups.map((g) => (
                                            <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            </Grid>

                            {isPartner ? (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={1}>
                                        <InputLabel>Paid By</InputLabel>
                                        <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                                            You
                                        </Typography>
                                    </Stack>
                                </Grid>
                            ) : (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="paidBy" required>Paid By</InputLabel>
                                        <TextField
                                            id="paidBy"
                                            name="paidBy"
                                            select
                                            value={values.paidBy}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.paidBy && Boolean(errors.paidBy)}
                                            helperText={touched.paidBy && errors.paidBy}
                                        >
                                            <MenuItem value="" disabled>Paid by…</MenuItem>
                                            {paidByOptions.map((p) => (
                                                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Stack>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="applicablePartners" required>Apply To</InputLabel>
                                    <Box
                                        id="applicablePartners"
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 0.5,
                                            alignItems: 'center',
                                            minHeight: 40,
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: errors.applicablePartners ? 'error.main' : 'divider',
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        {applicablePartnerDocs.length ? (
                                            applicablePartnerDocs.map((p) => (
                                                <Chip key={p._id} size="small" label={p.name} />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No partners selected
                                            </Typography>
                                        )}
                                    </Box>
                                    {(touched.applicablePartners && errors.applicablePartners) && (
                                        <FormHelperText error>{errors.applicablePartners}</FormHelperText>
                                    )}
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
                );
            }}
        </Formik>
    );
};

export default SecondaryExpansesForm;
