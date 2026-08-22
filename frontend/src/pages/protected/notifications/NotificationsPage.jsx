import React, { useMemo } from 'react';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { CleaningServicesRounded, DeleteOutlineRounded, DeleteRounded, NotificationsRounded } from '@mui/icons-material';
import CustomCard from '../../../components/custom/CustomCard';
import DataTable from '../../../components/table/DataTable';
import CustomDialog from '../../../components/custom/CustomDialog';
import { useDeleteExpiredNotifications, useDeleteNotification, useGetNotifications } from '../../../apis/notificationAPI/NotificationAPI';
import { useDialogState } from '../../../hooks/useUIState';
import { convertToBSFormat } from '../../../utils/dateConverter';
import { toast } from 'react-toastify';

const retentionMs = 30 * 24 * 60 * 60 * 1000;

const isExpired = (n) => n.readAt && (Date.now() - new Date(n.readAt).getTime()) >= retentionMs;

const typeEmojiMap = {
    water: '💧',
    rice: '🍚',
    cleaning: '🧹',
    payment: '💰',
    settlement: '📊',
    'settlement-auto': '📊',
};

const defaultTypeEmoji = '🔔';

const NotificationsPage = () => {
    const { data, isLoading } = useGetNotifications({ status: 'read' });
    const rows = useMemo(() => data?.notifications || [], [data]);

    const dialog = useDialogState();
    const showDialog = dialog.show;
    const dialogType = dialog.dialogueType;

    const deleteMutation = useDeleteNotification();
    const bulkMutation = useDeleteExpiredNotifications();

    const expiredCount = useMemo(() => rows.filter(isExpired).length, [rows]);

    const columns = useMemo(() => [
        { key: 'sn', label: 'SN', render: (row, index) => index + 1 },
        {
            key: 'notification', label: 'Notification',
            render: (row) => (
                <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={700}>{row.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.message}</Typography>
                </Stack>
            ),
        },
        {
            key: 'type', label: 'Type',
            render: (row) => (
                <Typography variant="body2" fontSize="1.125rem">
                    {typeEmojiMap[row.type] || defaultTypeEmoji}
                </Typography>
            ),
        },
        {
            key: 'readAt', label: 'Read At',
            render: (row) => (
                <Typography variant="body2">
                    {row.readAt
                        ? `${convertToBSFormat(row.readAt)}, ${new Date(row.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                        : '—'}
                </Typography>
            ),
        },
        {
            key: 'actions', label: 'Actions', filterable: false,
            render: (row) => {
                const deletable = isExpired(row);
                return (
                    <Tooltip title={deletable ? 'Delete this notification' : 'Deletable 30 days after being read'}>
                        <span>
                            <IconButton
                                size="small"
                                color="error"
                                disabled={!deletable}
                                onClick={() => showDialog(row, 'single')}
                            >
                                <DeleteRounded color={deletable ? 'error' : 'disabled'} />
                            </IconButton>
                        </span>
                    </Tooltip>
                );
            },
        },
    ], [showDialog]);

    const dialogContent = dialog.open
        ? dialogType === 'single'
            ? `Delete "${dialog.data.title || 'this notification'}"? This cannot be undone.`
            : `This will permanently delete ${expiredCount} expired notification${expiredCount === 1 ? '' : 's'} past the 30-day retention period.`
        : '';

    const handleDeleteConfirm = () => {
        if (dialogType === 'single') {
            deleteMutation.mutate(
                { id: dialog.data._id },
                {
                    onSuccess: (res) => {
                        toast.success(res?.message || 'Notification deleted');
                        dialog.close();
                    },
                    onError: (error) => {
                        toast.error(error?.response?.data?.message || 'Failed to delete notification');
                        dialog.close();
                    },
                }
            );
        } else {
            bulkMutation.mutate(undefined, {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Expired notifications deleted');
                    dialog.close();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to delete expired notifications');
                    dialog.close();
                },
            });
        }
    };

    return (
        <CustomCard
            icon={<NotificationsRounded />}
            title="Read Notifications"
            subtitle="Notifications marked as read — deletable 30 days after reading"
        >
            <DataTable
                columns={columns}
                data={rows}
                loading={isLoading}
                download={{ enabled: false }}
                actions={
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CleaningServicesRounded color={expiredCount === 0 ? 'disabled' : 'error'} />}
                        disabled={expiredCount === 0}
                        onClick={() => showDialog({ count: expiredCount }, 'bulk')}
                        sx={{ textTransform: 'none' }}
                    >
                        Delete Expired ({expiredCount})
                    </Button>
                }
            />

            <CustomDialog
                open={dialog.open}
                title={dialogType === 'single' ? 'Delete Notification' : 'Delete Expired Notifications'}
                content={dialogContent}
                confirmText="Delete"
                loading={deleteMutation.isPending || bulkMutation.isPending}
                type="warning"
                onConfirm={handleDeleteConfirm}
                onCancel={dialog.close}
            />
        </CustomCard>
    );
};

export default NotificationsPage;
