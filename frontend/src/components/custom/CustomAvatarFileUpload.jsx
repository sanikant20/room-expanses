import React from 'react'
import { IconButton, alpha, useTheme } from '@mui/material'
import { CameraAltRounded } from '@mui/icons-material'
import PropTypes from 'prop-types'
import useCustomFileUpload from '../../hooks/useCustomFileUpload'

const CustomAvatarFileUpload = ({ onFileChange }) => {
    const theme = useTheme()
    const { inputRef, openPicker, handleFileInput } = useCustomFileUpload({
        accept: 'image/*',
        maxSize: 500 * 1024,
        onFile: (_base64, file) => {
            onFileChange?.(file)
        },
    })

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileInput}
            />
            <IconButton
                size="small"
                onClick={openPicker}
                aria-label="Upload profile image"
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: theme.palette.primary.main,
                    color: 'common.white',
                    border: `2px solid ${theme.palette.background.paper}`,
                    width: 36,
                    height: 36,
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.85),
                    },
                }}
            >
                <CameraAltRounded sx={{ fontSize: 18 }} />
            </IconButton>
        </>
    )
}

CustomAvatarFileUpload.propTypes = {
    onFileChange: PropTypes.func,
}

export default CustomAvatarFileUpload
