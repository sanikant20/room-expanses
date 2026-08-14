import React, { useMemo } from 'react';
import CustomCard from '../../../components/custom/CustomCard';
import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    GroupsRounded,
    ToggleOffRounded,
    ToggleOnRounded,
    VisibilityRounded,
} from '@mui/icons-material';
import DataTable from '../../../components/table/DataTable';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useDialogState, useModalState, usePreviewState } from '../../../hooks/useUIState';
import CustomModal from '../../../components/custom/CustomModal';
import CustomDialog from '../../../components/custom/CustomDialog';
import CustomImagePreview from '../../../components/custom/CustomImagePreview';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
    useDeletePartner,
    useGetPartners,
    useTogglePartnerStatus,
} from '../../../apis/partnerAPI/PartnerAPI';
import PartnerForm from './PartnerForm';
import PartnerDetails from './PartnerDetails';

const Partners = () => {
    const queryClient = useQueryClient();
    const modal = useModalState();
    const dialog = useDialogState();
    const preview = usePreviewState();

    const { data: partners, isLoading } = useGetPartners({ status: 'all' });
    const { mutate: deletePartner, isPending: isDeleting } = useDeletePartner();
    const { mutate: togglePartnerStatus, isPending: isToggling } = useTogglePartnerStatus();

    const columns = useMemo(() => [
        {
            key: 'actions', label: 'Actions',
            render: (row) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="View">
                        <IconButton size="small" onClick={() => modal.openView(row)}>
                            <VisibilityRounded sx={{ color: 'primary.main' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => modal.openEdit(row)}>
                            <EditRounded sx={{ color: 'primary.main' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => dialog.show(row, 'delete')}>
                            <DeleteRounded sx={{ color: 'error.main' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={row?.status === 'active' ? 'Click to Inactivate' : 'Click to Activate'} arrow>
                        <IconButton size="small" onClick={() => dialog.show(row, 'toggle')}>
                            {row?.status === 'active' ? (
                                <ToggleOnRounded sx={{ color: 'primary.main' }} />
                            ) : (
                                <ToggleOffRounded sx={{ color: 'error.main' }} />
                            )}
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        {
            key: 'image', label: 'Image',
            render: (row) => (
                <Box
                    component="img"
                    src={row.image || '/noAvatar.svg'}
                    alt={row.name}
                    onError={(e) => { e.target.src = '/noAvatar.svg'; }}
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                    }}
                    onClick={() => preview.show(row.image || '/noAvatar.svg', row.name)}
                />
            )
        },
        {
            key: 'name', label: 'Name',
            render: (row) => <Typography variant="body2" fontWeight={600}>{row.name}</Typography>,
        },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'bsJoiningDate', label: 'Joining Date', },
        {
            key: 'status', label: 'Status',
            render: (row) => (
                <Chip
                    label={row.status === 'active' ? 'Active' : 'Inactive'}
                    color={row.status === 'active' ? 'success' : 'error'}
                    size="small"
                />
            )
        },
    ], [dialog, modal, preview]);

    const handleDialog = () => {
        const onSuccess = (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({ queryKey: ['getPartners'] });
                toast.success(response?.message);
                dialog.close();
            } else {
                toast.error(response?.message);
            }
        };
        const onError = (error) => toast.error(error?.response?.data?.message);

        if (dialog.dialogueType === 'delete') {
            deletePartner({ id: dialog.data?._id }, { onSuccess, onError });
        } else if (dialog.dialogueType === 'toggle') {
            togglePartnerStatus({
                id: dialog.data?._id,
                status: dialog.data?.status === 'active' ? 'inactive' : 'active',
            }, { onSuccess, onError });
        }
    };

    return (
        <CustomCard
            icon={<GroupsRounded />}
            title="Room Partners"
            extra={
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddRounded />}
                    onClick={modal.openAdd}
                >
                    Add Partner
                </Button>
            }
        >
            <DataTable
                columns={columns}
                data={partners || []}
                loading={isLoading}
                download={{ enabled: true, filename: 'Room Partners List', excludeColumns: ['actions', 'sn', 'image'] }}
            />

            <CustomModal
                open={modal.open}
                onClose={modal.close}
                title={
                    modal.mode === 'add' ? 'Add Partner'
                        : modal.mode === 'edit' ? 'Edit Partner'
                            : `Partner Details — ${modal.data?.name || ''}`
                }
                width={700}
            >
                {modal.mode === 'view' ? (
                    <PartnerDetails partner={modal.data} />
                ) : (
                    <PartnerForm
                        selectedData={modal.data}
                        mode={modal.mode}
                        onClose={modal.close}
                    />
                )}
            </CustomModal>

            <CustomDialog
                open={dialog.open}
                title={
                    dialog.dialogueType === 'delete' ? 'Delete Partner' : (
                        dialog.data?.status === 'active' ? 'Inactivate Partner' : 'Activate Partner'
                    )
                }
                content={
                    dialog.dialogueType === 'delete' ? (
                        <>Are you sure you want to delete <strong>"{dialog.data?.name}"</strong>? This action cannot be undone.</>
                    ) : dialog.data?.status === 'active' ? (
                        <>Are you sure you want to inactivate <strong>"{dialog.data?.name}"</strong>? Inactive partners are excluded from new expenses.</>
                    ) : (
                        <>Are you sure you want to activate <strong>"{dialog.data?.name}"</strong>?</>
                    )
                }
                confirmText={
                    dialog.dialogueType === 'delete' ? 'Delete' : (dialog.data?.status === 'active' ? 'Inactivate' : 'Activate')
                }
                cancelText="Cancel"
                onConfirm={handleDialog}
                onCancel={dialog.close}
                loading={isDeleting || isToggling}
                type={
                    dialog.dialogueType === 'delete' ? 'error' : (dialog.data?.status === 'active' ? 'error' : 'info')
                }
            />

            <CustomImagePreview
                open={preview.open}
                imageUrl={preview.imageUrl}
                onClose={preview.close}
                title={preview.title}
            />
        </CustomCard>
    );
};

export default Partners;
