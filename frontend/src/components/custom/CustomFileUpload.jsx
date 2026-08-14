import React, { useRef, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    FormHelperText,
    InputLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    CloudUploadRounded,
    CloseRounded,
    InsertDriveFileRounded,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (name) => {
    return name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 2).toUpperCase();
};

const CustomFileUpload = ({
    name,
    value,
    onChange,
    accept = 'image/*',
    maxSize = 500 * 1024,
    label,
    required = false,
    error,
    helperText,
    disabled = false,
    compact = false,
}) => {
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');

    const isImage = accept === 'image/*' || accept?.includes('image');
    const isPdf = accept?.includes('pdf');
    const previewUrl = isImage && value ? value : null;

    const validateAndSetFile = (file) => {
        if (!file) return;

        if (!file.type) {
            toast.warning('Unable to read file type');
            return;
        }

        if (isImage) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                toast.warning('Please upload a valid image file (PNG, JPG, or JPEG)');
                return;
            }
        }

        if (isPdf) {
            if (file.type !== 'application/pdf') {
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (ext !== 'pdf') {
                    toast.warning('Only PDF files are allowed');
                    return;
                }
            }
        }

        if (file.size > maxSize) {
            toast.warning(`File size must be less than ${formatFileSize(maxSize)}`);
            return;
        }

        setFileName(file.name);
        setFileType(isPdf ? 'PDF' : getFileExtension(file.name));

        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.result);
        };
        reader.onerror = () => {
            toast.warning('Error reading file');
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        validateAndSetFile(file);
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        validateAndSetFile(file);
    };

    const handleRemove = () => {
        onChange('');
        setFileName('');
        setFileType('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Stack spacing={0.5}>
            {label && <InputLabel htmlFor={name} required={required}>{label}</InputLabel>}
            <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={accept}
                onChange={handleFileInput}
            />

            {value ? (
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-block',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {isImage && previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="Preview"
                            sx={{
                                width: compact ? 100 : 160,
                                height: compact ? 100 : 120,
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    ) : (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                px: 2,
                                py: 1.5,
                                minWidth: compact ? 100 : 180,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <InsertDriveFileRounded color="error" sx={{ fontSize: 32 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: compact ? 80 : 140 }}>
                                    {fileName || 'File'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {fileType} • {formatFileSize(value.length * 0.75)}
                                </Typography>
                            </Box>
                        </Stack>
                    )}

                    <IconButton
                        size="small"
                        onClick={handleRemove}
                        disabled={disabled}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: alpha(theme.palette.grey[900], 0.6),
                            color: 'common.white',
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.9) },
                        }}
                    >
                        <CloseRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            ) : (
                <Box
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                        border: '2px dashed',
                        borderColor: error ? 'error.main' : isDragging ? 'primary.main' : 'grey.300',
                        borderRadius: 1.5,
                        bgcolor: isDragging ? 'action.hover' : 'grey.50',
                        cursor: disabled ? 'default' : 'pointer',
                        textAlign: 'center',
                        px: 2,
                        py: compact ? 1.5 : 2.5,
                        transition: 'all 0.2s ease',
                        '&:hover': disabled ? {} : {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                        ...theme.applyStyles('dark', {
                            borderColor: error ? 'error.main' : isDragging ? 'primary.main' : 'grey.700',
                            bgcolor: isDragging ? 'action.hover' : 'grey.900',
                            '&:hover': disabled ? {} : {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover',
                            },
                        }),
                    }}
                >
                    <CloudUploadRounded
                        sx={{
                            fontSize: compact ? 28 : 36,
                            color: isDragging ? 'primary.main' : 'grey.400',
                            mb: 0.5,
                        }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Click to upload
                        </Box>
                        {' '}or drag and drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {isPdf ? 'PDF' : isImage ? 'PNG, JPG, JPEG' : accept} • Max {formatFileSize(maxSize)}
                    </Typography>
                </Box>
            )}

            {error && (
                <FormHelperText error sx={{ ml: 1.5, mt: 0.5 }}>
                    {error}
                </FormHelperText>
            )}
            {!error && helperText && (
                <FormHelperText sx={{ ml: 1.5, mt: 0.5 }}>
                    {helperText}
                </FormHelperText>
            )}
        </Stack>
    );
};

export default CustomFileUpload;
