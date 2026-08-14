export const convertFileToBase64String = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result?.toString() || '';
            const stripped = result.replace(/^data:[^;]+;base64,/, '');
            resolve(stripped);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
