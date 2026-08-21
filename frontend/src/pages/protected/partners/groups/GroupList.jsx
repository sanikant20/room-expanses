import React, { useMemo } from 'react';
import CustomCard from '../../../../components/custom/CustomCard';
import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    GroupWorkRounded,
    ToggleOffRounded,
    ToggleOnRounded,
} from '@mui/icons-material';
import DataTable from '../../../../components/table/DataTable';
import { Avatar, AvatarGroup, Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useDialogState, useModalState } from '../../../../hooks/useUIState';
import CustomModal from '../../../../components/custom/CustomModal';
import CustomDialog from '../../../../components/custom/CustomDialog';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteGroup, useGetGroups, useUpdateGroup } from '../../../../apis/groupAPI/GroupAPI';
import { useIsPartner } from '../../../../context/authContext';
import GroupForm from './GroupForm';

const GroupList = () => {
    const queryClient = useQueryClient();
    const modal = useModalState();
    const dialog = useDialogState();
    const isPartner = useIsPartner();

    const { data: groups, isLoading } = useGetGroups();
    const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();
    const { mutate: updateGroup, isPending: isToggling } = useUpdateGroup();

    const columns = useMemo(() => {
        const actionColumn = {
            key: 'actions', label: 'Actions',
            render: (row) => (
                <Stack direction="row" spacing={1}>
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
        };

        const base = [
            { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
            {
                key: 'name', label: 'Group Name',
                render: (row) => <Typography variant="body2" fontWeight={600}>{row.name}</Typography>,
            },
            {
                key: 'description', label: 'Description',
                render: (row) => (
                    <Typography variant="body2" color="text.secondary">
                        {row.description || '—'}
                    </Typography>
                ),
            },
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
            {
                key: 'members', label: 'Members',
                render: (row) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AvatarGroup max={4} spacing="small">
                            {(row.partners || []).map((partner) => (
                                <Avatar
                                    key={partner._id}
                                    src={partner.image || '/noAvatar.svg'}
                                    alt={partner.name}
                                    sx={{ width: 28, height: 28 }}
                                >
                                    {partner.name?.charAt(0)}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary">
                            {row.partnerCount || 0} member{(row.partnerCount || 0) !== 1 ? 's' : ''}
                        </Typography>
                    </Stack>
                )
            },
            {
                key: 'expenseCount', label: 'Expenses',
                render: (row) => (
                    <Chip
                        label={row.expenseCount || 0}
                        size="small"
                        variant="outlined"
                        color="primary"
                    />
                )
            },
        ];

        return isPartner ? base : [actionColumn, ...base];
    }, [dialog, modal, isPartner]);

    const handleDialog = () => {
        const onSuccess = (response) => {
            if (response?.success) {
                queryClient.invalidateQueries({ queryKey: ['getGroups'] });
                toast.success(response?.message);
                dialog.close();
            } else {
                toast.error(response?.message);
            }
        };
        const onError = (error) => toast.error(error?.response?.data?.message);

        if (dialog.dialogueType === 'delete') {
            deleteGroup({ id: dialog.data?._id }, { onSuccess, onError });
        } else if (dialog.dialogueType === 'toggle') {
            updateGroup({
                id: dialog.data?._id,
                values: {
                    name: dialog.data?.name,
                    description: dialog.data?.description || '',
                    status: dialog.data?.status === 'active' ? 'inactive' : 'active',
                    partners: (dialog.data?.partners || []).map((p) => p?._id || p),
                },
            }, { onSuccess, onError });
        }
    };

    return (
        <CustomCard
            icon={<GroupWorkRounded />}
            title="Partner Groups"
            headerInline
            extra={
                !isPartner && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddRounded />}
                        onClick={modal.openAdd}
                    >
                        Partner Groups
                    </Button>
                )
            }
        >
            <DataTable
                columns={columns}
                data={groups || []}
                loading={isLoading}
                download={{ enabled: true, filename: 'Partner Groups List', excludeColumns: ['actions', 'sn', 'members'] }}
            />

            <CustomModal
                open={modal.open}
                onClose={modal.close}
                title={modal.mode === 'add' ? 'Add Group' : `Edit Group — ${modal.data?.name || ''}`}
                width={700}
            >
                <GroupForm
                    selectedData={modal.data}
                    mode={modal.mode}
                    onClose={modal.close}
                />
            </CustomModal>

            <CustomDialog
                open={dialog.open}
                title={
                    dialog.dialogueType === 'delete' ? 'Delete Group' : (
                        dialog.data?.status === 'active' ? 'Inactivate Group' : 'Activate Group'
                    )
                }
                content={
                    dialog.dialogueType === 'delete' ? (
                        <>Are you sure you want to delete <strong>"{dialog.data?.name}"</strong>? This action cannot be undone.</>
                    ) : dialog.data?.status === 'active' ? (
                        <>Are you sure you want to inactivate <strong>"{dialog.data?.name}"</strong>? New secondary expenses cannot be added to an inactive group.</>
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
        </CustomCard>
    );
};

export default GroupList;
