import { useRef } from 'react';
import { toast } from 'react-toastify';

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * useCustomFileUpload
 *
 * A headless hook that provides:
 *  - `inputRef`   – attach to a hidden <input type="file"> to programmatically open the picker
 *  - `openPicker` – call this to trigger the file dialog (e.g. from a Camera button)
 *  - `handleFileInput` – pass as onChange to the hidden <input>
 *
 * @param {object}   options
 * @param {string}   [options.accept='image/*']       – MIME/extension filter
 * @param {number}   [options.maxSize=2*1024*1024]    – max bytes
 * @param {function} options.onFile(base64, file)     – called with base64 data-URL string and raw File
 */
const useCustomFileUpload = ({
    accept = 'image/*',
    maxSize = DEFAULT_MAX_SIZE,
    onFile,
} = {}) => {
    const inputRef = useRef(null);

    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const acceptedExtensions = accept
        ?.split(',')
        .map((ext) => ext.trim().toLowerCase().replace('.', ''))
        .filter(Boolean) ?? [];
    const isImage =
        accept === 'image/*' ||
        accept?.includes('image') ||
        acceptedExtensions.some((ext) => imageExtensions.includes(ext));
    const isPdf = accept?.includes('pdf');

    const validateAndRead = (file) => {
        if (!file) return;

        if (!file.type) {
            toast.warning('Unable to read file type');
            return;
        }

        if (isImage) {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            if (accept === 'image/*') {
                const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!validImageTypes.includes(file.type)) {
                    toast.warning('Please upload a valid image file (PNG, JPG, or JPEG)');
                    return;
                }
            } else if (acceptedExtensions.length && !acceptedExtensions.includes(ext)) {
                toast.warning('Please upload a file with an allowed type');
                return;
            }
        }

        if (isPdf && file.type !== 'application/pdf') {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf') {
                toast.warning('Only PDF files are allowed');
                return;
            }
        }

        if (file.size > maxSize) {
            const kb = maxSize / 1024;
            const label = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
            toast.warning(`File size must be less than ${label}`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            onFile?.(e.target.result, file);
        };
        reader.onerror = () => {
            toast.warning('Error reading file');
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (event) => {
        const file = event.target.files?.[0];
        validateAndRead(file);
        // reset so the same file can be re-selected
        event.target.value = '';
    };

    const openPicker = () => {
        inputRef.current?.click();
    };

    return { inputRef, openPicker, handleFileInput };
};

export default useCustomFileUpload;
