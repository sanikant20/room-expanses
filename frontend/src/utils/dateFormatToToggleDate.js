import NepaliDate from 'nepali-date';

export const dateFormatToToggledDate = (input, useNepali = false) => {
    if (!input) return '';

    let date = input instanceof Date ? input : new Date(input);

    if (isNaN(date.getTime())) {
        const match = typeof input === 'string' && input.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [_, year, month, day] = match;
            date = new Date(`${year}-${month}-${day}T00:00:00`);
        }
    }

    if (isNaN(date.getTime())) {
        return '';
    }

    if (useNepali) {
        const nepDate = new NepaliDate(date);
        return nepDate.format('YYYY-MM-DD');
    } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
