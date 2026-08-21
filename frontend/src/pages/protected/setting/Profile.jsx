import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Grid,
    Typography,
    Avatar,
    Chip,
    Stack,
    TextField,
    InputLabel,
    Button,
    CircularProgress,
    alpha,
    useTheme,
} from '@mui/material';
import {
    EmailTwoTone,
    PhoneTwoTone,
    BadgeTwoTone,
    FingerprintTwoTone,
    InfoTwoTone,
    AdminPanelSettingsTwoTone,
    CalendarTodayTwoTone,
    AccessTimeTwoTone,
    HistoryTwoTone,
    EditTwoTone,
    CloseRounded,
    SaveRounded,
    PersonPinTwoTone,
    AdminPanelSettingsRounded,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuthData, useIsPartner, useAuth } from '../../../context/authContext';
import { useUpdateProfile } from '../../../apis/authApi/AuthAPI';
import CustomCard from '../../../components/custom/CustomCard';
import CustomAvatarFileUpload from '../../../components/custom/CustomAvatarFileUpload';
import { convertToBSFormat } from '../../../utils/dateConverter';

const Profile = () => {
    const theme = useTheme();
    const authData = useAuthData();
    const isPartner = useIsPartner();
    const { setIsAuthenticated } = useAuth();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [imageFile, setImageFile] = useState(null);
    const previewUrlRef = useRef(null);

    const roleLabel = isPartner ? 'Partner' : 'Admin';
    const RoleChipIcon = isPartner ? PersonPinTwoTone : AdminPanelSettingsRounded;
    const roleRowIcon = isPartner ? PersonPinTwoTone : AdminPanelSettingsTwoTone;

    useEffect(() => {
        if (!isEditing) {
            setForm({ name: authData?.name || '', phone: authData?.phone || '' });
            setImageFile(null);
        }
    }, [authData, isEditing]);

    useEffect(() => () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    }, []);

    const handleFileChange = (file) => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setImageFile(file);
        setIsEditing(true);
    };

    const avatarSrc = imageFile ? previewUrlRef.current : authData?.image || '';

    const startEditing = () => {
        setForm({ name: authData?.name || '', phone: authData?.phone || '' });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
        setImageFile(null);
        setIsEditing(false);
    };

    const handleSave = () => {
        if (!form.name?.trim()) {
            toast.warning('Name is required');
            return;
        }

        const formData = new FormData();
        formData.append('name', form.name.trim());
        if (form.phone) formData.append('phone', form.phone);
        if (imageFile) formData.append('image', imageFile);

        updateProfile(
            { formData },
            {
                onSuccess: async (response) => {
                    if (response?.success) {
                        toast.success(response?.message || 'Profile updated successfully');
                        await setIsAuthenticated(true);
                        cancelEditing();
                    } else {
                        toast.error(response?.message || 'Failed to update profile');
                    }
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || 'Failed to update profile');
                },
            }
        );
    };

    const joiningDate = isPartner && authData?.bsJoiningDate
        ? authData.bsJoiningDate
        : convertToBSFormat(authData?.createdAt);


    const InfoRow = ({ label, value, icon: Icon }) => (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
            {Icon && <Icon sx={{ fontSize: 18, color: theme.palette.primary.main, mt: 0.3 }} />}
            <Typography variant="body2" sx={{ minWidth: 130, fontWeight: 600, color: 'text.secondary' }}>
                {label}:
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, color: 'text.primary', fontWeight: 500 }}>
                {value || '-'}
            </Typography>
        </Stack>
    );

    return (
        <Container maxWidth="lg">
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    borderRadius: 2,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: alpha(theme.palette.common.white, 0.1),
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        background: alpha(theme.palette.common.white, 0.05),
                    }
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <Avatar
                            src={avatarSrc}
                            alt={form.name || authData?.name}
                            sx={{
                                width: 120,
                                height: 120,
                                border: '4px solid white',
                                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
                                bgcolor: theme.palette.primary.light,
                                fontSize: 48,
                                fontWeight: 700,
                            }}
                        >
                            {(form.name || authData?.name)?.charAt(0) || 'U'}
                        </Avatar>
                        {imageFile && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    border: `3px dashed ${theme.palette.warning.light}`,
                                }}
                            />
                        )}
                        <CustomAvatarFileUpload onFileChange={handleFileChange} />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {form.name || authData?.name || 'User'}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                            <Chip
                                icon={<RoleChipIcon sx={{ fontSize: 16 }} />}
                                label={roleLabel}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                            {joiningDate && (
                                <Chip
                                    icon={<HistoryTwoTone sx={{ fontSize: 16 }} />}
                                    label={`Joined: ${joiningDate}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                            User ID: {authData?._id || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                            Email: {authData?.email || '-'}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard
                        icon={<InfoTwoTone fontSize="small" />}
                        title={isEditing ? 'Edit Profile' : 'Basic Information'}
                        extra={
                            !isEditing && (
                                <Button size="small" startIcon={<EditTwoTone />} onClick={startEditing}>
                                    Edit
                                </Button>
                            )
                        }
                    >
                        {isEditing ? (
                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="name" required>Full Name</InputLabel>
                                        <TextField
                                            id="name"
                                            name="name"
                                            placeholder="Full Name"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            error={!form.name?.trim()}
                                            helperText={!form.name?.trim() ? 'Name is required' : ''}
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
                                            value={form.phone}
                                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="email">Email</InputLabel>
                                        <TextField
                                            id="email"
                                            name="email"
                                            value={authData?.email || ''}
                                            disabled
                                            helperText="Email cannot be changed"
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            startIcon={<CloseRounded />}
                                            onClick={cancelEditing}
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                                            onClick={handleSave}
                                            disabled={isPending}
                                        >
                                            {isPending ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        ) : (
                            <>
                                <InfoRow label="Full Name" value={authData?.name} icon={BadgeTwoTone} />
                                <InfoRow label="Email" value={authData?.email} icon={EmailTwoTone} />
                                <InfoRow label="Phone" value={authData?.phone} icon={PhoneTwoTone} />
                            </>
                        )}
                    </CustomCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomCard icon={<FingerprintTwoTone fontSize="small" />} title="Account Details">
                        <InfoRow label="Role" value={roleLabel} icon={roleRowIcon} />
                        <InfoRow label="Joined On" value={joiningDate} icon={CalendarTodayTwoTone} />
                        <InfoRow label="Today's Date" value={convertToBSFormat(new Date()) || '-'} icon={AccessTimeTwoTone} />
                    </CustomCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
