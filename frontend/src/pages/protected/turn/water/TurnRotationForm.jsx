import { Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { showFormikErrorsAsToast } from '../../../../utils/formikHelpers';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import {
    ArrowDownwardRounded,
    ArrowUpwardRounded,
    DeleteRounded,
} from '@mui/icons-material';
import { useCreateTurn, useUpdateTurn, useGetTurnState } from '../../../../apis/turnAPI/TurnAPI';
import { useGetPartners } from '../../../../apis/partnerAPI/PartnerAPI';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const TurnRotationForm = ({ mode, type = 'water', onClose }) => {
    const queryClient = useQueryClient();
    const { data: turn } = useGetTurnState({ type });
    const { data: partners } = useGetPartners({ status: 'all' });
    const { mutate: createTurn, isPending: isCreating } = useCreateTurn();
    const { mutate: updateTurn, isPending: isUpdating } = useUpdateTurn();

    const existingIds = (turn?.rotation?.partners || []).map((p) => String(p._id));

    const initialValues = {
        partners: existingIds,
    };

    const validationSchema = yup.object({
        partners: yup.array().min(1, 'At least one partner is required'),
    });

    const move = (list, index, direction) => {
        const next = [...list];
        const target = index + direction;
        if (target < 0 || target >= next.length) return next;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
    };

    const handleSubmit = (values, { setSubmitting }) => {
        const onSuccess = (response) => {
            setSubmitting(false);
            if (response?.success) {
                toast.success(response?.message);
                queryClient.invalidateQueries({ queryKey: ['getTurnState', type] });
                queryClient.invalidateQueries({ queryKey: ['getTurnHistory', type] });
                onClose();
            } else {
                toast.error(response?.message || 'Operation failed');
            }
        };

        const onError = (error) => {
            setSubmitting(false);
            toast.error(error?.response?.data?.message || 'Something went wrong');
        };

        if (mode === 'edit' && turn?.rotation?._id) {
            updateTurn({ id: turn.rotation._id, type, partners: values.partners }, { onSuccess, onError });
        } else {
            createTurn({ type, partners: values.partners }, { onSuccess, onError });
        }
    };

    const renderOrderedEditor = ({ values, setFieldValue }) => {
        const selected = values.partners.map((id) => (partners || []).find((p) => String(p._id) === String(id))).filter(Boolean);
        const available = (partners || []).filter((p) => !selected.some((s) => String(s._id) === String(p._id)));

        return (
            <Stack spacing={2}>
                <Box>
                    <InputLabel htmlFor="add-partner">Add partner (in turn order)</InputLabel>
                    <TextField
                        id="add-partner"
                        select
                        value=""
                        onChange={(e) => {
                            const id = e.target.value;
                            if (id) {
                                setFieldValue('partners', [...values.partners, id]);
                            }
                        }}
                        slotProps={{
                            select: {
                                displayEmpty: true,
                                renderValue: () => 'Select a partner to add...',
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
                    >
                        {available.length === 0 && (
                            <MenuItem value="" disabled>All partners added</MenuItem>
                        )}
                        {available.map((partner) => (
                            <MenuItem key={partner._id} value={partner._id}>
                                {partner.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {selected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No partners in the rotation yet. Add at least one partner to begin.
                    </Typography>
                ) : (
                    <List dense disablePadding sx={{ border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2 }}>
                        {selected.map((partner, index) => (
                            <ListItem
                                key={partner._id}
                                secondaryAction={
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Move up">
                                            <span>
                                                <IconButton size="small" onClick={() => setFieldValue('partners', move(values.partners, index, -1))} disabled={index === 0}>
                                                    <ArrowUpwardRounded fontSize="small" color="primary" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Move down">
                                            <span>
                                                <IconButton size="small" onClick={() => setFieldValue('partners', move(values.partners, index, 1))} disabled={index === selected.length - 1}>
                                                    <ArrowDownwardRounded fontSize="small" color="primary" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <span>
                                                <IconButton size="small" onClick={() => setFieldValue('partners', values.partners.filter((id) => String(id) !== String(partner._id)))}>
                                                    <DeleteRounded fontSize="small" color="error" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={partner.image || '/noAvatar.svg'} sx={{ width: 36, height: 36 }}>
                                        {partner.name?.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={partner.name}
                                    secondary={index === 0 ? 'Turn #1 (starts here)' : `Turn #${index + 1}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#1976d2', 0.06), border: '1px dashed' }}>
                    <Typography variant="caption" color="text.secondary">
                        Partners are placed in turn order. The first active partner who has not yet fulfilled their turn in the
                        cycle is the current turn. Covering for an absent partner records the event but keeps the absent
                        partner pending.
                    </Typography>
                </Box>
            </Stack>
        );
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, errors, setFieldValue, validateForm, handleSubmit: formikSubmit, isSubmitting }) => (
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        validateForm().then((formErrors) => {
                            if (Object.keys(formErrors).length > 0) {
                                showFormikErrorsAsToast(formErrors);
                                return;
                            }
                            formikSubmit();
                        });
                    }}
                >
                    {renderOrderedEditor({ values, setFieldValue })}

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
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isCreating || isUpdating || isSubmitting || errors.partners}>
                                {mode === 'edit' ? (isUpdating ? 'Updating...' : 'Update') : (isCreating ? 'Creating...' : 'Create')}
                            </Button>
                        </Stack>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default TurnRotationForm;