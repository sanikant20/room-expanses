import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    useTheme,
    Typography,
    Chip,
    Tooltip
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

const CustomImagePreview = ({ open, imageUrl, onClose, title = "" }) => {
    const theme = useTheme();

    // Check if it's a PDF - check the file extension
    const isPdf = imageUrl && imageUrl?.toLowerCase()?.endsWith('.pdf');

    // If it's a PDF, open in new tab immediately and close the dialog
    React.useEffect(() => {
        if (open && isPdf) {
            window.open(imageUrl, '_blank');
            onClose();
        }
    }, [open, isPdf, imageUrl, onClose]);

    // Don't show dialog for PDFs
    if (isPdf) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    py: 1,
                    px: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme.palette.primary.main,
                }}
            >
                <Typography variant="h6" noWrap sx={{ color: 'white' }}>
                    {title ? (
                        /^[A-Z][a-z]+(?:[A-Z][a-z]*)*$/.test(title) || /^[a-z]+(?:[A-Z][a-z]*)*$/.test(title)
                            ? title.split(/(?=[A-Z])/)?.join(" ")
                            : title
                    ) : "Image Preview"}
                </Typography>
                <Tooltip title="Close" arrow>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        <CloseRounded />
                    </IconButton>
                </Tooltip>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                    position: 'relative'
                }}
            >
                <Box
                    component="img"
                    src={imageUrl || '/noAvatar.svg'}
                    alt="Preview"
                    sx={{
                        maxHeight: '80vh',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        p: 1
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default CustomImagePreview;